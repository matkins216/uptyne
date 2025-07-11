// File: app/api/monitors/[id]/route.ts
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createRouteHandlerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: monitor, error } = await supabase
      .from('monitors')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching monitor:', error);
      return NextResponse.json({ error: 'Monitor not found' }, { status: 404 });
    }

    return NextResponse.json(monitor);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createRouteHandlerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('monitors')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting monitor:', error);
      return NextResponse.json({ error: 'Failed to delete monitor' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createRouteHandlerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, url, check_interval, is_active } = body;

    if (!name || !url || check_interval === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, url, check_interval' },
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

    const intervalNum = parseInt(check_interval, 10);
    if (isNaN(intervalNum) || intervalNum < 1 || intervalNum > 60) {
      return NextResponse.json(
        { error: 'Check interval must be between 1 and 60 minutes' },
        { status: 400 },
      );
    }

    // First verify the monitor belongs to the user
    const { data: existingMonitor, error: fetchError } = await supabase
      .from('monitors')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingMonitor) {
      return NextResponse.json({ error: 'Monitor not found' }, { status: 404 });
    }

    // Update the monitor
    const { data: monitor, error } = await supabase
      .from('monitors')
      .update({
        name: name.trim(),
        url: url.trim(),
        check_interval: intervalNum,
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating monitor:', error);
      return NextResponse.json({ error: 'Failed to update monitor' }, { status: 500 });
    }

    return NextResponse.json(monitor);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}