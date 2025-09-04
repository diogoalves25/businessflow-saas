import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const where: any = {
      organizationId: session.user.organizationId
    };

    if (from && to) {
      where.date = {
        gte: new Date(from),
        lte: new Date(to)
      };
    }

    // Get total expenses
    const expenses = await prisma.expense.findMany({
      where,
      select: {
        amount: true,
        category: true
      }
    });

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Get revenue (from bookings)
    const bookings = await prisma.booking.findMany({
      where: {
        organizationId: session.user.organizationId,
        status: 'completed',
        ...(from && to && {
          date: {
            gte: new Date(from),
            lte: new Date(to)
          }
        })
      },
      select: {
        finalPrice: true
      }
    });

    const revenue = bookings.reduce((sum, booking) => sum + booking.finalPrice, 0);

    // Calculate category breakdown
    const categoryBreakdown: Record<string, number> = {};
    expenses.forEach(expense => {
      if (!categoryBreakdown[expense.category]) {
        categoryBreakdown[expense.category] = 0;
      }
      categoryBreakdown[expense.category] += expense.amount;
    });

    // Calculate profit metrics
    const netProfit = revenue - totalExpenses;
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    return NextResponse.json({
      totalExpenses,
      revenue,
      netProfit,
      profitMargin,
      categoryBreakdown
    });
  } catch (error) {
    console.error('Error fetching expense summary:', error);
    return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 });
  }
}