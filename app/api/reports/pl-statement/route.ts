import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'current_month';
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    // Determine date range and period label
    let startDate: Date;
    let endDate: Date;
    let periodLabel: string;
    const currentDate = new Date();

    switch (period) {
      case 'current_month':
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
        periodLabel = format(currentDate, 'MMMM yyyy');
        break;
      case 'last_month':
        const lastMonth = subMonths(currentDate, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        periodLabel = format(lastMonth, 'MMMM yyyy');
        break;
      case 'current_year':
        startDate = startOfYear(new Date(year, 0, 1));
        endDate = endOfYear(new Date(year, 11, 31));
        periodLabel = `Year ${year}`;
        break;
      default:
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
        periodLabel = format(currentDate, 'MMMM yyyy');
    }

    // Get revenue breakdown
    const bookings = await prisma.booking.findMany({
      where: {
        organizationId: session.user.organizationId,
        status: 'completed',
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        basePrice: true,
        discount: true,
        finalPrice: true
      }
    });

    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.finalPrice, 0);
    const totalBasePrice = bookings.reduce((sum, booking) => sum + booking.basePrice, 0);
    const totalDiscounts = bookings.reduce((sum, booking) => sum + booking.discount, 0);

    // Calculate add-ons and tips (difference between final and base minus discounts)
    const addOnsAndTips = totalRevenue - totalBasePrice + totalDiscounts;
    const estimatedAddOns = addOnsAndTips * 0.7; // Assume 70% are add-ons
    const estimatedTips = addOnsAndTips * 0.3; // Assume 30% are tips

    // Get expenses by category
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

    // Transform expenses into a category map
    const expenseCategories: Record<string, number> = {};
    let totalExpenses = 0;

    expenses.forEach(expense => {
      const amount = expense._sum.amount || 0;
      expenseCategories[expense.category] = amount;
      totalExpenses += amount;
    });

    // Calculate profit metrics
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    const plStatement = {
      period: periodLabel,
      revenue: {
        services: totalBasePrice - totalDiscounts,
        addOns: estimatedAddOns,
        tips: estimatedTips,
        other: 0,
        total: totalRevenue
      },
      expenses: {
        categories: expenseCategories,
        total: totalExpenses
      },
      netProfit,
      profitMargin: Math.round(profitMargin * 10) / 10
    };

    return NextResponse.json(plStatement);
  } catch (error) {
    console.error('Error generating P&L statement:', error);
    return NextResponse.json({ error: 'Failed to generate P&L statement' }, { status: 500 });
  }
}