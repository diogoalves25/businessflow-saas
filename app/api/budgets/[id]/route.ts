import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PATCH /api/budgets/[id] - Update a budget
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { amount, alertThreshold } = body;

    // Verify budget belongs to organization
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!existingBudget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }

    const updatedBudget = await prisma.budget.update({
      where: { id },
      data: {
        amount: amount !== undefined ? amount : existingBudget.amount,
        alertThreshold: alertThreshold !== undefined ? alertThreshold : existingBudget.alertThreshold,
      },
    });

    return NextResponse.json(updatedBudget);
  } catch (error) {
    console.error('Error updating budget:', error);
    return NextResponse.json(
      { error: 'Failed to update budget' },
      { status: 500 }
    );
  }
}

// DELETE /api/budgets/[id] - Delete a budget
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Verify budget belongs to organization
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!existingBudget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }

    await prisma.budget.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json(
      { error: 'Failed to delete budget' },
      { status: 500 }
    );
  }
}