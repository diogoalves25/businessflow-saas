import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'current_year';
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    let monthlyData = [];
    const currentDate = new Date();

    // Determine the number of months to fetch based on period
    let monthsToFetch = 12;
    if (period === 'current_month' || period === 'last_month') {
      monthsToFetch = 1;
    } else if (period === 'current_quarter' || period === 'last_quarter') {
      monthsToFetch = 3;
    }

    for (let i = monthsToFetch - 1; i >= 0; i--) {
      const monthDate = subMonths(currentDate, i);
      const startDate = startOfMonth(monthDate);
      const endDate = endOfMonth(monthDate);

      // Get expenses for the month
      const expenses = await prisma.expense.aggregate({
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

      // Get revenue for the month (from completed bookings)
      const bookings = await prisma.booking.aggregate({
        where: {
          organizationId: session.user.organizationId,
          status: 'completed',
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: {
          finalPrice: true
        }
      });

      const monthRevenue = bookings._sum.finalPrice || 0;
      const monthExpenses = expenses._sum.amount || 0;
      const netProfit = monthRevenue - monthExpenses;
      const profitMargin = monthRevenue > 0 ? (netProfit / monthRevenue) * 100 : 0;

      monthlyData.push({
        month: format(monthDate, 'MMM yyyy'),
        revenue: monthRevenue,
        expenses: monthExpenses,
        netProfit,
        profitMargin: Math.round(profitMargin * 10) / 10
      });
    }

    return NextResponse.json(monthlyData);
  } catch (error) {
    console.error('Error fetching monthly trends:', error);
    return NextResponse.json({ error: 'Failed to fetch monthly trends' }, { status: 500 });
  }
}