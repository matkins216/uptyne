// app/api/monitors/check/route.ts
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkWebsite } from '@/lib/monitor-checker';

export async function POST() {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Get all active monitors
    const { data: monitors, error: monitorsError } = await supabase
      .from('monitors')
      .select('*')
      .eq('is_active', true);

    if (monitorsError) {
      console.error('Error fetching monitors:', monitorsError);
      return NextResponse.json({ error: 'Failed to fetch monitors' }, { status: 500 });
    }

    if (!monitors || monitors.length === 0) {
      return NextResponse.json({ message: 'No active monitors found' });
    }

    const results = [];

    // Check each monitor
    for (const monitor of monitors) {
      try {
        console.log(`Checking monitor: ${monitor.name} (${monitor.url})`);
        
        const checkResult = await checkWebsite(monitor.url);
        
        // Store the check result
        const { error: insertError } = await supabase
          .from('monitor_checks')
          .insert({
            monitor_id: monitor.id,
            status: checkResult.status,
            response_time: checkResult.responseTime,
            status_code: checkResult.statusCode,
            error_message: checkResult.errorMessage
          });

        if (insertError) {
          console.error(`Error storing check result for ${monitor.name}:`, insertError);
        } else {
          console.log(`Check completed for ${monitor.name}: ${checkResult.status}`);
        }

        results.push({
          monitor_id: monitor.id,
          monitor_name: monitor.name,
          status: checkResult.status,
          response_time: checkResult.responseTime,
          status_code: checkResult.statusCode,
          error_message: checkResult.errorMessage
        });

      } catch (error) {
        console.error(`Error checking monitor ${monitor.name}:`, error);
        
        // Store error result
        await supabase
          .from('monitor_checks')
          .insert({
            monitor_id: monitor.id,
            status: 'error',
            response_time: 0,
            error_message: error instanceof Error ? error.message : 'Unknown error'
          });

        results.push({
          monitor_id: monitor.id,
          monitor_name: monitor.name,
          status: 'error',
          response_time: 0,
          error_message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      message: `Checked ${monitors.length} monitors`,
      results
    });

  } catch (error) {
    console.error('Unexpected error in check endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 