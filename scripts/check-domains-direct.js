// scripts/check-domains-direct.js
const { createClient } = require('@supabase/supabase-js');
const { exec } = require('child_process');
const { promisify } = require('util');
const tls = require('tls');
const dns = require('dns');


const execAsync = promisify(exec);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSSL(domain) {
  return new Promise((resolve) => {
    const socket = tls.connect(443, domain, { servername: domain }, () => {
      const cert = socket.getPeerCertificate();
      resolve({
        valid: true,
        expiresAt: new Date(cert.valid_to),
        issuer: cert.issuer.O
      });
      socket.end();
    });
    
    socket.on('error', (error) => {
      resolve({ valid: false, error: error.message });
    });
  });
}

async function checkDNS(domain) {
  return new Promise((resolve) => {
    dns.resolve4(domain, (err, addresses) => {
      if (err) {
        resolve({ resolved: false, error: err.message });
      } else {
        resolve({ resolved: true, records: addresses });
      }
    });
  });
}

async function checkWhois(domain) {
  try {
    const { stdout } = await execAsync(`whois ${domain}`);
    const registrarMatch = stdout.match(/Registrar:\s*(.+)/i);
    const expiryMatch = stdout.match(/Registry Expiry Date:\s*(.+)/i);
    
    return {
      registrar: registrarMatch?.[1]?.trim(),
      expiresAt: expiryMatch ? new Date(expiryMatch[1].trim()) : undefined
    };
  } catch (error) {
    return { error: error.message };
  }
}

async function checkDomainsDirect() {
  try {
    console.log('🔍 Fetching active monitors...');
    
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

    for (const monitor of monitors) {
      try {
        const cleanDomain = monitor.url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
        console.log(`\n🔍 Checking domain: ${cleanDomain}`);
        
        const [sslResult, dnsResult, whoisResult] = await Promise.allSettled([
          checkSSL(cleanDomain),
          checkDNS(cleanDomain),
          checkWhois(cleanDomain)
        ]);

        const ssl = sslResult.status === 'fulfilled' ? sslResult.value : { valid: false };
        const dns = dnsResult.status === 'fulfilled' ? dnsResult.value : { resolved: false };
        const whois = whoisResult.status === 'fulfilled' ? whoisResult.value : {};

        const { error: insertError } = await supabase
          .from('domain_checks')
          .insert({
            monitor_id: monitor.id,
            domain: cleanDomain,
            ssl_valid: ssl.valid,
            ssl_expires_at: ssl.expiresAt,
            ssl_issuer: ssl.issuer,
            dns_resolved: dns.resolved,
            dns_records: dns.records,
            whois_registrar: whois.registrar,
            whois_expires_at: whois.expiresAt,
            checked_at: new Date().toISOString()
          });

        if (insertError) {
          console.error(`❌ Error storing domain check for ${monitor.name}:`, insertError);
        } else {
          const sslEmoji = ssl.valid ? '🔒' : '🔓';
          const dnsEmoji = dns.resolved ? '🌐' : '❌';
          console.log(`${sslEmoji} SSL: ${ssl.valid ? 'Valid' : 'Invalid'}`);
          console.log(`${dnsEmoji} DNS: ${dns.resolved ? 'Resolved' : 'Failed'}`);
          if (whois.expiresAt) {
            console.log(`📅 Domain expires: ${whois.expiresAt.toDateString()}`);
          }
        }

      } catch (error) {
        console.error(`❌ Error checking domain for ${monitor.name}:`, error.message);
      }
    }

    console.log(`\n🎉 Completed domain checks for ${monitors.length} monitors`);

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

checkDomainsDirect();