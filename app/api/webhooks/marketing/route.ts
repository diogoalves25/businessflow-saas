import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { processAutomationTrigger } from '@/src/lib/marketing/automation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, organizationId, data } = body;

    if (!event || !organizationId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Process different event types
    switch (event) {
      case 'booking.completed':
        await handleBookingCompleted(organizationId, data);
        break;
        
      case 'booking.cancelled':
        await handleBookingCancelled(organizationId, data);
        break;
        
      case 'customer.created':
        await handleCustomerCreated(organizationId, data);
        break;
        
      case 'review.submitted':
        await handleReviewSubmitted(organizationId, data);
        break;
        
      default:
        console.log(`Unknown marketing event: ${event}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Marketing webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleBookingCompleted(organizationId: string, data: any) {
  const { bookingId, customerId } = data;

  // Create or update marketing contact
  const customer = await prisma.user.findUnique({
    where: { id: customerId },
  });

  if (!customer) return;

  // Check if marketing contact exists
  let contact = await prisma.marketingContact.findUnique({
    where: {
      organizationId_email: {
        organizationId,
        email: customer.email!,
      },
    },
  });

  if (!contact) {
    // Create new contact
    contact = await prisma.marketingContact.create({
      data: {
        organizationId,
        email: customer.email!,
        phone: customer.phone,
        firstName: customer.firstName,
        lastName: customer.lastName,
        source: 'booking',
        tags: ['customer'],
      },
    });
  }

  // Update last booking date and total spent
  const totalSpent = await prisma.booking.aggregate({
    where: {
      organizationId,
      customerId,
      status: 'completed',
    },
    _sum: {
      finalPrice: true,
    },
  });

  await prisma.marketingContact.update({
    where: { id: contact.id },
    data: {
      lastBooking: new Date(),
      totalSpent: totalSpent._sum.finalPrice || 0,
    },
  });

  // Trigger review request automation
  await processAutomationTrigger(organizationId, 'review_request', {
    contactId: contact.id,
    bookingId,
  });
}

async function handleBookingCancelled(organizationId: string, data: any) {
  // Could trigger a win-back campaign after a certain period
  const { customerId } = data;
  
  // Tag the customer as having cancelled
  const customer = await prisma.user.findUnique({
    where: { id: customerId },
  });

  if (!customer) return;

  const contact = await prisma.marketingContact.findUnique({
    where: {
      organizationId_email: {
        organizationId,
        email: customer.email!,
      },
    },
  });

  if (contact && !contact.tags.includes('cancelled_booking')) {
    await prisma.marketingContact.update({
      where: { id: contact.id },
      data: {
        tags: {
          push: 'cancelled_booking',
        },
      },
    });
  }
}

async function handleCustomerCreated(organizationId: string, data: any) {
  const { customerId } = data;

  const customer = await prisma.user.findUnique({
    where: { id: customerId },
  });

  if (!customer) return;

  // Create marketing contact
  const contact = await prisma.marketingContact.create({
    data: {
      organizationId,
      email: customer.email!,
      phone: customer.phone,
      firstName: customer.firstName,
      lastName: customer.lastName,
      source: 'registration',
      tags: ['new_customer'],
    },
  });

  // Trigger welcome series automation
  await processAutomationTrigger(organizationId, 'welcome_series', {
    contactId: contact.id,
  });
}

async function handleReviewSubmitted(organizationId: string, data: any) {
  const { customerId, rating } = data;

  const customer = await prisma.user.findUnique({
    where: { id: customerId },
  });

  if (!customer) return;

  const contact = await prisma.marketingContact.findUnique({
    where: {
      organizationId_email: {
        organizationId,
        email: customer.email!,
      },
    },
  });

  if (contact) {
    // Tag based on rating
    const tag = rating >= 4 ? 'happy_customer' : 'needs_attention';
    
    if (!contact.tags.includes(tag)) {
      await prisma.marketingContact.update({
        where: { id: contact.id },
        data: {
          tags: {
            push: tag,
          },
        },
      });
    }
  }
}