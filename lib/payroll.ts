// Payroll calculation utilities

export interface PayPeriod {
  start: Date;
  end: Date;
  type: 'weekly' | 'biweekly' | 'monthly';
}

export interface PayrollCalculation {
  employeeId: string;
  employeeName: string;
  hoursWorked: number;
  hourlyRate: number;
  grossPay: number;
  deductions: {
    tax: number;
    benefits: number;
    other: number;
  };
  netPay: number;
  status: 'pending' | 'approved' | 'paid';
}

export function getCurrentPayPeriod(): PayPeriod {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  return {
    start: startOfMonth,
    end: endOfMonth,
    type: 'monthly'
  };
}

export async function calculatePayrollForPeriod(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<PayrollCalculation[]> {
  // Mock implementation - in production this would:
  // 1. Fetch employees for the organization
  // 2. Get their time entries for the period
  // 3. Calculate gross pay based on hours and rates
  // 4. Apply tax calculations and deductions
  // 5. Return detailed payroll calculations
  
  return [
    {
      employeeId: '1',
      employeeName: 'John Doe',
      hoursWorked: 160,
      hourlyRate: 25,
      grossPay: 4000,
      deductions: {
        tax: 800,
        benefits: 200,
        other: 50
      },
      netPay: 2950,
      status: 'pending'
    },
    {
      employeeId: '2',
      employeeName: 'Jane Smith',
      hoursWorked: 172,
      hourlyRate: 30,
      grossPay: 5160,
      deductions: {
        tax: 1032,
        benefits: 200,
        other: 50
      },
      netPay: 3878,
      status: 'pending'
    }
  ];
}

export function calculateTaxWithholding(grossPay: number): number {
  // Simplified tax calculation - in production would use actual tax tables
  const federalTaxRate = 0.15;
  const stateTaxRate = 0.05;
  
  return grossPay * (federalTaxRate + stateTaxRate);
}

export function formatPayrollReport(calculations: PayrollCalculation[]): string {
  let report = 'Payroll Summary\n';
  report += '===============\n\n';
  
  let totalGross = 0;
  let totalNet = 0;
  let totalTax = 0;
  
  calculations.forEach(calc => {
    report += `${calc.employeeName}\n`;
    report += `  Hours: ${calc.hoursWorked} @ $${calc.hourlyRate}/hr\n`;
    report += `  Gross: $${calc.grossPay.toFixed(2)}\n`;
    report += `  Tax: $${calc.deductions.tax.toFixed(2)}\n`;
    report += `  Net: $${calc.netPay.toFixed(2)}\n\n`;
    
    totalGross += calc.grossPay;
    totalNet += calc.netPay;
    totalTax += calc.deductions.tax;
  });
  
  report += `\nTotals:\n`;
  report += `  Gross Pay: $${totalGross.toFixed(2)}\n`;
  report += `  Total Tax: $${totalTax.toFixed(2)}\n`;
  report += `  Net Pay: $${totalNet.toFixed(2)}\n`;
  
  return report;
}

export interface PayrollHistory {
  id: string;
  period: PayPeriod;
  totalEmployees: number;
  totalGrossPay: number;
  totalNetPay: number;
  status: 'pending' | 'approved' | 'paid';
  processedAt: Date;
  processedBy: string;
}

export async function getPayrollHistory(organizationId: string): Promise<PayrollHistory[]> {
  // Mock implementation - in production would fetch from database
  const now = new Date();
  
  return [
    {
      id: '1',
      period: {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 0),
        type: 'monthly'
      },
      totalEmployees: 5,
      totalGrossPay: 25000,
      totalNetPay: 18750,
      status: 'paid',
      processedAt: new Date(now.getFullYear(), now.getMonth(), 5),
      processedBy: 'admin@example.com'
    },
    {
      id: '2',
      period: {
        start: new Date(now.getFullYear(), now.getMonth() - 2, 1),
        end: new Date(now.getFullYear(), now.getMonth() - 1, 0),
        type: 'monthly'
      },
      totalEmployees: 5,
      totalGrossPay: 24500,
      totalNetPay: 18375,
      status: 'paid',
      processedAt: new Date(now.getFullYear(), now.getMonth() - 1, 5),
      processedBy: 'admin@example.com'
    }
  ];
}

export async function createPayrollRun(
  organizationId: string,
  periodStart: Date,
  periodEnd: Date,
  calculations: any[]
): Promise<string> {
  // Mock implementation - in production would:
  // 1. Create payroll run record in database
  // 2. Create individual payment records
  // 3. Return the payroll run ID
  
  const runId = `payroll_run_${Date.now()}`;
  
  console.log('Creating payroll run:', {
    organizationId,
    periodStart,
    periodEnd,
    totalEmployees: calculations.length,
    totalAmount: calculations.reduce((sum, calc) => sum + (calc.netAmount || 0), 0)
  });
  
  return runId;
}