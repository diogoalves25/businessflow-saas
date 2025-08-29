import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

// GET: Fetch revenue data
export async function GET() {
  try {
    const revenue = await prisma.revenue.findMany({
      orderBy: [
        { year: 'asc' },
        { month: 'asc' }
      ],
      take: 6 // Last 6 months
    });

    // If no revenue data exists, return mock data
    if (revenue.length === 0) {
      const mockData = [
        { month: 'Jan', revenue: 42000 },
        { month: 'Feb', revenue: 45000 },
        { month: 'Mar', revenue: 43500 },
        { month: 'Apr', revenue: 48000 },
        { month: 'May', revenue: 51000 },
        { month: 'Jun', revenue: 45680 },
      ];
      return NextResponse.json(mockData);
    }

    // Format the data
    const formattedData = revenue.map((r) => ({
      month: r.month,
      revenue: r.amount,
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Revenue fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    );
  }
}