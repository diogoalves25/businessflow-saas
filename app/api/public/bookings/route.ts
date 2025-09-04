import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendBookingConfirmation } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      organizationId,
      serviceId,
      date,
      time,
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      specialInstructions,
    } = body;

    // Validate required fields
    if (!organizationId || !serviceId || !date || !time || !firstName || !lastName || !email || !phone || !address || !city || !state || !zipCode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get service details
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        organizationId,
      },
    });

    if (!service) {
      return NextResponse.json({ error: 'Invalid service' }, { status: 400 });
    }

    // Create or find customer
    let customer = await prisma.user.findUnique({
      where: { email },
    });

    if (!customer) {
      customer = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          phone,
          role: 'customer',
          organizationId,
        },
      });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        serviceId,
        organizationId,
        frequency: 'once',
        date: new Date(date),
        time,
        duration: service.duration.toString(),
        status: 'scheduled',
        address,
        city,
        state,
        zipCode,
        basePrice: service.basePrice,
        finalPrice: service.basePrice,
        specialInstructions,
      },
      include: {
        service: true,
        customer: true,
        organization: {
          include: {
            whiteLabelSettings: true,
          },
        },
      },
    });

    // Send confirmation email with white label settings
    try {
      await sendBookingConfirmation(booking, booking.organization.whiteLabelSettings);
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Don't fail the booking if email fails
    }

    return NextResponse.json({
      id: booking.id,
      service: booking.service.name,
      date: booking.date,
      time: booking.time,
      address: `${booking.address}, ${booking.city}, ${booking.state} ${booking.zipCode}`,
      price: booking.finalPrice,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}