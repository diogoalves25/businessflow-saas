import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { NotificationService } from '@/src/lib/notifications';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (for production)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find bookings happening in the next 24 hours that haven't had reminders sent
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const bookingsNeedingReminders = await prisma.booking.findMany({
      where: {
        status: 'scheduled',
        reminderSentAt: null,
        date: {
          gte: now,
          lte: tomorrow
        }
      },
      include: {
        service: true,
        customer: true,
        technician: true,
        organization: true
      }
    });

    console.log(`Found ${bookingsNeedingReminders.length} bookings needing reminders`);

    // Send reminders
    const results = await Promise.allSettled(
      bookingsNeedingReminders.map(async (booking) => {
        try {
          await NotificationService.sendBookingReminder(
            {
              organizationId: booking.organizationId,
              to: {
                email: booking.customer.email,
                phone: booking.customer.phone || undefined
              }
            },
            {
              id: booking.id,
              serviceName: booking.service.name,
              customerName: `${booking.customer.firstName} ${booking.customer.lastName}`,
              scheduledDate: booking.date,
              address: `${booking.address}, ${booking.city}, ${booking.state} ${booking.zipCode}`,
              technicianName: booking.technician 
                ? `${booking.technician.firstName} ${booking.technician.lastName}` 
                : undefined,
            }
          );
          return { bookingId: booking.id, status: 'sent' };
        } catch (error) {
          console.error(`Failed to send reminder for booking ${booking.id}:`, error);
          return { bookingId: booking.id, status: 'failed', error };
        }
      })
    );

    // Count successes and failures
    const sent = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return NextResponse.json({
      success: true,
      totalBookings: bookingsNeedingReminders.length,
      sent,
      failed,
      results
    });
  } catch (error) {
    console.error('Reminder cron job error:', error);
    return NextResponse.json(
      { error: 'Failed to send reminders' },
      { status: 500 }
    );
  }
}

// This endpoint can also be triggered via POST for manual runs
export async function POST(request: NextRequest) {
  return GET(request);
}