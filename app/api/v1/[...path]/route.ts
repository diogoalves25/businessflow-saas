import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

// This catches all API routes under /api/v1/*
// and applies white label branding to responses

async function getOrganizationFromRequest(request: NextRequest) {
  const headersList = headers();
  const host = headersList.get('host') || '';
  const apiKey = headersList.get('x-api-key') || '';
  
  // Check if request is from a subdomain
  const subdomain = host.split('.')[0];
  if (subdomain && subdomain !== 'api' && subdomain !== 'app' && subdomain !== 'localhost') {
    // Find organization by subdomain
    const org = await prisma.organization.findFirst({
      where: { id: subdomain },
      include: { whiteLabelSettings: true },
    });
    return org;
  }
  
  // Otherwise, check API key
  if (apiKey) {
    // In production, you'd have an API keys table
    // For now, we'll use the organization ID as the API key
    const org = await prisma.organization.findFirst({
      where: { id: apiKey },
      include: { whiteLabelSettings: true },
    });
    return org;
  }
  
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const organization = await getOrganizationFromRequest(request);
  const path = params.path.join('/');
  
  // Route to appropriate handler based on path
  switch (path) {
    case 'services':
      return handleGetServices(organization);
    case 'bookings':
      return handleGetBookings(organization);
    case 'availability':
      return handleGetAvailability(organization);
    default:
      return NextResponse.json(
        { 
          error: 'Endpoint not found',
          documentation: organization?.whiteLabelSettings?.brandName 
            ? `https://api.${organization.whiteLabelSettings.brandName.toLowerCase()}.com/docs`
            : 'https://api.businessflow.com/docs'
        },
        { status: 404 }
      );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const organization = await getOrganizationFromRequest(request);
  const path = params.path.join('/');
  
  if (!organization) {
    return NextResponse.json(
      { error: 'Invalid API key or subdomain' },
      { status: 401 }
    );
  }
  
  switch (path) {
    case 'bookings':
      return handleCreateBooking(request, organization);
    default:
      return NextResponse.json(
        { error: 'Endpoint not found' },
        { status: 404 }
      );
  }
}

async function handleGetServices(organization: any) {
  if (!organization) {
    return NextResponse.json(
      { error: 'Organization not found' },
      { status: 404 }
    );
  }
  
  const services = await prisma.service.findMany({
    where: { organizationId: organization.id },
    select: {
      id: true,
      name: true,
      description: true,
      duration: true,
      basePrice: true,
    },
  });
  
  const response = {
    services,
    _metadata: {
      count: services.length,
      api_version: 'v1',
    },
  };
  
  // Add white label branding to response
  if (organization.whiteLabelSettings?.removeBusinessFlowBranding) {
    response._metadata.provider = organization.whiteLabelSettings.brandName;
  } else {
    response._metadata.provider = 'BusinessFlow';
    response._metadata.powered_by = 'BusinessFlow';
  }
  
  return NextResponse.json(response);
}

async function handleGetBookings(organization: any) {
  if (!organization) {
    return NextResponse.json(
      { error: 'Organization not found' },
      { status: 404 }
    );
  }
  
  const bookings = await prisma.booking.findMany({
    where: { organizationId: organization.id },
    include: {
      service: true,
      customer: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: { date: 'desc' },
    take: 100,
  });
  
  const response = {
    bookings: bookings.map(booking => ({
      id: booking.id,
      service: booking.service.name,
      customer: `${booking.customer.firstName} ${booking.customer.lastName}`,
      date: booking.date,
      time: booking.time,
      status: booking.status,
      price: booking.finalPrice,
    })),
    _metadata: {
      count: bookings.length,
      api_version: 'v1',
    },
  };
  
  if (organization.whiteLabelSettings?.removeBusinessFlowBranding) {
    response._metadata.provider = organization.whiteLabelSettings.brandName;
  } else {
    response._metadata.provider = 'BusinessFlow';
    response._metadata.powered_by = 'BusinessFlow';
  }
  
  return NextResponse.json(response);
}

async function handleGetAvailability(organization: any) {
  if (!organization) {
    return NextResponse.json(
      { error: 'Organization not found' },
      { status: 404 }
    );
  }
  
  // Simplified availability response
  const availability = {
    available_slots: [
      { date: '2024-01-20', times: ['9:00 AM', '10:00 AM', '2:00 PM', '3:00 PM'] },
      { date: '2024-01-21', times: ['10:00 AM', '11:00 AM', '3:00 PM', '4:00 PM'] },
    ],
    _metadata: {
      timezone: 'America/New_York',
      api_version: 'v1',
    },
  };
  
  if (organization.whiteLabelSettings?.removeBusinessFlowBranding) {
    availability._metadata.provider = organization.whiteLabelSettings.brandName;
  } else {
    availability._metadata.provider = 'BusinessFlow';
    availability._metadata.powered_by = 'BusinessFlow';
  }
  
  return NextResponse.json(availability);
}

async function handleCreateBooking(request: NextRequest, organization: any) {
  try {
    const body = await request.json();
    
    // Create booking similar to public booking endpoint
    const booking = await prisma.booking.create({
      data: {
        ...body,
        organizationId: organization.id,
        status: 'scheduled',
      },
    });
    
    const response = {
      booking: {
        id: booking.id,
        status: booking.status,
        confirmation_number: booking.id.slice(-8).toUpperCase(),
      },
      _metadata: {
        api_version: 'v1',
      },
    };
    
    if (organization.whiteLabelSettings?.removeBusinessFlowBranding) {
      response._metadata.provider = organization.whiteLabelSettings.brandName;
    } else {
      response._metadata.provider = 'BusinessFlow';
      response._metadata.powered_by = 'BusinessFlow';
    }
    
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}