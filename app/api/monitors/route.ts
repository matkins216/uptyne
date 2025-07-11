
// app/api/monitors/route.ts
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

function calculateUptime(checks: any[]) {
  if (!checks || checks.length === 0) return 100;
  const upChecks = checks.filter(check => check.status === 'up').length;
  return Math.round((upChecks / checks.length) * 100);
}

export async function GET() {
  try {
    const supabase = await createRouteHandlerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get monitors with their check results
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
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching monitors:', error);
      return NextResponse.json({ error: 'Failed to fetch monitors' }, { status: 500 });
    }

    // Process the data to include latest check and uptime for each monitor
    const processedMonitors = monitors?.map(monitor => {
      const checks = monitor.monitor_checks || [];
      const latestCheck = checks.length > 0 
        ? checks.reduce((latest: any, check: any) => 
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
      console.error('Error creating monitor:', error);
      return NextResponse.json({ error: 'Failed to create monitor' }, { status: 500 });
    }

    return NextResponse.json(monitor, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
