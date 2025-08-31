import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'current_month';
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    // Determine date range based on period
    let startDate: Date;
    let endDate: Date;
    const currentDate = new Date();

    switch (period) {
      case 'current_month':
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
        break;
      case 'last_month':
        const lastMonth = subMonths(currentDate, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      case 'current_year':
        startDate = startOfYear(new Date(year, 0, 1));
        endDate = endOfYear(new Date(year, 11, 31));
        break;
      default:
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
    }

    // Get expenses grouped by category
    const expenses = await prisma.expense.groupBy({
      by: ['category'],
      where: {
        organizationId: session.user.organizationId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        amount: true
      }
    });

    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, expense) => sum + (expense._sum.amount || 0), 0);

    // Transform data for the chart
    const categoryData = expenses.map(expense => ({
      name: expense.category,
      value: expense._sum.amount || 0,
      percentage: totalExpenses > 0 
        ? Math.round(((expense._sum.amount || 0) / totalExpenses) * 100) 
        : 0
    }));

    // Sort by value descending
    categoryData.sort((a, b) => b.value - a.value);

    return NextResponse.json(categoryData);
  } catch (error) {
    console.error('Error fetching category breakdown:', error);
    return NextResponse.json({ error: 'Failed to fetch category breakdown' }, { status: 500 });
  }
}