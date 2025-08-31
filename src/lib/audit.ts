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
  try {
    await prisma.auditLog.create({
      data: {
        ...data,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
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
  const where: any = { organizationId };

  if (filters?.action) {
    where.action = filters.action;
  }
  if (filters?.userId) {
    where.userId = filters.userId;
  }
  if (filters?.entityType) {
    where.entityType = filters.entityType;
  }
  if (filters?.startDate || filters?.endDate) {
    where.createdAt = {};
    if (filters?.startDate) {
      where.createdAt.gte = filters.startDate;
    }
    if (filters?.endDate) {
      where.createdAt.lte = filters.endDate;
    }
  }

  return prisma.auditLog.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
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