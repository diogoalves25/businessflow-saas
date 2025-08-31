# BusinessFlow SaaS

A comprehensive SaaS platform for service businesses to manage bookings, customers, payments, and operations.

## Features

- 🏢 **Multi-Business Support**: Cleaning, Plumbing, HVAC, Dental, Beauty, Fitness, and more
- 📅 **Smart Booking System**: Online scheduling with automated confirmations
- 💳 **Integrated Payments**: Stripe integration for subscriptions and payments
- 👥 **Team Management**: Manage technicians, track hours, and handle payroll
- 📊 **Analytics Dashboard**: Revenue tracking, expense management, and insights
- 🤖 **AI Assistant**: Built-in chatbot for customer support
- 📱 **Mobile Responsive**: Works seamlessly on all devices
- 🎨 **White Label**: Custom branding for enterprise customers

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Email**: Resend
- **SMS**: Twilio
- **AI**: OpenAI GPT-4
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Supabase account)
- Stripe account
- Resend account (for emails)
- Twilio account (for SMS)
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/businessflow-saas.git
cd businessflow-saas
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your credentials:
```env
# Database
DATABASE_URL="your-database-url"
DIRECT_URL="your-direct-database-url"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Stripe
STRIPE_SECRET_KEY="your-stripe-secret"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your-stripe-publishable"

# Other services...
```

5. Run database migrations:
```bash
npx prisma generate
npx prisma db push
```

6. Seed the database (optional):
```bash
# Run prisma/seed-data-final.sql in your database
```

7. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
businessflow-saas/
├── app/                    # Next.js 14 app directory
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
├── lib/                   # Utility functions
├── prisma/               # Database schema and migrations
├── public/               # Static assets
└── types/                # TypeScript types
```

## Key Features Implementation

### Booking System
- Customers can book services online
- Automated email/SMS confirmations
- Recurring booking support
- Calendar integration

### Payment Processing
- Subscription billing with Stripe
- One-time payments for services
- Invoice generation
- Payment history

### Team Management
- Technician scheduling
- Time tracking
- Commission calculation
- Payroll integration with Plaid

### Analytics
- Revenue dashboards
- Expense tracking
- Customer insights
- Performance metrics

## Demo Accounts

After seeding the database, you can use these demo accounts:

- **Admin**: admin@sparkleclean.com / password123
- **Technician**: tech@sparkleclean.com / password123
- **Customer**: customer@sparkleclean.com / password123

## Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@businessflow.com or join our Slack channel.