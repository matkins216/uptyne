
// app/api/monitors/route.ts
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createRouteHandlerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: monitors, error } = await supabase
      .from('monitors')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching monitors:', error);
      return NextResponse.json({ error: 'Failed to fetch monitors' }, { status: 500 });
    }

    return NextResponse.json(monitors || []);
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
