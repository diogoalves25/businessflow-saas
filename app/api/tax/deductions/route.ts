import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { startOfYear, endOfYear } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    const startDate = startOfYear(new Date(year, 0, 1));
    const endDate = endOfYear(new Date(year, 0, 1));

    // Get all tax-deductible expenses grouped by category
    const expenses = await prisma.expense.groupBy({
      by: ['category'],
      where: {
        organizationId: session.user.organizationId,
        taxDeductible: true,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        _all: true,
      },
    });

    // Get category descriptions
    const categoryDescriptions: Record<string, string> = {
      'Advertising': 'Marketing and advertising expenses',
      'Bank Fees': 'Banking and payment processing fees',
      'Car/Travel': 'Vehicle and travel expenses',
      'Contractors': 'Independent contractor payments',
      'Equipment': 'Business equipment purchases',
      'Insurance': 'Business insurance premiums',
      'Legal/Professional': 'Legal and professional services',
      'Marketing': 'Marketing and promotional expenses',
      'Office Supplies': 'Office supplies and materials',
      'Payroll': 'Employee wages and benefits',
      'Rent': 'Office or storage space rent',
      'Software': 'Software subscriptions and licenses',
      'Supplies': 'Business supplies and materials',
      'Training': 'Professional development and training',
      'Utilities': 'Business utilities expenses',
      'Other': 'Miscellaneous business expenses',
    };

    const deductions = expenses.map(expense => ({
      category: expense.category,
      amount: expense._sum.amount || 0,
      count: expense._count._all,
      description: categoryDescriptions[expense.category] || expense.category,
    }));

    // Sort by amount descending
    deductions.sort((a, b) => b.amount - a.amount);

    return NextResponse.json(deductions);
  } catch (error) {
    console.error('Error fetching tax deductions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tax deductions' },
      { status: 500 }
    );
  }
}