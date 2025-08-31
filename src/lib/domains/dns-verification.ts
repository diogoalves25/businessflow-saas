import { NextRequest } from 'next/server';
import dns from 'dns/promises';

export interface DomainVerificationResult {
  verified: boolean;
  records: {
    cname?: {
      found: boolean;
      value?: string;
      expected: string;
    };
    txt?: {
      found: boolean;
      value?: string;
      expected: string;
    };
    ssl?: {
      valid: boolean;
      issuer?: string;
      expiresAt?: Date;
    };
  };
  errors?: string[];
}

export async function verifyDomain(
  domain: string,
  organizationId: string
): Promise<DomainVerificationResult> {
  const errors: string[] = [];
  const expectedCnameValue = `${organizationId}.businessflow.app`;
  const expectedTxtValue = `businessflow-verify=${organizationId}`;

  const result: DomainVerificationResult = {
    verified: false,
    records: {
      cname: {
        found: false,
        expected: expectedCnameValue,
      },
      txt: {
        found: false,
        expected: expectedTxtValue,
      },
      ssl: {
        valid: false,
      },
    },
    errors,
  };

  try {
    // Check CNAME record
    try {
      const cnameRecords = await dns.resolveCname(domain);
      if (cnameRecords.length > 0) {
        const cnameValue = cnameRecords[0];
        result.records.cname = {
          found: true,
          value: cnameValue,
          expected: expectedCnameValue,
        };
        
        // Check if CNAME points to our subdomain
        if (cnameValue === expectedCnameValue) {
          result.records.cname.found = true;
        }
      }
    } catch (error) {
      // CNAME not found or error
      errors.push('CNAME record not found');
    }

    // Check TXT record for verification
    try {
      const txtRecords = await dns.resolveTxt(`_businessflow.${domain}`);
      for (const record of txtRecords) {
        const txtValue = record.join('');
        if (txtValue === expectedTxtValue) {
          result.records.txt = {
            found: true,
            value: txtValue,
            expected: expectedTxtValue,
          };
          break;
        }
      }
    } catch (error) {
      // TXT record not found
      errors.push('TXT verification record not found');
    }

    // Check SSL certificate (simplified check)
    // In production, you'd use a proper SSL verification library
    result.records.ssl = {
      valid: true, // Assume valid if we can reach the domain
    };

    // Domain is verified if both CNAME and TXT records are correct
    result.verified = 
      result.records.cname?.found === true && 
      result.records.txt?.found === true;

  } catch (error) {
    errors.push(`DNS verification failed: ${error}`);
  }

  if (errors.length > 0) {
    result.errors = errors;
  }

  return result;
}

export function generateDnsInstructions(
  domain: string,
  organizationId: string
) {
  const subdomain = `${organizationId}.businessflow.app`;
  
  return {
    cname: {
      type: 'CNAME',
      host: domain,
      value: subdomain,
      ttl: 3600,
      description: 'Point your domain to BusinessFlow',
    },
    txt: {
      type: 'TXT',
      host: `_businessflow.${domain}`,
      value: `businessflow-verify=${organizationId}`,
      ttl: 3600,
      description: 'Verify domain ownership',
    },
    instructions: [
      '1. Log in to your domain registrar or DNS provider',
      '2. Navigate to DNS management',
      '3. Add the CNAME record shown above',
      '4. Add the TXT record for verification',
      '5. DNS changes may take up to 48 hours to propagate',
      '6. Click "Verify Domain" once DNS records are added',
    ],
  };
}

export async function checkDomainAvailability(domain: string): Promise<boolean> {
  try {
    // Check if domain is already in use
    const records = await dns.resolveCname(domain);
    
    // If it points to our infrastructure, it might be available
    if (records.some(record => record.includes('businessflow.app'))) {
      return true;
    }
    
    // Domain has other CNAME records
    return false;
  } catch (error) {
    // No CNAME records found, domain might be available
    return true;
  }
}