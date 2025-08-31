import { prisma } from './prisma';
import { Booking, User } from '@prisma/client';
import { startOfWeek, endOfWeek, differenceInMinutes } from 'date-fns';

interface PayrollCalculation {
  userId: string;
  user: User;
  bookings: Booking[];
  hoursWorked: number;
  hourlyRate: number;
  grossAmount: number;
  taxWithholding: number;
  netAmount: number;
  tips: number;
  bonus: number;
}

interface PayrollPeriod {
  start: Date;
  end: Date;
}

// Simple tax calculation (for demo - in production use a proper tax API)
const FEDERAL_TAX_RATE = 0.15; // 15% federal tax
const STATE_TAX_RATE = 0.05; // 5% state tax
const FICA_RATE = 0.0765; // 7.65% FICA (Social Security + Medicare)

export async function calculatePayrollForPeriod(
  organizationId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<PayrollCalculation[]> {
  // Get all technicians in the organization
  const technicians = await prisma.user.findMany({
    where: {
      organizationId,
      role: 'technician',
    },
  });

  // Get all completed bookings in the period
  const bookings = await prisma.booking.findMany({
    where: {
      organizationId,
      status: 'completed',
      date: {
        gte: periodStart,
        lte: periodEnd,
      },
      technicianId: {
        not: null,
      },
    },
    include: {
      technician: true,
      service: true,
    },
  });

  // Group bookings by technician
  const bookingsByTechnician = bookings.reduce((acc, booking) => {
    if (!booking.technicianId) return acc;
    
    if (!acc[booking.technicianId]) {
      acc[booking.technicianId] = [];
    }
    acc[booking.technicianId].push(booking);
    return acc;
  }, {} as Record<string, Booking[]>);

  // Calculate payroll for each technician
  const calculations: PayrollCalculation[] = await Promise.all(
    technicians.map(async (technician) => {
      const technicianBookings = bookingsByTechnician[technician.id] || [];
      
      // Calculate total hours worked
      const hoursWorked = technicianBookings.reduce((total, booking) => {
        // Parse duration string (e.g., "2 hours", "90 minutes")
        const durationMatch = booking.duration.match(/(\d+)\s*(hour|minute)/i);
        if (durationMatch) {
          const value = parseInt(durationMatch[1]);
          const unit = durationMatch[2].toLowerCase();
          return total + (unit.startsWith('hour') ? value : value / 60);
        }
        return total;
      }, 0);

      // Get hourly rate (default to $20/hour if not set)
      const hourlyRate = technician.hourlyRate || 20;

      // Calculate tips (assuming tips are stored as part of booking price)
      const tips = technicianBookings.reduce((total, booking) => {
        // Simple calculation: 10% of booking as tip (in real app, track actual tips)
        return total + (booking.finalPrice * 0.1);
      }, 0);

      // Calculate gross pay
      const baseAmount = hoursWorked * hourlyRate;
      const bonus = 0; // Could add performance bonuses here
      const grossAmount = baseAmount + tips + bonus;

      // Calculate tax withholding
      const federalTax = grossAmount * FEDERAL_TAX_RATE;
      const stateTax = grossAmount * STATE_TAX_RATE;
      const fica = grossAmount * FICA_RATE;
      const taxWithholding = federalTax + stateTax + fica;

      // Calculate net pay
      const netAmount = grossAmount - taxWithholding;

      return {
        userId: technician.id,
        user: technician,
        bookings: technicianBookings,
        hoursWorked: Math.round(hoursWorked * 100) / 100,
        hourlyRate,
        grossAmount: Math.round(grossAmount * 100) / 100,
        taxWithholding: Math.round(taxWithholding * 100) / 100,
        netAmount: Math.round(netAmount * 100) / 100,
        tips: Math.round(tips * 100) / 100,
        bonus,
      };
    })
  );

  return calculations.filter(calc => calc.hoursWorked > 0);
}

export async function createPayrollRun(
  organizationId: string,
  periodStart: Date,
  periodEnd: Date,
  calculations: PayrollCalculation[]
): Promise<string> {
  const totalAmount = calculations.reduce((sum, calc) => sum + calc.netAmount, 0);

  // Create payroll run
  const payrollRun = await prisma.payrollRun.create({
    data: {
      organizationId,
      periodStart,
      periodEnd,
      totalAmount,
      payments: {
        create: calculations.map(calc => ({
          userId: calc.userId,
          hoursWorked: calc.hoursWorked,
          hourlyRate: calc.hourlyRate,
          grossAmount: calc.grossAmount,
          netAmount: calc.netAmount,
          taxWithholding: calc.taxWithholding,
        })),
      },
    },
    include: {
      payments: true,
    },
  });

  return payrollRun.id;
}

export async function getPayrollHistory(
  organizationId: string,
  limit: number = 10
) {
  return prisma.payrollRun.findMany({
    where: { organizationId },
    include: {
      payments: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export function getCurrentPayPeriod(): PayrollPeriod {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(now, { weekStartsOn: 1 }); // Sunday
  
  return { start, end };
}

export function getPreviousPayPeriod(): PayrollPeriod {
  const current = getCurrentPayPeriod();
  const start = new Date(current.start);
  start.setDate(start.getDate() - 7);
  const end = new Date(current.end);
  end.setDate(end.getDate() - 7);
  
  return { start, end };
}