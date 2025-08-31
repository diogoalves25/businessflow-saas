import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { startOfMonth, endOfMonth } from 'date-fns';

// GET /api/budgets - Get all budgets for organization
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const budgets = await prisma.budget.findMany({
      where: {
        organizationId: session.user.organizationId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate current spending for each budget
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const startDate = budget.period === 'monthly' 
          ? startOfMonth(new Date())
          : new Date(new Date().getFullYear(), 0, 1);
        
        const endDate = budget.period === 'monthly'
          ? endOfMonth(new Date())
          : new Date(new Date().getFullYear(), 11, 31);

        const spending = await prisma.expense.aggregate({
          where: {
            organizationId: session.user.organizationId,
            category: budget.category,
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          _sum: {
            amount: true,
          },
        });

        const currentSpending = spending._sum.amount || 0;
        const percentageUsed = (currentSpending / budget.amount) * 100;

        return {
          ...budget,
          currentSpending,
          percentageUsed,
          isOverBudget: percentageUsed > 100,
          isNearLimit: percentageUsed >= budget.alertThreshold,
        };
      })
    );

    return NextResponse.json(budgetsWithSpending);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

// POST /api/budgets - Create a new budget
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { category, amount, period, alertThreshold } = body;

    // Check if budget already exists for this category and period
    const existingBudget = await prisma.budget.findFirst({
      where: {
        organizationId: session.user.organizationId,
        category,
        period,
      },
    });

    if (existingBudget) {
      return NextResponse.json(
        { error: 'Budget already exists for this category and period' },
        { status: 400 }
      );
    }

    const budget = await prisma.budget.create({
      data: {
        organizationId: session.user.organizationId,
        category,
        amount,
        period,
        alertThreshold: alertThreshold || 80,
      },
    });

    // Calculate current spending
    const startDate = period === 'monthly' 
      ? startOfMonth(new Date())
      : new Date(new Date().getFullYear(), 0, 1);
    
    const endDate = period === 'monthly'
      ? endOfMonth(new Date())
      : new Date(new Date().getFullYear(), 11, 31);

    const spending = await prisma.expense.aggregate({
      where: {
        organizationId: session.user.organizationId,
        category,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const currentSpending = spending._sum.amount || 0;
    const percentageUsed = (currentSpending / amount) * 100;

    return NextResponse.json({
      ...budget,
      currentSpending,
      percentageUsed,
      isOverBudget: percentageUsed > 100,
      isNearLimit: percentageUsed >= budget.alertThreshold,
    });
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json(
      { error: 'Failed to create budget' },
      { status: 500 }
    );
  }
}