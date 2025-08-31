import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';
import { prisma } from '@/src/lib/prisma';
import { format } from 'date-fns';
import { subDays } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminUser = await prisma.user.findFirst({
      where: { 
        id: user.id,
        role: 'admin'
      }
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { dateFilter = '7d', organizationFilter = 'all' } = body;

    // Calculate date range
    let startDate: Date | undefined;
    switch (dateFilter) {
      case '24h':
        startDate = subDays(new Date(), 1);
        break;
      case '7d':
        startDate = subDays(new Date(), 7);
        break;
      case '30d':
        startDate = subDays(new Date(), 30);
        break;
      case 'all':
      default:
        startDate = undefined;
    }

    // Build query conditions
    const whereConditions: any = {};
    if (startDate) {
      whereConditions.createdAt = { gte: startDate };
    }
    if (organizationFilter !== 'all') {
      whereConditions.organizationId = organizationFilter;
    }

    // Fetch chat messages
    const messages = await prisma.chatMessage.findMany({
      where: whereConditions,
      include: {
        organization: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Create CSV content
    const csvHeaders = [
      'Session ID',
      'Organization',
      'User ID',
      'Role',
      'Message',
      'Token Count',
      'Estimated Cost',
      'Timestamp'
    ];

    const csvRows = messages.map(msg => {
      const cost = (msg.tokenCount / 1000) * (msg.role === 'user' ? 0.03 : 0.06);
      return [
        msg.sessionId,
        msg.organization.businessName,
        msg.userId || 'anonymous',
        msg.role,
        `"${msg.content.replace(/"/g, '""')}"`, // Escape quotes in content
        msg.tokenCount.toString(),
        cost.toFixed(4),
        format(new Date(msg.createdAt), 'yyyy-MM-dd HH:mm:ss')
      ];
    });

    // Combine headers and rows
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    // Return CSV file
    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="chat-logs-${format(new Date(), 'yyyy-MM-dd')}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export chat logs error:', error);
    return NextResponse.json(
      { error: 'Failed to export chat logs' },
      { status: 500 }
    );
  }
}