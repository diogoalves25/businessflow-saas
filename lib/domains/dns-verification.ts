import dns from 'dns/promises';

export interface DnsRecord {
  type: 'TXT' | 'CNAME' | 'A' | 'MX';
  name: string;
  value: string;
  priority?: number;
}

export interface DnsInstructions {
  verificationRecord: DnsRecord;
  cnameRecord?: DnsRecord;
  aRecord?: DnsRecord;
}

export function generateVerificationToken(domain: string): string {
  // Generate a unique verification token
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `businessflow-verify-${timestamp}-${random}`;
}

export function generateDnsInstructions(domain: string, verificationToken: string): DnsInstructions {
  return {
    verificationRecord: {
      type: 'TXT',
      name: '_businessflow-verify',
      value: verificationToken,
    },
    cnameRecord: {
      type: 'CNAME',
      name: 'www',
      value: 'custom-domains.businessflow.app',
    },
    aRecord: {
      type: 'A',
      name: '@',
      value: '76.76.21.21', // Vercel's IP
    },
  };
}

export async function verifyDomain(domain: string, expectedToken: string): Promise<boolean> {
  try {
    // Check TXT record for verification
    const txtRecords = await dns.resolveTxt(`_businessflow-verify.${domain}`);
    
    for (const record of txtRecords) {
      const value = record.join('');
      if (value === expectedToken) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('DNS verification failed:', error);
    return false;
  }
}

export async function checkDnsConfiguration(domain: string): Promise<{
  verified: boolean;
  cnameConfigured: boolean;
  aRecordConfigured: boolean;
  errors: string[];
}> {
  const errors: string[] = [];
  let verified = false;
  let cnameConfigured = false;
  let aRecordConfigured = false;

  try {
    // Check verification TXT record
    const txtRecords = await dns.resolveTxt(`_businessflow-verify.${domain}`);
    verified = txtRecords.length > 0;
  } catch (error) {
    errors.push('Verification TXT record not found');
  }

  try {
    // Check CNAME record
    const cnameRecords = await dns.resolveCname(`www.${domain}`);
    cnameConfigured = cnameRecords.some(record => 
      record.includes('custom-domains.businessflow.app')
    );
  } catch (error) {
    errors.push('CNAME record not configured for www subdomain');
  }

  try {
    // Check A record
    const aRecords = await dns.resolve4(domain);
    aRecordConfigured = aRecords.includes('76.76.21.21');
  } catch (error) {
    errors.push('A record not configured for root domain');
  }

  return {
    verified,
    cnameConfigured,
    aRecordConfigured,
    errors,
  };
}