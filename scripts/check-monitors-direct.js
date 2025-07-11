// scripts/check-monitors-direct.js
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// You'll need to set these environment variables or replace with your actual values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('Please set these in your .env.local file or export them in your terminal.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkWebsite(url) {
  const startTime = Date.now();
  
  try {
    const response = await axios.get(url, {
      timeout: 30000,
      validateStatus: () => true,
      headers: {
        'User-Agent': 'UptimeMonitor/1.0'
      }
    });

    const responseTime = Date.now() - startTime;

    return {
      status: response.status >= 200 && response.status < 400 ? 'up' : 'down',
      responseTime,
      statusCode: response.status
    };
  } catch (error) {
    return {
      status: 'error',
      responseTime: Date.now() - startTime,
      errorMessage: error.message
    };
  }
}

async function checkMonitorsDirect() {
  try {
    console.log('🔍 Fetching active monitors...');
    
    // Get all active monitors
    const { data: monitors, error: monitorsError } = await supabase
      .from('monitors')
      .select('*')
      .eq('is_active', true);

    if (monitorsError) {
      console.error('Error fetching monitors:', monitorsError);
      return;
    }

    if (!monitors || monitors.length === 0) {
      console.log('ℹ️  No active monitors found');
      return;
    }

    console.log(`📊 Found ${monitors.length} active monitors`);

    const results = [];

    // Check each monitor
    for (const monitor of monitors) {
      try {
        console.log(`\n🔍 Checking: ${monitor.name} (${monitor.url})`);
        
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
          console.error(`❌ Error storing check result for ${monitor.name}:`, insertError);
        } else {
          const statusEmoji = checkResult.status === 'up' ? '✅' : checkResult.status === 'down' ? '❌' : '⚠️';
          console.log(`${statusEmoji} ${monitor.name}: ${checkResult.status.toUpperCase()} (${checkResult.responseTime}ms)`);
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
        console.error(`❌ Error checking monitor ${monitor.name}:`, error.message);
        
        // Store error result
        await supabase
          .from('monitor_checks')
          .insert({
            monitor_id: monitor.id,
            status: 'error',
            response_time: 0,
            error_message: error.message
          });

        results.push({
          monitor_id: monitor.id,
          monitor_name: monitor.name,
          status: 'error',
          response_time: 0,
          error_message: error.message
        });
      }
    }

    console.log(`\n🎉 Completed checks for ${monitors.length} monitors`);
    console.log('📈 Results summary:');
    const upCount = results.filter(r => r.status === 'up').length;
    const downCount = results.filter(r => r.status === 'down').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    console.log(`   ✅ Up: ${upCount}`);
    console.log(`   ❌ Down: ${downCount}`);
    console.log(`   ⚠️  Error: ${errorCount}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the checks
checkMonitorsDirect(); 