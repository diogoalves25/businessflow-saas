import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';
import { prisma } from '@/src/lib/prisma';
import { startOfDay, subDays } from 'date-fns';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const dateFilter = searchParams.get('dateFilter') || '7d';
    const organizationFilter = searchParams.get('organizationFilter') || 'all';

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
      orderBy: { createdAt: 'desc' },
    });

    // Group messages by session
    const sessionMap = new Map<string, any>();
    
    messages.forEach(message => {
      const key = `${message.sessionId}-${message.organizationId}`;
      if (!sessionMap.has(key)) {
        sessionMap.set(key, {
          sessionId: message.sessionId,
          organizationId: message.organizationId,
          organizationName: message.organization.businessName,
          userId: message.userId || 'anonymous',
          messages: [],
          messageCount: 0,
          totalTokens: 0,
          estimatedCost: 0,
          firstMessage: message.createdAt,
          lastMessage: message.createdAt,
        });
      }

      const session = sessionMap.get(key);
      session.messages.push({
        id: message.id,
        role: message.role,
        content: message.content,
        tokenCount: message.tokenCount,
        createdAt: message.createdAt,
      });
      session.messageCount += 1;
      session.totalTokens += message.tokenCount;
      // GPT-4 pricing: ~$0.03 per 1K input tokens, ~$0.06 per 1K output tokens
      session.estimatedCost += (message.tokenCount / 1000) * (message.role === 'user' ? 0.03 : 0.06);
      
      if (message.createdAt < session.firstMessage) {
        session.firstMessage = message.createdAt;
      }
      if (message.createdAt > session.lastMessage) {
        session.lastMessage = message.createdAt;
      }
    });

    const sessions = Array.from(sessionMap.values()).sort(
      (a, b) => b.lastMessage.getTime() - a.lastMessage.getTime()
    );

    // Calculate statistics
    const stats = {
      totalSessions: sessions.length,
      totalMessages: messages.length,
      totalTokens: messages.reduce((sum, msg) => sum + msg.tokenCount, 0),
      estimatedCost: sessions.reduce((sum, session) => sum + session.estimatedCost, 0),
      avgMessagesPerSession: sessions.length > 0 ? Math.round(messages.length / sessions.length) : 0,
      avgTokensPerMessage: messages.length > 0 ? Math.round(
        messages.reduce((sum, msg) => sum + msg.tokenCount, 0) / messages.length
      ) : 0,
      topQuestions: await getTopQuestions(messages),
      hourlyActivity: await getHourlyActivity(messages),
    };

    return NextResponse.json({ sessions, stats });
  } catch (error) {
    console.error('Admin chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat data' },
      { status: 500 }
    );
  }
}

async function getTopQuestions(messages: any[]) {
  const userMessages = messages.filter(m => m.role === 'user');
  const questionMap = new Map<string, number>();

  // Simple keyword extraction for demo
  const keywords = [
    'price', 'cost', 'book', 'schedule', 'appointment', 
    'service', 'area', 'location', 'cancel', 'reschedule'
  ];

  userMessages.forEach(msg => {
    const content = msg.content.toLowerCase();
    keywords.forEach(keyword => {
      if (content.includes(keyword)) {
        const count = questionMap.get(keyword) || 0;
        questionMap.set(keyword, count + 1);
      }
    });
  });

  return Array.from(questionMap.entries())
    .map(([question, count]) => ({ 
      question: question.charAt(0).toUpperCase() + question.slice(1) + ' questions',
      count 
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

async function getHourlyActivity(messages: any[]) {
  const hourCounts = new Array(24).fill(0);
  
  messages.forEach(msg => {
    const hour = new Date(msg.createdAt).getHours();
    hourCounts[hour]++;
  });

  return hourCounts.map((count, hour) => ({ hour, count }));
}