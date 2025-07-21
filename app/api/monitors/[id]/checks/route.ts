import { createRouteHandlerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: monitorId } = await params;
    const supabase = await createRouteHandlerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the monitor belongs to the user
    const { data: monitor, error: monitorError } = await supabase
      .from('monitors')
      .select('id, name')
      .eq('id', monitorId)
      .eq('user_id', user.id)
      .single();

    if (monitorError || !monitor) {
      return NextResponse.json({ error: 'Monitor not found' }, { status: 404 });
    }

    // Get checks for the specific monitor
    const { data: checks, error } = await supabase
      .from('monitor_checks')
      .select(`
        id,
        status,
        response_time,
        status_code,
        checked_at,
        error_message
      `)
      .eq('monitor_id', monitorId)
      .order('checked_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching checks:', error);
      return NextResponse.json({ error: 'Failed to fetch checks' }, { status: 500 });
    }

    return NextResponse.json(checks || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}