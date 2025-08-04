const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

async function testDatabase() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    console.log('Testing database connection...')
    
    // Test basic connection
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Database connection error:', error)
      return
    }
    
    console.log('✅ Database connection successful')
    
    // Check if new columns exist
    const { data: columns, error: columnError } = await supabase
      .rpc('get_table_columns', { table_name: 'profiles' })
    
    if (columnError) {
      console.log('⚠️  Could not check columns directly, trying alternative method...')
      
      // Try to select the new columns
      const { data: testProfile, error: testError } = await supabase
        .from('profiles')
        .select('id, phone_number, slack_webhook_url, sms_alerts_enabled, slack_alerts_enabled')
        .limit(1)
      
      if (testError) {
        console.error('❌ New columns not found:', testError.message)
        console.log('\n🔧 You need to run the migration in Supabase SQL Editor:')
        console.log(`
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS slack_webhook_url text,
ADD COLUMN IF NOT EXISTS sms_alerts_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS slack_alerts_enabled boolean DEFAULT false;
        `)
      } else {
        console.log('✅ New columns exist and are accessible')
      }
    } else {
      console.log('✅ Table structure verified')
    }
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testDatabase() 