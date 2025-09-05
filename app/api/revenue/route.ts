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

    // Since Revenue model doesn't have organizationId field,
    // return empty array for now
    // In production, you would need to update the Revenue model
    // to include organizationId or use a different approach
    return NextResponse.json([]);
  } catch (error) {
    console.error('Revenue fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    );
  }
}