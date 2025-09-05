import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';
import OpenAI from 'openai';
import { prisma } from '@/src/lib/prisma';
import { canAccessFeature } from '@/src/lib/feature-gating';
import { BusinessType } from '@prisma/client';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// System prompts for each business type
const getSystemPrompt = (businessType: BusinessType, orgName: string, services: any[]) => {
  const basePrompt = `You are a helpful AI assistant for ${orgName}, a ${businessType.toLowerCase()} business. 
Your role is to help customers with appointments, answer questions, and provide information about our services.
Be professional, friendly, and concise. Always maintain a helpful tone.`;
  
  const serviceList = services.map(s => `- ${s.name}: $${s.basePrice}, ${s.duration} minutes`).join('\n');
  
  const businessPrompts: Record<BusinessType | string, string> = {
    DENTAL: `${basePrompt}
    
Specialized knowledge: You can help with dental appointment scheduling, insurance questions, and basic dental care advice.
Our services include:
${serviceList}

Common questions: appointment scheduling, insurance coverage, payment plans, emergency services, dental hygiene tips.
Always recommend consulting with a dentist for specific medical advice.`,

    PLUMBING: `${basePrompt}
    
Specialized knowledge: You can assist with plumbing emergencies, scheduling service calls, and basic troubleshooting.
Our services include:
${serviceList}

Common questions: emergency services, scheduling, pricing estimates, basic DIY fixes, water conservation tips.
For emergencies, emphasize our 24/7 availability and quick response times.`,

    CLEANING: `${basePrompt}
    
Specialized knowledge: You can help schedule cleaning services, explain our cleaning process, and answer questions about pricing.
Our services include:
${serviceList}

Common questions: scheduling frequency, cleaning products used, pricing, special requests, eco-friendly options.
Emphasize our attention to detail and satisfaction guarantee.`,

    LANDSCAPING: `${basePrompt}
    
Specialized knowledge: You can help schedule landscaping services, provide plant care advice, and discuss design options.
Our services include:
${serviceList}

Common questions: seasonal services, maintenance plans, plant recommendations, irrigation, design consultations.
Can provide basic gardening tips while promoting our professional services.`,

    HVAC: `${basePrompt}
    
Specialized knowledge: You can help with HVAC service scheduling, maintenance questions, and energy efficiency tips.
Our services include:
${serviceList}

Common questions: maintenance schedules, emergency repairs, energy savings, system upgrades, indoor air quality.
Emphasize the importance of regular maintenance for system longevity.`,

    AUTO_REPAIR: `${basePrompt}
    
Specialized knowledge: You can help schedule auto services, explain maintenance needs, and answer basic car care questions.
Our services include:
${serviceList}

Common questions: maintenance schedules, repair estimates, warranty information, emergency services, preventive care.
Can provide basic maintenance tips while encouraging professional service.`,

    TUTORING: `${basePrompt}
    
Specialized knowledge: You can help schedule tutoring sessions, explain our teaching methods, and answer questions about subjects covered.
Our services include:
${serviceList}

Common questions: scheduling, subject areas, teaching methods, progress tracking, group vs individual sessions.
Focus on personalized learning and student success.`,

    FITNESS: `${basePrompt}
    
Specialized knowledge: You can help with class scheduling, membership questions, and basic fitness guidance.
Our services include:
${serviceList}

Common questions: class schedules, membership options, personal training, equipment, fitness goals.
Can provide general fitness tips while promoting our professional training services.`,

    BEAUTY: `${basePrompt}
    
Specialized knowledge: You can help schedule beauty services, explain treatments, and answer product questions.
Our services include:
${serviceList}

Common questions: service scheduling, treatment details, product recommendations, pricing, special offers.
Focus on helping clients feel confident and beautiful.`,

    CATERING: `${basePrompt}
    
Specialized knowledge: You can help with catering orders, menu planning, and event coordination.
Our services include:
${serviceList}

Common questions: menu options, dietary restrictions, pricing, delivery, event planning, minimum orders.
Focus on making their event special and stress-free.`,

    DEFAULT: `${basePrompt}
    
Our services include:
${serviceList}

I can help you schedule appointments, answer questions about our services, and provide general information.`
  };

  return businessPrompts[businessType] || businessPrompts.DEFAULT;
};

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's organization and check Premium access
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { 
        organization: {
          include: {
            services: true
          }
        }
      }
    });

    if (!dbUser?.organization) {
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 404 }
      );
    }

    // Check if user has Premium plan
    if (!canAccessFeature(dbUser.organization.stripePriceId, 'hasAIOptimization')) {
      return NextResponse.json(
        { error: 'AI Chat requires Premium plan' },
        { status: 403 }
      );
    }

    if (!openai) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    const { messages, sessionId } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Get system prompt with business context
    const systemPrompt = getSystemPrompt(
      dbUser.organization.businessType,
      dbUser.organization.businessName,
      dbUser.organization.services
    );

    // Create messages array with system prompt
    const allMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    // Create streaming response
    const stream = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: allMessages as any,
      temperature: 0.7,
      max_tokens: 500,
      stream: true,
    });

    // Store the conversation start
    const userMessage = messages[messages.length - 1];
    if (userMessage && userMessage.role === 'user') {
      await prisma.chatMessage.create({
        data: {
          organizationId: dbUser.organization.id,
          userId: user.id,
          sessionId: sessionId || 'default',
          role: 'user',
          content: userMessage.content,
          tokenCount: userMessage.content.length / 4, // Rough estimate
        }
      });
    }

    // Set up streaming response
    const encoder = new TextEncoder();
    let assistantMessage = '';
    let tokenCount = 0;
    
    // Capture organization ID outside the async callback
    const organizationId = dbUser.organization.id;

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || '';
            if (text) {
              assistantMessage += text;
              tokenCount += text.length / 4; // Rough estimate
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }

          // Store assistant's response
          if (assistantMessage) {
            await prisma.chatMessage.create({
              data: {
                organizationId,
                userId: user.id,
                sessionId: sessionId || 'default',
                role: 'assistant',
                content: assistantMessage,
                tokenCount,
              }
            });

            // Update organization's token usage for cost tracking
            await prisma.organization.update({
              where: { id: organizationId },
              data: {
                aiTokensUsed: {
                  increment: tokenCount
                }
              }
            });
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process chat' },
      { status: 500 }
    );
  }
}

// GET: Retrieve chat history
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId') || 'default';

    // Get user's organization
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { organization: true }
    });

    if (!dbUser?.organization) {
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 404 }
      );
    }

    // Get chat history
    const messages = await prisma.chatMessage.findMany({
      where: {
        organizationId: dbUser.organization.id,
        sessionId,
        userId: user.id
      },
      orderBy: { createdAt: 'asc' },
      take: 50, // Limit to last 50 messages
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Chat history error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve chat history' },
      { status: 500 }
    );
  }
}