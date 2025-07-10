// app/api/checks/route.ts
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = await createRouteHandlerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 10;

    // Get user's monitors first
    const { data: userMonitors, error: monitorsError } = await supabase
      .from('monitors')
      .select('id, name')
      .eq('user_id', user.id);

    if (monitorsError) {
      console.error('Error fetching user monitors:', monitorsError);
      return NextResponse.json({ error: 'Failed to fetch monitors' }, { status: 500 });
    }

    if (!userMonitors || userMonitors.length === 0) {
      return NextResponse.json([]);
    }

    const monitorIds = userMonitors.map(m => m.id);
    const monitorNames = userMonitors.reduce((acc, monitor) => {
      acc[monitor.id] = monitor.name;
      return acc;
    }, {} as Record<string, string>);

    // Get checks for user's monitors
    const { data: checks, error } = await supabase
      .from('monitor_checks')
      .select(`
        id,
        monitor_id,
        status,
        response_time,
        status_code,
        checked_at,
        error_message
      `)
      .in('monitor_id', monitorIds)
      .order('checked_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching checks:', error);
      return NextResponse.json({ error: 'Failed to fetch checks' }, { status: 500 });
    }

    // Transform the data to match the expected format
    const transformedChecks = checks?.map(check => ({
      id: check.id,
      monitor_name: monitorNames[check.monitor_id] || 'Unknown Monitor',
      status_code: check.status_code || (check.status === 'success' ? 200 : 500),
      response_time: check.response_time,
      checked_at: check.checked_at,
      error: check.error_message
    })) || [];

    return NextResponse.json(transformedChecks);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 