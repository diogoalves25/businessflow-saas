import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { uploadToS3, deleteFromS3 } from '@/lib/s3';

const updateExpenseSchema = z.object({
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
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

    const validatedData = updateExpenseSchema.parse(data);

    // Check if expense exists and belongs to the organization
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: resolvedParams.id,
        organizationId: session.user.organizationId
      }
    });

    if (!existingExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    let receiptUrl = existingExpense.receiptUrl;
    if (receipt) {
      // Delete old receipt if exists
      if (existingExpense.receiptUrl) {
        await deleteFromS3(existingExpense.receiptUrl);
      }

      // Upload new receipt
      const buffer = await receipt.arrayBuffer();
      const filename = `expenses/${session.user.organizationId}/${Date.now()}-${receipt.name}`;
      receiptUrl = await uploadToS3(Buffer.from(buffer), filename, receipt.type);
    }

    const expense = await prisma.expense.update({
      where: { id: resolvedParams.id },
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
        receiptUrl
      }
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if expense exists and belongs to the organization
    const expense = await prisma.expense.findFirst({
      where: {
        id: resolvedParams.id,
        organizationId: session.user.organizationId
      }
    });

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Delete receipt from S3 if exists
    if (expense.receiptUrl) {
      await deleteFromS3(expense.receiptUrl);
    }

    await prisma.expense.delete({
      where: { id: resolvedParams.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}