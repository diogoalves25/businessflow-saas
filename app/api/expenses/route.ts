import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { uploadToS3 } from '@/lib/s3';

const expenseSchema = z.object({
  category: z.string(),
  amount: z.string().transform(val => parseFloat(val)),
  description: z.string(),
  vendor: z.string().optional(),
  date: z.string(),
  recurring: z.string().transform(val => val === 'true'),
  recurringPeriod: z.string().optional(),
  taxDeductible: z.string().transform(val => val === 'true'),
  notes: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const category = searchParams.get('category');

    const where: any = {
      organizationId: session.user.organizationId
    };

    if (from && to) {
      where.date = {
        gte: new Date(from),
        lte: new Date(to)
      };
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' }
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const receipt = formData.get('receipt') as File | null;
    
    const data = {
      category: formData.get('category') as string,
      amount: formData.get('amount') as string,
      description: formData.get('description') as string,
      vendor: formData.get('vendor') as string || undefined,
      date: formData.get('date') as string,
      recurring: formData.get('recurring') as string,
      recurringPeriod: formData.get('recurringPeriod') as string || undefined,
      taxDeductible: formData.get('taxDeductible') as string,
      notes: formData.get('notes') as string || undefined
    };

    const validatedData = expenseSchema.parse(data);

    let receiptUrl: string | undefined;
    if (receipt) {
      // Upload receipt to S3
      const buffer = await receipt.arrayBuffer();
      const filename = `expenses/${session.user.organizationId}/${Date.now()}-${receipt.name}`;
      receiptUrl = await uploadToS3(Buffer.from(buffer), filename, receipt.type);
    }

    const expense = await prisma.expense.create({
      data: {
        organizationId: session.user.organizationId,
        ...validatedData,
        date: new Date(validatedData.date),
        receiptUrl
      }
    });

    // If it's a recurring expense, create future entries
    if (validatedData.recurring && validatedData.recurringPeriod) {
      await createRecurringExpenses(expense, session.user.organizationId);
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}

async function createRecurringExpenses(originalExpense: any, organizationId: string) {
  const periods = {
    weekly: 7,
    monthly: 30,
    quarterly: 90,
    yearly: 365
  };

  const days = periods[originalExpense.recurringPeriod as keyof typeof periods];
  if (!days) return;

  // Create expenses for the next 3 periods
  const promises = [];
  for (let i = 1; i <= 3; i++) {
    const nextDate = new Date(originalExpense.date);
    nextDate.setDate(nextDate.getDate() + (days * i));

    promises.push(
      prisma.expense.create({
        data: {
          organizationId,
          category: originalExpense.category,
          amount: originalExpense.amount,
          description: `${originalExpense.description} (Recurring)`,
          vendor: originalExpense.vendor,
          date: nextDate,
          recurring: true,
          recurringPeriod: originalExpense.recurringPeriod,
          taxDeductible: originalExpense.taxDeductible,
          notes: originalExpense.notes
        }
      })
    );
  }

  await Promise.all(promises);
}