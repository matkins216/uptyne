// app/api/monitors/route.ts
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

function calculateUptime(checks: any[]) {
  if (!checks || checks.length === 0) return 100;
  const upChecks = checks.filter(check => check.status === 'up').length;
  return Math.round((upChecks / checks.length) * 100);
}

// Helper function to check subscription status
async function checkSubscriptionStatus(userId: string) {
  try {
    const supabase = createRouteHandlerClient();
    
    // Get current monitor count
    const { count: currentMonitorCount, error: countError } = await supabase
      .from('monitors')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      console.error('Error counting monitors:', countError);
    }
    
    // Get user's Stripe customer ID from Supabase
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (!profile?.stripe_customer_id) {
      return { 
        subscription: null, 
        isBasicMember: false,
        canAddMoreMonitors: false,
        maxMonitors: 3,
        currentMonitorCount: currentMonitorCount || 0
      };
    }

    // Get subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'active',
      expand: ['data.default_payment_method'],
    });

    const activeSubscription = subscriptions.data[0];
    
    if (!activeSubscription) {
      return { 
        subscription: null, 
        isBasicMember: false,
        canAddMoreMonitors: false,
        maxMonitors: 3,
        currentMonitorCount: currentMonitorCount || 0
      };
    }

    // Check if it's a basic plan
    const isBasicMember = activeSubscription.items.data.some(item => 
      item.price.product === process.env.STRIPE_BASIC_PRODUCT_ID
    );

    // Basic members can have more than 5 monitors
    const canAddMoreMonitors = isBasicMember;
    const maxMonitors = isBasicMember ? 50 : 3;

    return {
      subscription: {
        id: activeSubscription.id,
        status: activeSubscription.status,
        items: activeSubscription.items.data.map(item => ({
          product: item.price.product,
          quantity: item.quantity,
        })),
      },
      isBasicMember,
      canAddMoreMonitors,
      maxMonitors,
      currentMonitorCount: currentMonitorCount || 0
    };
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return { 
      subscription: null, 
      isBasicMember: false,
      canAddMoreMonitors: false,
      maxMonitors: 3,
      currentMonitorCount: 0
    };
  }
}

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient();
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('User in GET /api/monitors:', user, 'Auth error:', authError);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get monitors with their check results and domain checks
    const { data: monitors, error } = await supabase
      .from('monitors')
      .select(`
        *,
        monitor_checks(
          id,
          status,
          response_time,
          status_code,
          error_message,
          checked_at
        ),
        domain_checks(
          ssl_valid,
          ssl_expires_at,
          dns_resolved,
          whois_expires_at,
          checked_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching monitors:', error);
      return NextResponse.json({ error: 'Failed to fetch monitors' }, { status: 500 });
    }

    // Process the data to include latest check, uptime, and domain check for each monitor
    const processedMonitors = monitors?.map(monitor => {
      const checks = monitor.monitor_checks || [];
      const latestCheck = checks.length > 0 
        ? checks.reduce((latest: any, check: any) => 
            new Date(check.checked_at) > new Date(latest.checked_at) ? check : latest
          )
        : null;

      const domainChecks = monitor.domain_checks || [];
      const latestDomainCheck = domainChecks.length > 0
        ? domainChecks.reduce((latest: any, check: any) => 
            new Date(check.checked_at) > new Date(latest.checked_at) ? check : latest
          )
        : null;

      // Calculate uptime percentage
      const uptimePercentage = calculateUptime(checks);

      return {
        id: monitor.id,
        name: monitor.name,
        url: monitor.url,
        check_interval: monitor.check_interval,
        is_active: monitor.is_active,
        created_at: monitor.created_at,
        updated_at: monitor.updated_at,
        uptime_percentage: uptimePercentage,
        last_check: latestCheck ? {
          status: latestCheck.status,
          response_time: latestCheck.response_time,
          status_code: latestCheck.status_code,
          error_message: latestCheck.error_message,
          checked_at: latestCheck.checked_at
        } : null,
        domain_check: latestDomainCheck ? {
          ssl_valid: latestDomainCheck.ssl_valid,
          ssl_expires_at: latestDomainCheck.ssl_expires_at,
          dns_resolved: latestDomainCheck.dns_resolved,
          whois_expires_at: latestDomainCheck.whois_expires_at
        } : null
      };
    }) || [];

    return NextResponse.json(processedMonitors);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createRouteHandlerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('User in POST /api/monitors:', user, 'Auth error:', authError);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, url, interval, status } = body;

    if (!name || !url || !interval) {
      return NextResponse.json(
        { error: 'Missing required fields: name, url, interval' },
        { status: 400 },
      );
    }

    // URL validation
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 },
      );
    }

    const intervalNum = parseInt(interval, 10);
    if (isNaN(intervalNum) || intervalNum < 1 || intervalNum > 60) {
      return NextResponse.json(
        { error: 'Interval must be between 1 and 60 minutes' },
        { status: 400 },
      );
    }

    // Check subscription status and current monitor count
    const subscriptionStatus = await checkSubscriptionStatus(user.id);
    
    if (subscriptionStatus.currentMonitorCount >= subscriptionStatus.maxMonitors) {
      return NextResponse.json(
        { error: `You have reached the maximum number of monitors (${subscriptionStatus.maxMonitors}). Please upgrade your subscription to add more monitors.` },
        { status: 403 }
      );
    }

    console.log('Inserting monitor:', {
      user_id: user.id,
      name: name.trim(),
      url: url.trim(),
      check_interval: intervalNum,
      is_active: status === 'active',
    });

    const { data: monitor, error } = await supabase
      .from('monitors')
      .insert({
        user_id: user.id,
        name: name.trim(),
        url: url.trim(),
        check_interval: intervalNum,
        is_active: status === 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating monitor:', error, 'Details:', error?.details, 'Message:', error?.message);
      return NextResponse.json({ error: 'Failed to create monitor', details: error }, { status: 500 });
    }

    return NextResponse.json(monitor, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
