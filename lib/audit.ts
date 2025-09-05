// Audit logging utilities

export interface AuditLog {
  id: string;
  organizationId: string;
  userId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export async function createAuditLog(data: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
  // Mock implementation - in production would save to database
  const log: AuditLog = {
    ...data,
    id: `audit_${Date.now()}`,
    createdAt: new Date()
  };
  
  console.log('Audit log created:', log);
  
  return log;
}

export async function getAuditLogs(
  organizationId: string,
  filters?: {
    userId?: string;
    action?: string;
    entityType?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<AuditLog[]> {
  // Mock implementation - in production would query database
  const mockLogs: AuditLog[] = [
    {
      id: 'audit_1',
      organizationId,
      userId: 'user_1',
      action: 'LOGIN',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      createdAt: new Date()
    },
    {
      id: 'audit_2',
      organizationId,
      userId: 'user_1',
      action: 'BOOKING_CREATED',
      entityType: 'Booking',
      entityId: 'booking_123',
      metadata: {
        customerName: 'John Doe',
        serviceType: 'Haircut'
      },
      createdAt: new Date()
    }
  ];
  
  return mockLogs;
}

export function formatAuditAction(action: string): string {
  const actionMap: Record<string, string> = {
    LOGIN: 'User logged in',
    LOGOUT: 'User logged out',
    BOOKING_CREATED: 'Created a booking',
    BOOKING_UPDATED: 'Updated a booking',
    BOOKING_CANCELLED: 'Cancelled a booking',
    PAYROLL_PROCESSED: 'Processed payroll',
    SETTINGS_UPDATED: 'Updated settings',
    USER_INVITED: 'Invited a user',
    USER_REMOVED: 'Removed a user'
  };
  
  return actionMap[action] || action;
}