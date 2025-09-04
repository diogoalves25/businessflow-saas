import dns from 'dns/promises';

export interface DNSRecord {
  type: string;
  name: string;
  value: string;
  ttl?: number;
}

export interface VerificationResult {
  verified: boolean;
  records: DNSRecord[];
  errors?: string[];
}

export async function generateVerificationToken(domain: string): Promise<string> {
  // Generate a unique verification token for the domain
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `businessflow-verify-${timestamp}-${random}`;
}

export async function generateDNSRecords(domain: string, verificationToken: string): Promise<DNSRecord[]> {
  return [
    {
      type: 'TXT',
      name: '_businessflow-verification',
      value: verificationToken,
      ttl: 300,
    },
    {
      type: 'CNAME',
      name: 'www',
      value: `${domain}.businessflow.app`,
      ttl: 3600,
    },
    {
      type: 'A',
      name: '@',
      value: '76.76.21.21', // Vercel's IP
      ttl: 3600,
    },
  ];
}

export async function verifyDNSRecords(domain: string, expectedToken: string): Promise<VerificationResult> {
  const errors: string[] = [];
  const records: DNSRecord[] = [];
  
  try {
    // Check TXT record for verification
    try {
      const txtRecords = await dns.resolveTxt(`_businessflow-verification.${domain}`);
      const flatRecords = txtRecords.flat();
      const isVerified = flatRecords.some(record => record === expectedToken);
      
      if (isVerified) {
        records.push({
          type: 'TXT',
          name: '_businessflow-verification',
          value: expectedToken,
        });
      } else {
        errors.push('Verification TXT record not found or incorrect');
      }
    } catch (error) {
      errors.push('Failed to resolve TXT record');
    }

    // Check A record
    try {
      const aRecords = await dns.resolve4(domain);
      records.push(...aRecords.map(ip => ({
        type: 'A',
        name: '@',
        value: ip,
      })));
    } catch (error) {
      errors.push('Failed to resolve A record');
    }

    // Check CNAME for www subdomain
    try {
      const cnameRecords = await dns.resolveCname(`www.${domain}`);
      records.push(...cnameRecords.map(cname => ({
        type: 'CNAME',
        name: 'www',
        value: cname,
      })));
    } catch (error) {
      // It's okay if www CNAME doesn't exist
    }

    return {
      verified: errors.length === 0,
      records,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    return {
      verified: false,
      records: [],
      errors: ['DNS verification failed: ' + (error as Error).message],
    };
  }
}

export async function checkDomainAvailability(domain: string): Promise<boolean> {
  try {
    // Try to resolve the domain
    await dns.resolve4(domain);
    // If it resolves, it's already taken
    return false;
  } catch (error) {
    // If it fails to resolve, it might be available
    // Note: This is not a definitive check for domain availability
    return true;
  }
}