import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkDomain } from '@/lib/domain-checker';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get all active monitors
    const { data: monitors, error } = await supabase
      .from('monitors')
      .select('id, url')
      .eq('is_active', true);

    if (error) throw error;

    const results = [{}];
    console.log(monitors)
    for (const monitor of monitors || []) {
      try {
        const domainResult = await checkDomain(monitor.url);
        console.log(domainResult)
        
        // Store domain check results
        const { error: insertError } = await supabase
          .from('domain_checks')
          .insert({
            monitor_id: monitor.id,
            domain: domainResult.domain,
            ssl_valid: domainResult.ssl.valid,
            ssl_expires_at: domainResult.ssl.expiresAt,
            ssl_issuer: domainResult.ssl.issuer,
            dns_resolved: domainResult.dns.resolved,
            dns_records: domainResult.dns.records,
            whois_registrar: domainResult.whois?.registrar,
            whois_expires_at: domainResult.whois?.expiresAt,
            checked_at: new Date().toISOString()
          });

        if (insertError) throw insertError;
        
        results.push({ monitor_id: monitor.id, status: 'success' });
      } catch (error) {
        results.push({ 
          monitor_id: monitor.id, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      checked: results.length,
      results 
    });


  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Domain check failed' },
      { status: 500 }
    );
  }
}