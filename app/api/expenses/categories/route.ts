import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createDefaultCategories } from '@/lib/expenses/categories';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categories = await prisma.expenseCategory.findMany({
      where: {
        organizationId: session.user.organizationId
      },
      orderBy: { name: 'asc' }
    });

    // If no categories exist, create default ones
    if (categories.length === 0) {
      const organization = await prisma.organization.findUnique({
        where: { id: session.user.organizationId },
        select: { businessType: true }
      });

      if (organization) {
        await createDefaultCategories(
          session.user.organizationId, 
          organization.businessType,
          prisma
        );

        // Fetch the newly created categories
        const newCategories = await prisma.expenseCategory.findMany({
          where: {
            organizationId: session.user.organizationId
          },
          orderBy: { name: 'asc' }
        });

        return NextResponse.json(newCategories);
      }
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, icon, color, taxDeductible } = body;

    const category = await prisma.expenseCategory.create({
      data: {
        organizationId: session.user.organizationId,
        name,
        icon,
        color,
        taxDeductible,
        isDefault: false
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}