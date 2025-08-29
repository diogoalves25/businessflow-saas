import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Regular Cleaning',
        description: 'Standard home service',
        basePrice: 80,
        icon: 'Home',
      },
    }),
    prisma.service.create({
      data: {
        name: 'Deep Cleaning',
        description: 'Thorough deep service',
        basePrice: 150,
        icon: 'Sparkles',
      },
    }),
    prisma.service.create({
      data: {
        name: 'Move-in/Move-out',
        description: 'Complete cleaning for moving',
        basePrice: 200,
        icon: 'Home',
      },
    }),
    prisma.service.create({
      data: {
        name: 'Office Cleaning',
        description: 'Professional office cleaning',
        basePrice: 120,
        icon: 'Home',
      },
    }),
  ]);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@businessflow.com',
      firstName: 'Admin',
      lastName: 'User',
      phone: '555-0100',
      role: 'admin',
    },
  });

  // Create technicians
  const technicians = await Promise.all([
    prisma.user.create({
      data: {
        email: 'maria.garcia@businessflow.com',
        firstName: 'Maria',
        lastName: 'Garcia',
        phone: '555-0101',
        role: 'technician',
      },
    }),
    prisma.user.create({
      data: {
        email: 'john.smith@businessflow.com',
        firstName: 'John',
        lastName: 'Smith',
        phone: '555-0102',
        role: 'technician',
      },
    }),
    prisma.user.create({
      data: {
        email: 'anna.lee@businessflow.com',
        firstName: 'Anna',
        lastName: 'Lee',
        phone: '555-0103',
        role: 'technician',
      },
    }),
    prisma.user.create({
      data: {
        email: 'robert.chen@businessflow.com',
        firstName: 'Robert',
        lastName: 'Chen',
        phone: '555-0104',
        role: 'technician',
      },
    }),
  ]);

  // Create customers
  const customers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'sarah.johnson@example.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        phone: '555-0201',
        role: 'customer',
      },
    }),
    prisma.user.create({
      data: {
        email: 'mike.williams@example.com',
        firstName: 'Mike',
        lastName: 'Williams',
        phone: '555-0202',
        role: 'customer',
      },
    }),
    prisma.user.create({
      data: {
        email: 'emily.davis@example.com',
        firstName: 'Emily',
        lastName: 'Davis',
        phone: '555-0203',
        role: 'customer',
      },
    }),
    prisma.user.create({
      data: {
        email: 'james.brown@example.com',
        firstName: 'James',
        lastName: 'Brown',
        phone: '555-0204',
        role: 'customer',
      },
    }),
    prisma.user.create({
      data: {
        email: 'lisa.anderson@example.com',
        firstName: 'Lisa',
        lastName: 'Anderson',
        phone: '555-0205',
        role: 'customer',
      },
    }),
  ]);

  // Create bookings
  const now = new Date();
  const bookings = await Promise.all([
    prisma.booking.create({
      data: {
        customerId: customers[0].id,
        technicianId: technicians[0].id,
        serviceId: services[0].id,
        frequency: 'weekly',
        date: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Yesterday
        time: '9:00 AM',
        duration: '3',
        status: 'completed',
        address: '123 Oak Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        basePrice: 80,
        discount: 20,
        finalPrice: 64,
        rating: 5,
        review: 'Excellent service! Very thorough and professional.',
      },
    }),
    prisma.booking.create({
      data: {
        customerId: customers[1].id,
        technicianId: technicians[1].id,
        serviceId: services[1].id,
        frequency: 'once',
        date: now,
        time: '2:00 PM',
        duration: '4',
        status: 'in_progress',
        address: '456 Pine Avenue',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94103',
        basePrice: 150,
        discount: 0,
        finalPrice: 150,
      },
    }),
    prisma.booking.create({
      data: {
        customerId: customers[2].id,
        technicianId: technicians[2].id,
        serviceId: services[2].id,
        frequency: 'once',
        date: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
        time: '10:00 AM',
        duration: '5',
        status: 'scheduled',
        address: '789 Elm Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94104',
        basePrice: 200,
        discount: 0,
        finalPrice: 200,
        specialInstructions: 'Please be careful with the antique furniture.',
      },
    }),
    prisma.booking.create({
      data: {
        customerId: customers[3].id,
        technicianId: technicians[3].id,
        serviceId: services[3].id,
        frequency: 'monthly',
        date: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
        time: '4:00 PM',
        duration: '3',
        status: 'scheduled',
        address: '321 Market Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        basePrice: 120,
        discount: 10,
        finalPrice: 108,
      },
    }),
    prisma.booking.create({
      data: {
        customerId: customers[4].id,
        technicianId: technicians[0].id,
        serviceId: services[0].id,
        frequency: 'biweekly',
        date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        time: '11:00 AM',
        duration: '3',
        status: 'scheduled',
        address: '555 Broadway',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94106',
        basePrice: 80,
        discount: 15,
        finalPrice: 68,
      },
    }),
  ]);

  // Create revenue data for the last 6 months
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const revenues = [42000, 45000, 43500, 48000, 51000, 45680];
  const currentYear = new Date().getFullYear();

  await Promise.all(
    months.map((month, index) =>
      prisma.revenue.create({
        data: {
          month,
          year: currentYear,
          amount: revenues[index],
        },
      })
    )
  );

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });