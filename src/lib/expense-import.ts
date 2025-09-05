import { prisma } from './prisma';
import type { Expense } from '@prisma/client';

// Import expenses from various sources
export async function importExpensesFromSources(organizationId: string) {
  const imports = await Promise.allSettled([
    importFromGoogleAds(organizationId),
    importFromFacebookAds(organizationId),
    importFromPayroll(organizationId),
    importFromTwilio(organizationId),
    importFromSendGrid(organizationId),
  ]);

  const results = imports.map((result, index) => ({
    source: ['Google Ads', 'Facebook Ads', 'Payroll', 'Twilio', 'SendGrid'][index],
    status: result.status,
    count: result.status === 'fulfilled' ? result.value : 0,
    error: result.status === 'rejected' ? result.reason : null,
  }));

  return results;
}

async function importFromGoogleAds(organizationId: string): Promise<number> {
  // Mock implementation - in production, this would use Google Ads API
  const mockExpenses = [
    {
      description: 'Google Ads - Search Campaign',
      amount: 250.50,
      vendor: 'Google Ads',
      category: 'Advertising',
    },
  ];

  let imported = 0;
  for (const expense of mockExpenses) {
    try {
      await prisma.expense.create({
        data: {
          organizationId,
          ...expense,
          date: new Date(),
        },
      });
      imported++;
    } catch (error) {
      console.error('Error importing Google Ads expense:', error);
    }
  }

  return imported;
}

async function importFromFacebookAds(organizationId: string): Promise<number> {
  // Mock implementation
  const mockExpenses = [
    {
      description: 'Facebook Ads - Social Campaign',
      amount: 175.25,
      vendor: 'Facebook Ads',
      category: 'Advertising',
    },
  ];

  let imported = 0;
  for (const expense of mockExpenses) {
    try {
      await prisma.expense.create({
        data: {
          organizationId,
          ...expense,
          date: new Date(),
        },
      });
      imported++;
    } catch (error) {
      console.error('Error importing Facebook Ads expense:', error);
    }
  }

  return imported;
}

async function importFromPayroll(organizationId: string): Promise<number> {
  // Mock implementation
  const mockExpenses = [
    {
      description: 'Employee Payroll - Biweekly',
      amount: 3500.00,
      vendor: 'Payroll System',
      category: 'Payroll',
      recurring: true,
      recurringPeriod: 'biweekly',
    },
  ];

  let imported = 0;
  for (const expense of mockExpenses) {
    try {
      await prisma.expense.create({
        data: {
          organizationId,
          ...expense,
          date: new Date(),
        },
      });
      imported++;
    } catch (error) {
      console.error('Error importing Payroll expense:', error);
    }
  }

  return imported;
}

async function importFromTwilio(organizationId: string): Promise<number> {
  // Mock implementation
  const mockExpenses = [
    {
      description: 'SMS Credits - Monthly',
      amount: 85.00,
      vendor: 'Twilio',
      category: 'Communication',
    },
  ];

  let imported = 0;
  for (const expense of mockExpenses) {
    try {
      await prisma.expense.create({
        data: {
          organizationId,
          ...expense,
          date: new Date(),
        },
      });
      imported++;
    } catch (error) {
      console.error('Error importing Twilio expense:', error);
    }
  }

  return imported;
}

async function importFromSendGrid(organizationId: string): Promise<number> {
  // Mock implementation
  const mockExpenses = [
    {
      description: 'Email Service - Monthly',
      amount: 45.00,
      vendor: 'SendGrid',
      category: 'Communication',
    },
  ];

  let imported = 0;
  for (const expense of mockExpenses) {
    try {
      await prisma.expense.create({
        data: {
          organizationId,
          ...expense,
          date: new Date(),
        },
      });
      imported++;
    } catch (error) {
      console.error('Error importing SendGrid expense:', error);
    }
  }

  return imported;
}

// Calculate expense totals by category
export async function getExpenseTotalsByCategory(
  organizationId: string,
  startDate: Date,
  endDate: Date
) {
  const expenses = await prisma.expense.findMany({
    where: {
      organizationId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const totals = expenses.reduce((acc, expense) => {
    const categoryName = expense.category || 'Uncategorized';
    acc[categoryName] = (acc[categoryName] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  return totals;
}

// Get expense trends over time
export async function getExpenseTrends(
  organizationId: string,
  months: number = 6
) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const expenses = await prisma.expense.findMany({
    where: {
      organizationId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      date: 'asc',
    },
  });

  // Group by month
  const trends = expenses.reduce((acc, expense) => {
    const monthKey = `${expense.date.getFullYear()}-${String(expense.date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthKey,
        total: 0,
        count: 0,
        byCategory: {} as Record<string, number>,
      };
    }
    
    acc[monthKey].total += expense.amount;
    acc[monthKey].count += 1;
    
    const category = expense.category || 'Uncategorized';
    acc[monthKey].byCategory[category] = 
      (acc[monthKey].byCategory[category] || 0) + expense.amount;
    
    return acc;
  }, {} as Record<string, any>);

  return Object.values(trends);
}