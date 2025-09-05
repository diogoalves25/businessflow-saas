// Marketing segmentation utilities

export interface ContactSegment {
  name: string;
  filter: (contact: any) => boolean;
  description?: string;
}

export const PREDEFINED_SEGMENTS: Record<string, ContactSegment> = {
  all: {
    name: 'All Contacts',
    filter: () => true,
    description: 'All contacts in your database'
  },
  recent: {
    name: 'Recent Contacts',
    filter: (contact) => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(contact.createdAt) > thirtyDaysAgo;
    },
    description: 'Contacts added in the last 30 days'
  },
  active: {
    name: 'Active Customers',
    filter: (contact) => contact.lastBookingDate != null,
    description: 'Contacts who have made bookings'
  },
  inactive: {
    name: 'Inactive Customers',
    filter: (contact) => {
      if (!contact.lastBookingDate) return false;
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      return new Date(contact.lastBookingDate) < ninetyDaysAgo;
    },
    description: 'Contacts who haven\'t booked in 90+ days'
  },
  vip: {
    name: 'VIP Customers',
    filter: (contact) => contact.totalSpent > 1000 || contact.bookingCount > 10,
    description: 'High-value customers'
  },
  emailSubscribed: {
    name: 'Email Subscribers',
    filter: (contact) => contact.emailSubscribed === true,
    description: 'Contacts subscribed to email marketing'
  }
};

export async function getSegmentSize(
  organizationId: string,
  segment: ContactSegment
): Promise<number> {
  // Mock implementation - in production this would query the database
  // with the segment filter applied
  return Math.floor(Math.random() * 100) + 1;
}

export function getSegmentDescription(segmentId: string): string {
  const segment = PREDEFINED_SEGMENTS[segmentId];
  return segment?.description || 'Custom segment';
}