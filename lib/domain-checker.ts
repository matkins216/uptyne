import { exec } from 'child_process';
import { promisify } from 'util';
import * as tls from 'tls';
import * as dns from 'dns';

const execAsync = promisify(exec);

export interface DomainCheckResult {
  domain: string;
  ssl: {
    valid: boolean;
    expiresAt?: Date;
    issuer?: string;
    error?: string;
  };
  dns: {
    resolved: boolean;
    records?: string[];
    error?: string;
  };
  whois?: {
    registrar?: string;
    expiresAt?: Date;
    error?: string;
  };
}

export async function checkDomain(domain: string): Promise<DomainCheckResult> {
  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  
  const [sslResult, dnsResult, whoisResult] = await Promise.allSettled([
    checkSSL(cleanDomain),
    checkDNS(cleanDomain),
    checkWhois(cleanDomain)
  ]);

  return {
    domain: cleanDomain,
    ssl: sslResult.status === 'fulfilled' ? sslResult.value : { valid: false, error: 'SSL check failed' },
    dns: dnsResult.status === 'fulfilled' ? dnsResult.value : { resolved: false, error: 'DNS check failed' },
    whois: whoisResult.status === 'fulfilled' ? whoisResult.value : { error: 'Whois check failed' }
  };

}

async function checkSSL(domain: string) {
  return new Promise<DomainCheckResult['ssl']>((resolve) => {
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

async function checkDNS(domain: string) {
  return new Promise<DomainCheckResult['dns']>((resolve) => {
    dns.resolve4(domain, (err, addresses) => {
      if (err) {
        resolve({ resolved: false, error: err.message });
      } else {
        resolve({ resolved: true, records: addresses });
      }
    });
  });
}

async function checkWhois(domain: string) {
  try {
    const { stdout } = await execAsync(`whois ${domain}`);
    const registrarMatch = stdout.match(/Registrar:\s*(.+)/i);
    const expiryMatch = stdout.match(/Registry Expiry Date:\s*(.+)/i);
    
    return {
      registrar: registrarMatch?.[1]?.trim(),
      expiresAt: expiryMatch ? new Date(expiryMatch[1].trim()) : undefined
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Whois lookup failed' };
  }
}