import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { createClient } from '@/src/lib/supabase/server';

// GET: Fetch revenue data
export async function GET() {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's organization
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { organization: true }
    });

    if (!dbUser?.organizationId) {
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 404 }
      );
    }

    // Fetch actual revenue data for the organization
    const revenue = await prisma.revenue.findMany({
      where: {
        organizationId: dbUser.organizationId
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ],
      take: 6 // Last 6 months
    });

    // Return empty array if no data - NO FAKE DATA
    if (revenue.length === 0) {
      return NextResponse.json([]);
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