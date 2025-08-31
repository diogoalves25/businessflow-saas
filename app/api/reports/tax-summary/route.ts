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
    const endDate = endOfYear(new Date(year, 11, 31));

    // Get total revenue
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

    const totalRevenue = bookings._sum.finalPrice || 0;

    // Get deductible and non-deductible expenses
    const deductibleExpenses = await prisma.expense.aggregate({
      where: {
        organizationId: session.user.organizationId,
        taxDeductible: true,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        amount: true
      }
    });

    const nonDeductibleExpenses = await prisma.expense.aggregate({
      where: {
        organizationId: session.user.organizationId,
        taxDeductible: false,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        amount: true
      }
    });

    const deductibleAmount = deductibleExpenses._sum.amount || 0;
    const nonDeductibleAmount = nonDeductibleExpenses._sum.amount || 0;

    // Calculate taxable income
    const taxableIncome = totalRevenue - deductibleAmount;

    // Calculate estimated tax (simplified - in reality would need tax brackets)
    // Using a simplified progressive tax calculation
    let estimatedTax = 0;
    
    if (taxableIncome > 0) {
      if (taxableIncome <= 10000) {
        estimatedTax = taxableIncome * 0.10;
      } else if (taxableIncome <= 40000) {
        estimatedTax = 1000 + (taxableIncome - 10000) * 0.12;
      } else if (taxableIncome <= 85000) {
        estimatedTax = 4600 + (taxableIncome - 40000) * 0.22;
      } else if (taxableIncome <= 165000) {
        estimatedTax = 14500 + (taxableIncome - 85000) * 0.24;
      } else {
        estimatedTax = 33700 + (taxableIncome - 165000) * 0.32;
      }
    }

    // Add self-employment tax (15.3% of net earnings)
    const selfEmploymentTax = taxableIncome * 0.153;
    estimatedTax += selfEmploymentTax;

    // Calculate quarterly payments
    const quarterlyPayment = estimatedTax / 4;
    const quarterlyPayments = {
      'Q1': Math.round(quarterlyPayment),
      'Q2': Math.round(quarterlyPayment),
      'Q3': Math.round(quarterlyPayment),
      'Q4': Math.round(quarterlyPayment)
    };

    const taxSummary = {
      totalRevenue,
      deductibleExpenses: deductibleAmount,
      nonDeductibleExpenses: nonDeductibleAmount,
      taxableIncome,
      estimatedTax: Math.round(estimatedTax),
      quarterlyPayments
    };

    return NextResponse.json(taxSummary);
  } catch (error) {
    console.error('Error generating tax summary:', error);
    return NextResponse.json({ error: 'Failed to generate tax summary' }, { status: 500 });
  }
}