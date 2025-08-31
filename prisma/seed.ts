import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { businessTemplates } from '../src/lib/business-templates';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');
  
  // Clear existing data in the correct order to avoid foreign key constraints
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.revenue.deleteMany();
  
  console.log('Cleared existing data');

  // Create demo organizations for 3 different business types
  const demoOrganizations = [
    {
      businessType: 'CLEANING',
      businessName: 'SparkleClean Pro',
      email: 'demo@sparkleclean.com',
      phone: '(555) 123-4567',
      address: '123 Clean Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102'
    },
    {
      businessType: 'PLUMBING',
      businessName: 'FlowMaster Plumbing',
      email: 'demo@flowmaster.com', 
      phone: '(555) 234-5678',
      address: '456 Pipe Avenue',
      city: 'Oakland',
      state: 'CA',
      zipCode: '94612'
    },
    {
      businessType: 'BEAUTY',
      businessName: 'Glamour Beauty Studio',
      email: 'demo@glamourbeauty.com',
      phone: '(555) 345-6789',
      address: '789 Style Boulevard',
      city: 'San Jose',
      state: 'CA',
      zipCode: '95110'
    }
  ];

  const hashedPassword = await bcrypt.hash('demo123', 10);

  for (const orgData of demoOrganizations) {
    const template = businessTemplates[orgData.businessType];
    
    // Create organization
    const org = await prisma.organization.create({
      data: {
        name: orgData.businessName,
        businessType: orgData.businessType as any,
        businessName: orgData.businessName,
        email: orgData.email,
        phone: orgData.phone,
        address: orgData.address,
        city: orgData.city,
        state: orgData.state,
        zipCode: orgData.zipCode
      }
    });

    console.log(`Created organization: ${org.name}`);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: orgData.email,
        password: hashedPassword,
        firstName: 'Demo',
        lastName: 'Admin',
        phone: orgData.phone,
        role: 'admin',
        organizationId: org.id
      }
    });

    console.log(`Created admin user: ${admin.email}`);

    // Create services based on template
    const services = [];
    for (const serviceTemplate of template.services) {
      const service = await prisma.service.create({
        data: {
          name: serviceTemplate.name,
          description: serviceTemplate.name,
          basePrice: serviceTemplate.basePrice,
          duration: serviceTemplate.duration,
          organizationId: org.id
        }
      });
      services.push(service);
    }

    console.log(`Created ${services.length} services for ${org.name}`);

    // Create technicians
    const technicians = [];
    const technicianNames = [
      ['John', 'Smith'],
      ['Maria', 'Garcia'],
      ['David', 'Lee'],
      ['Sarah', 'Johnson']
    ];

    for (const [firstName, lastName] of technicianNames) {
      const technician = await prisma.user.create({
        data: {
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${org.businessName.toLowerCase().replace(/\s+/g, '')}.com`,
          firstName,
          lastName,
          phone: '(555) 100-' + Math.floor(Math.random() * 9000 + 1000),
          role: 'technician',
          organizationId: org.id
        }
      });
      technicians.push(technician);
    }

    console.log(`Created ${technicians.length} technicians for ${org.name}`);

    // Create customers (reuse existing customers if they exist)
    const customers = [];
    const customerData = [
      ['Emily', 'Davis', 'emily.davis@email.com', '(555) 200-1001'],
      ['Michael', 'Wilson', 'michael.wilson@email.com', '(555) 200-1002'],
      ['Jessica', 'Brown', 'jessica.brown@email.com', '(555) 200-1003'],
      ['Robert', 'Taylor', 'robert.taylor@email.com', '(555) 200-1004'],
      ['Lisa', 'Anderson', 'lisa.anderson@email.com', '(555) 200-1005']
    ];

    for (const [firstName, lastName, email, phone] of customerData) {
      let customer = await prisma.user.findUnique({
        where: { email }
      });

      if (!customer) {
        customer = await prisma.user.create({
          data: {
            email,
            firstName,
            lastName,
            phone,
            role: 'customer'
          }
        });
      }
      customers.push(customer);
    }

    console.log(`Created ${customers.length} customers`);

    // Create bookings
    const statuses = ['completed', 'completed', 'scheduled', 'scheduled', 'in_progress'];
    const frequencies = ['once', 'weekly', 'biweekly', 'monthly', 'once'];
    
    const today = new Date();
    const bookings = [];
    
    for (let i = 0; i < 15; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const service = services[Math.floor(Math.random() * services.length)];
      const technician = technicians[Math.floor(Math.random() * technicians.length)];
      const frequency = frequencies[Math.floor(Math.random() * frequencies.length)];
      const status = i < 10 ? 'completed' : statuses[Math.floor(Math.random() * statuses.length)];
      
      const bookingDate = new Date(today);
      bookingDate.setDate(bookingDate.getDate() - (15 - i));
      
      const basePrice = service.basePrice;
      const discount = frequency !== 'once' ? basePrice * 0.1 : 0;
      const finalPrice = basePrice - discount;

      const booking = await prisma.booking.create({
        data: {
          customerId: customer.id,
          technicianId: technician.id,
          serviceId: service.id,
          organizationId: org.id,
          frequency,
          date: bookingDate,
          time: `${Math.floor(Math.random() * 4) + 9}:00 AM`,
          duration: `${service.duration} minutes`,
          status,
          address: `${Math.floor(Math.random() * 9000) + 1000} Main St`,
          city: ['San Francisco', 'Oakland', 'San Jose'][Math.floor(Math.random() * 3)],
          state: 'CA',
          zipCode: ['94102', '94612', '95110'][Math.floor(Math.random() * 3)],
          basePrice,
          discount,
          finalPrice,
          rating: status === 'completed' ? Math.floor(Math.random() * 2) + 4 : null,
          review: status === 'completed' ? 'Great service!' : null
        }
      });
      bookings.push(booking);
    }

    console.log(`Created ${bookings.length} bookings for ${org.name}`);

    // Create revenue data for the past 6 months
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      
      const monthName = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const amount = Math.floor(Math.random() * 10000) + 40000;

      await prisma.revenue.create({
        data: {
          month: monthName,
          year,
          amount
        }
      });
    }
  }

  console.log('Seed completed successfully!');
  console.log('\nDemo Login Credentials:');
  console.log('- Email: demo@sparkleclean.com, Password: demo123');
  console.log('- Email: demo@flowmaster.com, Password: demo123');
  console.log('- Email: demo@glamourbeauty.com, Password: demo123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });