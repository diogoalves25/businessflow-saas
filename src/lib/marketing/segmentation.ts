import { prisma } from '../prisma';
import { MarketingContact } from '@prisma/client';
import { addDays, subDays } from 'date-fns';

export interface SegmentRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'exists' | 'not_exists';
  value?: any;
}

export interface Segment {
  name: string;
  rules: SegmentRule[];
  logic: 'AND' | 'OR';
}

export const PREDEFINED_SEGMENTS: Record<string, Segment> = {
  active_customers: {
    name: 'Active Customers',
    rules: [
      { field: 'lastBooking', operator: 'greater_than' as const, value: subDays(new Date(), 30) },
      { field: 'subscribed', operator: 'equals' as const, value: true }
    ],
    logic: 'AND'
  },
  lapsed_customers: {
    name: 'Lapsed Customers',
    rules: [
      { field: 'lastBooking', operator: 'less_than' as const, value: subDays(new Date(), 60) },
      { field: 'lastBooking', operator: 'greater_than' as const, value: subDays(new Date(), 180) },
      { field: 'subscribed', operator: 'equals' as const, value: true }
    ],
    logic: 'AND'
  },
  new_customers: {
    name: 'New Customers',
    rules: [
      { field: 'createdAt', operator: 'greater_than' as const, value: subDays(new Date(), 7) },
      { field: 'totalSpent', operator: 'less_than' as const, value: 100 }
    ],
    logic: 'AND'
  },
  high_value: {
    name: 'High Value Customers',
    rules: [
      { field: 'totalSpent', operator: 'greater_than' as const, value: 500 },
      { field: 'subscribed', operator: 'equals' as const, value: true }
    ],
    logic: 'AND'
  },
  email_only: {
    name: 'Email Only',
    rules: [
      { field: 'emailOptIn', operator: 'equals' as const, value: true },
      { field: 'smsOptIn', operator: 'equals' as const, value: false }
    ],
    logic: 'AND'
  },
  sms_only: {
    name: 'SMS Only',
    rules: [
      { field: 'emailOptIn', operator: 'equals' as const, value: false },
      { field: 'smsOptIn', operator: 'equals' as const, value: true }
    ],
    logic: 'AND'
  }
};

export async function evaluateSegment(
  organizationId: string,
  segment: Segment
): Promise<MarketingContact[]> {
  // Build Prisma where clause from segment rules
  const whereConditions = segment.rules.map(rule => {
    switch (rule.operator) {
      case 'equals':
        return { [rule.field]: rule.value };
      
      case 'not_equals':
        return { [rule.field]: { not: rule.value } };
      
      case 'contains':
        if (rule.field === 'tags') {
          return { tags: { has: rule.value } };
        }
        return { [rule.field]: { contains: rule.value } };
      
      case 'greater_than':
        return { [rule.field]: { gt: rule.value } };
      
      case 'less_than':
        return { [rule.field]: { lt: rule.value } };
      
      case 'in':
        return { [rule.field]: { in: rule.value } };
      
      case 'not_in':
        return { [rule.field]: { notIn: rule.value } };
      
      case 'exists':
        return { [rule.field]: { not: null } };
      
      case 'not_exists':
        return { [rule.field]: null };
      
      default:
        return {};
    }
  });

  const where = {
    organizationId,
    ...(segment.logic === 'AND' 
      ? { AND: whereConditions }
      : { OR: whereConditions }
    )
  };

  return prisma.marketingContact.findMany({ where });
}

export async function getSegmentSize(
  organizationId: string,
  segment: Segment
): Promise<number> {
  const contacts = await evaluateSegment(organizationId, segment);
  return contacts.length;
}

export async function getContactSegments(
  contact: MarketingContact
): Promise<string[]> {
  const segments: string[] = [];

  // Check predefined segments
  for (const [key, segment] of Object.entries(PREDEFINED_SEGMENTS)) {
    if (await isContactInSegment(contact, segment)) {
      segments.push(key);
    }
  }

  // Check custom tags
  segments.push(...contact.tags);

  return segments;
}

async function isContactInSegment(
  contact: MarketingContact,
  segment: Segment
): Promise<boolean> {
  const results = segment.rules.map(rule => {
    const fieldValue = (contact as any)[rule.field];

    switch (rule.operator) {
      case 'equals':
        return fieldValue === rule.value;
      
      case 'not_equals':
        return fieldValue !== rule.value;
      
      case 'contains':
        if (Array.isArray(fieldValue)) {
          return fieldValue.includes(rule.value);
        }
        return String(fieldValue).includes(rule.value);
      
      case 'greater_than':
        if (fieldValue instanceof Date && rule.value instanceof Date) {
          return fieldValue > rule.value;
        }
        return Number(fieldValue) > Number(rule.value);
      
      case 'less_than':
        if (fieldValue instanceof Date && rule.value instanceof Date) {
          return fieldValue < rule.value;
        }
        return Number(fieldValue) < Number(rule.value);
      
      case 'in':
        return rule.value.includes(fieldValue);
      
      case 'not_in':
        return !rule.value.includes(fieldValue);
      
      case 'exists':
        return fieldValue !== null && fieldValue !== undefined;
      
      case 'not_exists':
        return fieldValue === null || fieldValue === undefined;
      
      default:
        return false;
    }
  });

  return segment.logic === 'AND' 
    ? results.every(r => r)
    : results.some(r => r);
}

// Sync customers from bookings
export async function syncContactsFromBookings(organizationId: string) {
  const bookings = await prisma.booking.findMany({
    where: { organizationId },
    include: { customer: true },
    distinct: ['customerId'],
  });

  for (const booking of bookings) {
    const customer = booking.customer;
    
    // Check if contact already exists
    const existingContact = await prisma.marketingContact.findUnique({
      where: {
        organizationId_email: {
          organizationId,
          email: customer.email,
        },
      },
    });

    if (!existingContact) {
      // Calculate total spent
      const totalSpent = await prisma.booking.aggregate({
        where: {
          organizationId,
          customerId: customer.id,
          status: 'completed',
        },
        _sum: {
          finalPrice: true,
        },
      });

      // Get last booking date
      const lastBooking = await prisma.booking.findFirst({
        where: {
          organizationId,
          customerId: customer.id,
          status: 'completed',
        },
        orderBy: { date: 'desc' },
      });

      // Create new contact
      await prisma.marketingContact.create({
        data: {
          organizationId,
          email: customer.email,
          phone: customer.phone,
          firstName: customer.firstName,
          lastName: customer.lastName,
          totalSpent: totalSpent._sum.finalPrice || 0,
          lastBooking: lastBooking?.date,
          source: 'booking',
          tags: ['customer'],
        },
      });
    } else {
      // Update existing contact
      const totalSpent = await prisma.booking.aggregate({
        where: {
          organizationId,
          customerId: customer.id,
          status: 'completed',
        },
        _sum: {
          finalPrice: true,
        },
      });

      const lastBooking = await prisma.booking.findFirst({
        where: {
          organizationId,
          customerId: customer.id,
          status: 'completed',
        },
        orderBy: { date: 'desc' },
      });

      await prisma.marketingContact.update({
        where: { id: existingContact.id },
        data: {
          totalSpent: totalSpent._sum.finalPrice || 0,
          lastBooking: lastBooking?.date,
        },
      });
    }
  }
}

// Tag management
export async function addTagsToContacts(
  contactIds: string[],
  tags: string[]
) {
  await prisma.$transaction(
    contactIds.map(id =>
      prisma.marketingContact.update({
        where: { id },
        data: {
          tags: {
            push: tags,
          },
        },
      })
    )
  );
}

export async function removeTagsFromContacts(
  contactIds: string[],
  tags: string[]
) {
  const contacts = await prisma.marketingContact.findMany({
    where: { id: { in: contactIds } },
  });

  await prisma.$transaction(
    contacts.map(contact =>
      prisma.marketingContact.update({
        where: { id: contact.id },
        data: {
          tags: contact.tags.filter(t => !tags.includes(t)),
        },
      })
    )
  );
}