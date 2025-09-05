import { prisma } from './prisma';

export type AuditAction = 
  | 'PAYROLL_VIEWED'
  | 'PAYROLL_CALCULATED'
  | 'PAYROLL_PROCESSED'
  | 'BANK_ACCOUNT_CONNECTED'
  | 'BANK_ACCOUNT_DISCONNECTED'
  | 'PLAID_ERROR'
  | 'PAYROLL_EXPORT'
  | 'TAX_SETTINGS_UPDATED';

interface AuditLogData {
  organizationId: string;
  userId: string;
  action: AuditAction;
  entityId?: string;
  entityType?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(data: AuditLogData) {
  // TODO: Implement audit logging when AuditLog model is added to Prisma schema
  console.log('Audit log (not persisted):', {
    ...data,
    createdAt: new Date(),
  });
}

export async function getAuditLogs(
  organizationId: string,
  filters?: {
    action?: AuditAction;
    userId?: string;
    entityType?: string;
    startDate?: Date;
    endDate?: Date;
  },
  limit: number = 100
) {
  // TODO: Implement audit log retrieval when AuditLog model is added to Prisma schema
  return [];
}

export async function getPayrollAuditTrail(
  organizationId: string,
  payrollRunId?: string
) {
  const where: any = {
    organizationId,
    action: {
      in: ['PAYROLL_VIEWED', 'PAYROLL_CALCULATED', 'PAYROLL_PROCESSED'],
    },
  };

  if (payrollRunId) {
    where.entityId = payrollRunId;
    where.entityType = 'PayrollRun';
  }

  return getAuditLogs(organizationId, where);
}