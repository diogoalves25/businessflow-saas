import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// POST: Create new booking
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    
    const {
      serviceId,
      organizationId,
      date,
      time,
      duration,
      frequency,
      address,
      city,
      state,
      zipCode,
      specialInstructions,
      customerEmail,
      customerFirstName,
      customerLastName,
      customerPhone
    } = body;

    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Create or find customer
    let customer = await prisma.user.findUnique({
      where: { email: customerEmail }
    });

    if (!customer) {
      customer = await prisma.user.create({
        data: {
          email: customerEmail,
          firstName: customerFirstName,
          lastName: customerLastName,
          phone: customerPhone,
          role: 'customer'
        }
      });
    }

    // Calculate pricing
    const basePrice = service.basePrice;
    const discount = frequency !== 'once' ? basePrice * 0.1 : 0; // 10% discount for recurring
    const finalPrice = basePrice - discount;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        serviceId,
        organizationId,
        frequency,
        date: new Date(date),
        time,
        duration,
        status: 'scheduled',
        address,
        city,
        state,
        zipCode,
        basePrice,
        discount,
        finalPrice,
        specialInstructions
      },
      include: {
        service: true,
        customer: true,
        technician: true
      }
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

// GET: List bookings (with filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const customerId = searchParams.get('customerId');
    const technicianId = searchParams.get('technicianId');
    const status = searchParams.get('status');
    const date = searchParams.get('date');

    // Build where clause
    const where: any = {};
    if (organizationId) where.organizationId = organizationId;
    if (customerId) where.customerId = customerId;
    if (technicianId) where.technicianId = technicianId;
    if (status) where.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      where.date = {
        gte: startDate,
        lt: endDate
      };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        service: true,
        customer: true,
        technician: true,
        organization: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Bookings fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// PUT: Update booking status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, technicianId, rating, review } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (technicianId) updateData.technicianId = technicianId;
    if (rating) updateData.rating = rating;
    if (review) updateData.review = review;

    const booking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        service: true,
        customer: true,
        technician: true
      }
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Booking update error:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// DELETE: Cancel booking
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID required' },
        { status: 400 }
      );
    }

    // Instead of deleting, update status to cancelled
    const booking = await prisma.booking.update({
      where: { id },
      data: { status: 'cancelled' }
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error('Booking cancellation error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}