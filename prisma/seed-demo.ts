import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { addDays, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting demo data seed...');

  // Create demo organizations
  const sparkleClean = await prisma.organization.create({
    data: {
      name: 'Sparkle Clean Services',
      businessType: 'CLEANING',
      businessName: 'Sparkle Clean Services',
      email: 'contact@sparkleclean.demo',
    },
  });

  const quickFixPlumbing = await prisma.organization.create({
    data: {
      name: 'QuickFix Plumbing',
      businessType: 'PLUMBING',
      businessName: 'QuickFix Plumbing',
      email: 'contact@quickfix.demo',
    },
  });

  const brightDental = await prisma.organization.create({
    data: {
      name: 'Bright Dental Care',
      businessType: 'DENTAL',
      businessName: 'Bright Dental Care',
      email: 'contact@brightdental.demo',
    },
  });

  // Create demo users
  const hashedPassword = await bcrypt.hash('demo123', 10);

  const sparkleUser = await prisma.user.create({
    data: {
      email: 'demo@sparkleclean.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '(555) 123-4567',
      role: 'admin',
      organizationId: sparkleClean.id,
    },
  });

  // Update organization with premium subscription
  await prisma.organization.update({
    where: { id: sparkleClean.id },
    data: {
      stripePriceId: process.env.STRIPE_PRICE_PREMIUM_ID || 'price_premium',
      subscriptionStatus: 'active',
      subscriptionEndsAt: addDays(new Date(), 30),
    },
  });

  const plumbingUser = await prisma.user.create({
    data: {
      email: 'demo@quickfixplumbing.com',
      password: hashedPassword,
      firstName: 'Mike',
      lastName: 'Roberts',
      phone: '(555) 234-5678',
      role: 'admin',
      organizationId: quickFixPlumbing.id,
    },
  });

  // Update organization with growth subscription
  await prisma.organization.update({
    where: { id: quickFixPlumbing.id },
    data: {
      stripePriceId: process.env.STRIPE_PRICE_GROWTH_ID || 'price_growth',
      subscriptionStatus: 'active',
      subscriptionEndsAt: addDays(new Date(), 30),
    },
  });

  const dentalUser = await prisma.user.create({
    data: {
      email: 'demo@brightdental.com',
      password: hashedPassword,
      firstName: 'Dr. Emily',
      lastName: 'Chen',
      phone: '(555) 345-6789',
      role: 'admin',
      organizationId: brightDental.id,
    },
  });

  // Update organization with starter subscription
  await prisma.organization.update({
    where: { id: brightDental.id },
    data: {
      stripePriceId: process.env.STRIPE_PRICE_STARTER_ID || 'price_starter',
      subscriptionStatus: 'active',
      subscriptionEndsAt: addDays(new Date(), 30),
    },
  });

  // Create services for each business
  const cleaningServices = await Promise.all([
    prisma.service.create({
      data: {
        organizationId: sparkleClean.id,
        name: 'Standard House Cleaning',
        description: '2-3 bedroom home cleaning',
        duration: 120,
        basePrice: 120,
      },
    }),
    prisma.service.create({
      data: {
        organizationId: sparkleClean.id,
        name: 'Deep Cleaning',
        description: 'Comprehensive deep clean service',
        duration: 240,
        basePrice: 250,
      },
    }),
    prisma.service.create({
      data: {
        organizationId: sparkleClean.id,
        name: 'Move-In/Move-Out Cleaning',
        description: 'Complete cleaning for moving',
        duration: 300,
        basePrice: 350,
      },
    }),
  ]);

  const plumbingServices = await Promise.all([
    prisma.service.create({
      data: {
        organizationId: quickFixPlumbing.id,
        name: 'Emergency Plumbing',
        description: '24/7 emergency service',
        duration: 90,
        basePrice: 150,
      },
    }),
    prisma.service.create({
      data: {
        organizationId: quickFixPlumbing.id,
        name: 'Drain Cleaning',
        description: 'Professional drain cleaning',
        duration: 60,
        basePrice: 125,
      },
    }),
    prisma.service.create({
      data: {
        organizationId: quickFixPlumbing.id,
        name: 'Water Heater Installation',
        description: 'New water heater install',
        duration: 180,
        basePrice: 800,
      },
    }),
  ]);

  const dentalServices = await Promise.all([
    prisma.service.create({
      data: {
        organizationId: brightDental.id,
        name: 'Dental Cleaning',
        description: 'Regular cleaning and checkup',
        duration: 60,
        basePrice: 150,
      },
    }),
    prisma.service.create({
      data: {
        organizationId: brightDental.id,
        name: 'Cavity Filling',
        description: 'Composite filling',
        duration: 45,
        basePrice: 250,
      },
    }),
  ]);

  // Create some customers
  const customers = [];
  const firstNames = ['John', 'Sarah', 'Mike', 'Emily', 'David', 'Lisa', 'Robert', 'Jennifer', 'William', 'Mary'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

  for (let i = 0; i < 30; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const customer = await prisma.user.create({
      data: {
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
        firstName,
        lastName,
        phone: `(555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        role: 'customer',
        organizationId: i < 15 ? sparkleClean.id : i < 25 ? quickFixPlumbing.id : brightDental.id,
      },
    });
    customers.push(customer);
  }

  // Create booking history for Sparkle Clean (Premium)
  const sparkleCustomers = customers.slice(0, 15);
  const bookingStatuses = ['completed', 'completed', 'completed', 'scheduled', 'cancelled'];
  
  for (let i = 0; i < 50; i++) {
    const customer = sparkleCustomers[Math.floor(Math.random() * sparkleCustomers.length)];
    const service = cleaningServices[Math.floor(Math.random() * cleaningServices.length)];
    const daysAgo = Math.floor(Math.random() * 90);
    const bookingDate = subDays(new Date(), daysAgo);
    const status = daysAgo > 7 ? 'completed' : bookingStatuses[Math.floor(Math.random() * bookingStatuses.length)];
    
    await prisma.booking.create({
      data: {
        customerId: customer.id,
        serviceId: service.id,
        organizationId: sparkleClean.id,
        frequency: i % 5 === 0 ? 'biweekly' : 'once',
        date: bookingDate,
        time: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'][Math.floor(Math.random() * 5)],
        duration: service.duration.toString(),
        status,
        address: `${Math.floor(Math.random() * 9999) + 1} Main St`,
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        basePrice: service.basePrice,
        finalPrice: service.basePrice,
      },
    });
  }

  // Create booking history for QuickFix Plumbing (Growth)
  const plumbingCustomers = customers.slice(15, 25);
  
  for (let i = 0; i < 30; i++) {
    const customer = plumbingCustomers[Math.floor(Math.random() * plumbingCustomers.length)];
    const service = plumbingServices[Math.floor(Math.random() * plumbingServices.length)];
    const daysAgo = Math.floor(Math.random() * 60);
    const bookingDate = subDays(new Date(), daysAgo);
    const status = daysAgo > 7 ? 'completed' : bookingStatuses[Math.floor(Math.random() * bookingStatuses.length)];
    
    await prisma.booking.create({
      data: {
        customerId: customer.id,
        serviceId: service.id,
        organizationId: quickFixPlumbing.id,
        frequency: 'once',
        date: bookingDate,
        time: ['8:00 AM', '9:00 AM', '10:00 AM', '1:00 PM', '2:00 PM', '3:00 PM'][Math.floor(Math.random() * 6)],
        duration: service.duration.toString(),
        status,
        address: `${Math.floor(Math.random() * 9999) + 1} Oak Ave`,
        city: 'Dallas',
        state: 'TX',
        zipCode: '75201',
        basePrice: service.basePrice,
        finalPrice: service.basePrice * (service.name.includes('Emergency') ? 1.5 : 1),
      },
    });
  }

  // Create limited bookings for Bright Dental (Starter)
  const dentalCustomers = customers.slice(25);
  
  for (let i = 0; i < 10; i++) {
    const customer = dentalCustomers[Math.floor(Math.random() * dentalCustomers.length)];
    const service = dentalServices[Math.floor(Math.random() * dentalServices.length)];
    const daysAgo = Math.floor(Math.random() * 30);
    const bookingDate = subDays(new Date(), daysAgo);
    const status = daysAgo > 7 ? 'completed' : 'scheduled';
    
    await prisma.booking.create({
      data: {
        customerId: customer.id,
        serviceId: service.id,
        organizationId: brightDental.id,
        frequency: 'once',
        date: bookingDate,
        time: ['9:00 AM', '10:00 AM', '2:00 PM', '3:00 PM'][Math.floor(Math.random() * 4)],
        duration: service.duration.toString(),
        status,
        address: '456 Medical Plaza',
        city: 'Houston',
        state: 'TX',
        zipCode: '77001',
        basePrice: service.basePrice,
        finalPrice: service.basePrice,
      },
    });
  }

  // Create expense categories
  const expenseCategories = await Promise.all([
    prisma.expenseCategory.create({
      data: {
        organizationId: sparkleClean.id,
        name: 'Cleaning Supplies',
        color: '#22c55e',
      },
    }),
    prisma.expenseCategory.create({
      data: {
        organizationId: sparkleClean.id,
        name: 'Vehicle Expenses',
        color: '#3b82f6',
      },
    }),
    prisma.expenseCategory.create({
      data: {
        organizationId: sparkleClean.id,
        name: 'Payroll',
        color: '#f59e0b',
      },
    }),
    prisma.expenseCategory.create({
      data: {
        organizationId: sparkleClean.id,
        name: 'Marketing',
        color: '#ec4899',
      },
    }),
  ]);

  // Create expenses for Sparkle Clean (Premium feature)
  const expenseData = [
    { name: 'Cleaning Supplies - January', amount: 450, categoryIndex: 0, daysAgo: 15 },
    { name: 'Gas for Vehicles', amount: 320, categoryIndex: 1, daysAgo: 10 },
    { name: 'Employee Payroll', amount: 5200, categoryIndex: 2, daysAgo: 5 },
    { name: 'Google Ads Campaign', amount: 600, categoryIndex: 3, daysAgo: 20 },
    { name: 'Vacuum Cleaner Replacement', amount: 380, categoryIndex: 0, daysAgo: 25 },
    { name: 'Vehicle Maintenance', amount: 450, categoryIndex: 1, daysAgo: 30 },
  ];

  for (const expense of expenseData) {
    await prisma.expense.create({
      data: {
        organizationId: sparkleClean.id,
        category: expenseCategories[expense.categoryIndex].name,
        description: expense.name,
        amount: expense.amount,
        date: subDays(new Date(), expense.daysAgo),
      },
    });
  }

  // Create budget for Sparkle Clean
  await prisma.budget.create({
    data: {
      organizationId: sparkleClean.id,
      category: expenseCategories[0].name,
      amount: 500,
      period: 'monthly',
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date()),
    },
  });

  // Create marketing campaigns for Sparkle Clean
  await prisma.marketingCampaign.create({
    data: {
      organizationId: sparkleClean.id,
      name: 'Spring Cleaning Special',
      type: 'email',
      status: 'active',
      targetAudience: {
        segment: 'existing_customers',
        filters: { lastBooking: { withinDays: 90 } },
      },
      content: {
        subject: '20% off Spring Cleaning!',
        body: '20% off all deep cleaning services this spring!',
      },
      sentAt: subDays(new Date(), 7),
      stats: {
        sent: 250,
        opened: 125,
        clicked: 45,
        converted: 12,
      },
    },
  });

  // Create SMS campaign for QuickFix Plumbing (Growth feature)
  await prisma.marketingCampaign.create({
    data: {
      organizationId: quickFixPlumbing.id,
      name: 'Emergency Service Reminder',
      type: 'sms',
      status: 'completed',
      targetAudience: {
        segment: 'all_customers',
      },
      content: {
        message: 'Save our number! QuickFix Plumbing is available 24/7 for emergencies.',
      },
      sentAt: subDays(new Date(), 30),
      stats: {
        sent: 150,
        delivered: 145,
        clicked: 30,
      },
    },
  });

  // Create white label settings for Sparkle Clean
  await prisma.whiteLabelSettings.create({
    data: {
      organizationId: sparkleClean.id,
      brandName: 'Sparkle Clean Pro',
      primaryColor: '#22c55e',
      secondaryColor: '#f0fdf4',
      logoUrl: 'https://placehold.co/200x60/22c55e/ffffff?text=Sparkle+Clean',
      emailFromName: 'Sparkle Clean Team',
      emailFromAddress: 'hello@sparkleclean.com',
      removeBusinessFlowBranding: true,
    },
  });

  // Create locations for QuickFix Plumbing (Growth feature)
  // Note: Location model not implemented in schema
  // await prisma.location.create({
  //   data: {
  //     organizationId: quickFixPlumbing.id,
  //     name: 'Main Office',
  //     address: '123 Plumbing Way',
  //     city: 'Dallas',
  //     state: 'TX',
  //     zipCode: '75201',
  //     phone: '(555) 234-5678',
  //     isMain: true,
  //   },
  // });

  // await prisma.location.create({
  //   data: {
  //     organizationId: quickFixPlumbing.id,
  //     name: 'North Dallas Branch',
  //     address: '456 Service Rd',
  //     city: 'Plano',
  //     state: 'TX',
  //     zipCode: '75024',
  //     phone: '(555) 234-5679',
  //     isMain: false,
  //   },
  // });

  // Create some reviews
  const reviewTexts = [
    'Excellent service! Very professional and thorough.',
    'Great job, will definitely use again.',
    'Fast response time and fair pricing.',
    'Highly recommend! They went above and beyond.',
    'Good service, arrived on time.',
  ];

  // Add reviews for completed bookings
  // Note: Review model not implemented in schema
  // const completedBookings = await prisma.booking.findMany({
  //   where: { status: 'completed' },
  //   take: 20,
  // });

  // for (const booking of completedBookings) {
  //   await prisma.review.create({
  //     data: {
  //       bookingId: booking.id,
  //       customerId: booking.customerId,
  //       organizationId: booking.organizationId,
  //       rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
  //       comment: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
  //     },
  //   });
  // }

  console.log('✅ Demo data seed completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding demo data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });