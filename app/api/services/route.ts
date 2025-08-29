import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

// GET: List services by organization
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID required' },
        { status: 400 }
      );
    }

    const services = await prisma.service.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error('Services fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

// POST: Create custom service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, basePrice, duration, organizationId, icon } = body;

    if (!name || !basePrice || !duration || !organizationId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: {
        name,
        description: description || name,
        basePrice,
        duration,
        organizationId,
        icon
      }
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error('Service creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
}

// PUT: Update service pricing
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Service ID required' },
        { status: 400 }
      );
    }

    const service = await prisma.service.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error('Service update error:', error);
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    );
  }
}

// DELETE: Remove service
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Service ID required' },
        { status: 400 }
      );
    }

    // Check if service has bookings
    const bookingsCount = await prisma.booking.count({
      where: { serviceId: id }
    });

    if (bookingsCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete service with existing bookings' },
        { status: 400 }
      );
    }

    await prisma.service.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Service deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    );
  }
}