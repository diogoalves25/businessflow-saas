import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';
import { prisma } from '@/src/lib/prisma';
import { canAccessFeature } from '@/src/lib/feature-gating';
import { syncContactsFromBookings } from '@/src/lib/marketing/segmentation';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
      include: { organization: true }
    });

    if (!dbUser?.organization) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    // Check Premium access
    if (!canAccessFeature(dbUser.organization.stripePriceId || null, 'hasMarketingTools')) {
      return NextResponse.json({ error: 'Marketing features require Premium plan' }, { status: 403 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = { organizationId: dbUser.organization.id };
    
    if (tag) {
      where.tags = { has: tag };
    }
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const contacts = await prisma.marketingContact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { activities: true }
        }
      }
    });

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error('Get contacts error:', error);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
      include: { organization: true }
    });

    if (!dbUser?.organization) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    // Check Premium access
    if (!canAccessFeature(dbUser.organization.stripePriceId || null, 'hasMarketingTools')) {
      return NextResponse.json({ error: 'Marketing features require Premium plan' }, { status: 403 });
    }

    const body = await request.json();
    
    // Check if it's a sync request
    if (body.action === 'sync') {
      await syncContactsFromBookings(dbUser.organization.id);
      return NextResponse.json({ success: true, message: 'Contacts synced from bookings' });
    }

    // Otherwise, create a new contact
    const { email, phone, firstName, lastName, tags, emailOptIn, smsOptIn } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if contact already exists
    const existingContact = await prisma.marketingContact.findUnique({
      where: {
        organizationId_email: {
          organizationId: dbUser.organization.id,
          email,
        },
      },
    });

    if (existingContact) {
      return NextResponse.json({ error: 'Contact already exists' }, { status: 409 });
    }

    const contact = await prisma.marketingContact.create({
      data: {
        organizationId: dbUser.organization.id,
        email,
        phone,
        firstName,
        lastName,
        tags: tags || [],
        emailOptIn: emailOptIn ?? true,
        smsOptIn: smsOptIn ?? true,
        source: 'manual',
      },
    });

    return NextResponse.json({ contact });
  } catch (error) {
    console.error('Create contact error:', error);
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
}