# BusinessFlow - Modern Cleaning Business Management

A SaaS booking platform demo for cleaning businesses, built as a BookingKoala alternative.

## Features

- 🏠 Professional landing page with pricing tiers
- 📅 Smart booking system with service selection
- 📊 Admin dashboard with business analytics
- 📱 Fully responsive design
- 💾 SQLite database with Prisma ORM
- 🎨 Modern UI with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15.5 with TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: SQLite with Prisma ORM
- **Forms**: React Hook Form
- **Icons**: Lucide React

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npx prisma migrate dev
npm run db:seed
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Key Pages

- **Homepage** (`/`) - Landing page with hero section and pricing
- **Booking** (`/booking`) - Multi-step booking form
- **Admin Dashboard** (`/admin`) - Business analytics and management

## Pricing Tiers

- **Starter** ($29.99/month) - For individual cleaners
- **Growth** ($59.99/month) - For small cleaning teams
- **Premium** ($99.99/month) - For established businesses

## Sample Data

The database is pre-seeded with:
- 4 cleaning services
- 4 cleaners
- 5 customers
- 5 bookings with various statuses
- 6 months of revenue data

## Deploy on Vercel

The easiest way to deploy this Next.js app is to use the [Vercel Platform](https://vercel.com).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/businessflow)