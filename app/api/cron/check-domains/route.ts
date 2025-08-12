import { createServiceClient } from '@/lib/supabase/server';
import { checkDomain } from '@/lib/domain-checker';

export const GET = async () => {
  const supabase = createServiceClient();
  const { data: monitors } = await supabase
    .from('monitors')
    .select('*')
    .eq('is_active', true);
    
  const now = new Date();
  console.log(`[${now.toISOString()}] Checking domains for ${monitors?.length || 0} active monitors`);
  
  for (const monitor of monitors || []) {
    // Fetch the last domain check for this monitor
    const { data: lastCheck } = await supabase
      .from('domain_checks')
      .select('checked_at')
      .eq('monitor_id', monitor.id)
      .order('checked_at', { ascending: false })
      .limit(1)
      .single();

    const intervalHours = 24; // Check domains daily
    const intervalMs = intervalHours * 60 * 60 * 1000;
    const lastChecked = lastCheck?.checked_at ? new Date(lastCheck.checked_at) : null;

    // Calculate time since last check
    const timeSinceLastCheck = lastChecked ? now.getTime() - lastChecked.getTime() : Infinity;
    const shouldCheck = !lastChecked || timeSinceLastCheck >= intervalMs;
    
    console.log(`Monitor ${monitor.id} (${monitor.name}): last domain check=${lastChecked?.toISOString() || 'never'}, should check=${shouldCheck}`);
    
    if (shouldCheck && monitor.url.startsWith('http')) {
      console.log(`Checking domain for ${monitor.url}...`);
      try {
        const domainResult = await checkDomain(monitor.url);
        
        await supabase.from('domain_checks').insert({
          monitor_id: monitor.id,
          domain: domainResult.domain,
          ssl_valid: domainResult.ssl.valid,
          ssl_expires_at: domainResult.ssl.expiresAt,
          ssl_issuer: domainResult.ssl.issuer,
          dns_resolved: domainResult.dns.resolved,
          dns_records: domainResult.dns.records,
          whois_registrar: domainResult.whois?.registrar,
          whois_expires_at: domainResult.whois?.expiresAt,
          checked_at: now.toISOString()
        });
        
        console.log(`Domain check complete for ${domainResult.domain}`);
      } catch (error) {
        console.error(`Domain check failed for ${monitor.url}:`, error);
      }
    } else if (shouldCheck) {
      console.log(`Skipping domain check for non-HTTP URL: ${monitor.url}`);
    }
  }
  
  console.log(`[${now.toISOString()}] Domain check cron job completed`);
  return new Response(JSON.stringify({
    timestamp: now.toISOString(),
    monitorsChecked: monitors?.length || 0
  }));
};