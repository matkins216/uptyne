import { createRouteHandlerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current monitor count
    const { count: currentMonitorCount, error: countError } = await supabase
      .from('monitors')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) {
      console.error('Error counting monitors:', countError);
    }

    // Get user's Stripe customer ID from Supabase
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ 
        subscription: null, 
        isBasicMember: false,
        canAddMoreMonitors: false,
        maxMonitors: 5,
        currentMonitorCount: currentMonitorCount || 0
      });
    }

    // Get subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'active',
      expand: ['data.default_payment_method'],
    });

    const activeSubscription = subscriptions.data[0];

    console.log('Active subscription:', activeSubscription);
    
    if (!activeSubscription) {
      return NextResponse.json({ 
        subscription: null, 
        isBasicMember: false,
        canAddMoreMonitors: false,
        maxMonitors: 5,
        currentMonitorCount: currentMonitorCount || 0
      });
    }

    // Check if it's a basic plan (you'll need to adjust this based on your Stripe product IDs)
    const isBasicMember = activeSubscription.items.data.some(item => 
      item.price.product === process.env.STRIPE_BASIC_PRODUCT_ID
    );

    // Basic members can have more than 5 monitors
    const canAddMoreMonitors = isBasicMember;
    const maxMonitors = isBasicMember ? 50 : 5;

    return NextResponse.json({
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
    });

  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' }, 
      { status: 500 }
    );
  }
} 