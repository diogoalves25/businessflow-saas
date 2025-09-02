import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import bcrypt from 'bcryptjs';
import { businessTemplates } from '@/src/lib/business-templates';
import { NotificationService } from '@/src/lib/notifications';
import { createClient } from '@/src/lib/supabase/server';

// POST: Create new organization during signup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      businessName, 
      businessType, 
      email, 
      password,
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      zipCode
    } = body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Create Supabase auth user first
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: `${firstName} ${lastName}`,
          business_name: businessName
        }
      }
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      return NextResponse.json(
        { error: 'Failed to create authentication account' },
        { status: 400 }
      );
    }

    // Hash password for database storage (as backup)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create organization and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: businessName,
          businessType,
          businessName,
          email,
          phone,
          address,
          city,
          state,
          zipCode
        }
      });

      // Create admin user with Supabase auth ID
      const user = await tx.user.create({
        data: {
          id: authData.user?.id || undefined, // Use Supabase user ID if available
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          role: 'admin',
          organizationId: organization.id
        }
      });

      // Create default services based on business type
      const template = businessTemplates[businessType];
      if (template && template.services) {
        await tx.service.createMany({
          data: template.services.map(service => ({
            name: service.name,
            description: service.name,
            basePrice: service.basePrice,
            duration: service.duration,
            organizationId: organization.id
          }))
        });
      }

      return { organization, user };
    });

    // Send welcome email to new organization
    try {
      await NotificationService.sendWelcomeEmail(email, {
        name: businessName,
        businessType,
        plan: 'basic' // New signups start on basic plan
      });
    } catch (error) {
      // Don't fail signup if email fails
      console.error('Failed to send welcome email:', error);
    }

    return NextResponse.json({
      success: true,
      organization: {
        id: result.organization.id,
        name: result.organization.name,
        businessType: result.organization.businessType
      },
      user: {
        id: result.user.id,
        email: result.user.email,
        name: `${result.user.firstName} ${result.user.lastName}`
      }
    });
  } catch (error) {
    console.error('Organization creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}

// GET: Fetch organization details
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('id');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID required' },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        services: true,
        users: {
          where: { role: 'technician' }
        },
        _count: {
          select: {
            bookings: true,
            users: true
          }
        }
      }
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Organization fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}

// PUT: Update organization settings
export async function PUT(request: NextRequest) {
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
    
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Organization ID required' },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Organization update error:', error);
    return NextResponse.json(
      { error: 'Failed to update organization' },
      { status: 500 }
    );
  }
}