'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Code2,
  CreditCard,
  DollarSign,
  Globe,
  Layers,
  MessageSquare,
  Palette,
  Shield,
  Sparkles,
  Users,
  Zap,
  Check,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  BarChart3,
  Briefcase,
  FileText,
  Settings,
  Brain,
  Workflow,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function StatsPage() {
  const businessTypes = [
    'Cleaning Services',
    'Plumbing',
    'HVAC',
    'Electrical',
    'Landscaping',
    'Pest Control',
    'Handyman Services',
    'Painting',
    'Roofing',
    'Auto Detailing',
    'Mobile Car Wash',
    'Pet Grooming',
    'Home Healthcare',
    'Dental Clinic',
    'Tutoring',
  ];

  const features = [
    { icon: Calendar, name: 'Smart Booking System', description: 'Intelligent scheduling with conflict detection' },
    { icon: CreditCard, name: 'Payment Processing', description: 'Integrated Stripe & Plaid for seamless payments' },
    { icon: Phone, name: 'SMS/Email Automation', description: 'Twilio & SendGrid powered communications' },
    { icon: Brain, name: 'AI Business Assistant', description: 'OpenAI-powered insights and automation' },
    { icon: Briefcase, name: 'Automated Payroll', description: 'Smart payroll with tax calculations' },
    { icon: TrendingUp, name: 'Marketing Automation', description: 'Multi-channel campaigns with analytics' },
    { icon: FileText, name: 'Expense Tracking', description: 'Receipt scanning and P&L reports' },
    { icon: Palette, name: 'White Label Support', description: 'Full branding customization' },
    { icon: Globe, name: 'Custom Domains', description: 'Use your own domain with SSL' },
    { icon: Users, name: 'Team Management', description: 'Multi-role access control' },
    { icon: Building2, name: 'Multi-location', description: 'Manage multiple business locations' },
    { icon: BarChart3, name: 'Advanced Analytics', description: 'Real-time business insights' },
    { icon: Shield, name: 'Enterprise Security', description: 'Bank-level encryption & compliance' },
    { icon: Workflow, name: 'API Integration', description: 'RESTful API with webhooks' },
    { icon: MessageSquare, name: 'Customer Portal', description: 'Self-service booking management' },
    { icon: Settings, name: 'Business Automation', description: 'Workflow automation tools' },
    { icon: Mail, name: 'Email Marketing', description: 'Targeted email campaigns' },
    { icon: Zap, name: 'Real-time Updates', description: 'Live notifications and alerts' },
    { icon: DollarSign, name: 'Dynamic Pricing', description: 'Smart pricing strategies' },
    { icon: Sparkles, name: 'AI Recommendations', description: 'Data-driven business suggestions' },
  ];

  const integrations = [
    { name: 'Stripe', description: 'Payment processing & invoicing', logo: '💳' },
    { name: 'Plaid', description: 'Bank account connections', logo: '🏦' },
    { name: 'Twilio', description: 'SMS notifications & marketing', logo: '📱' },
    { name: 'SendGrid', description: 'Email delivery & tracking', logo: '📧' },
    { name: 'OpenAI', description: 'AI-powered features', logo: '🤖' },
    { name: 'Google Ads', description: 'Ad spend tracking', logo: '📊' },
    { name: 'Facebook Ads', description: 'Social media ROI', logo: '📈' },
    { name: 'Supabase', description: 'Real-time database', logo: '⚡' },
    { name: 'Vercel', description: 'Edge deployment', logo: '▲' },
  ];

  const pricingTiers = [
    {
      name: 'Starter',
      price: '$29.99',
      features: [
        'Core booking system',
        'Customer management',
        'Email notifications',
        'Basic calendar',
        'Up to 100 bookings/mo',
      ],
    },
    {
      name: 'Growth',
      price: '$59.99',
      features: [
        'Everything in Starter',
        'Payment processing',
        'SMS automation',
        'Multi-location',
        'Advanced reporting',
        'Customer portal',
        'Unlimited bookings',
      ],
    },
    {
      name: 'Premium',
      price: '$99.99',
      features: [
        'Everything in Growth',
        'AI Business Assistant',
        'Automated payroll',
        'Marketing automation',
        'Expense tracking',
        'White label branding',
        'Priority support',
        'API access',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto py-12 px-4 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            BusinessFlow Platform Stats
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A comprehensive SaaS platform built for modern service businesses
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/login">View Demo</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/DEMO_CREDENTIALS.md">Demo Credentials</Link>
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-primary">15+</CardTitle>
              <CardDescription>Business Types Supported</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-green-500/20">
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-green-600">20+</CardTitle>
              <CardDescription>Core Features</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-blue-600">9</CardTitle>
              <CardDescription>Major Integrations</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-purple-600">3</CardTitle>
              <CardDescription>Flexible Pricing Tiers</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Business Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              Supported Business Types
            </CardTitle>
            <CardDescription>
              Built to scale across multiple service industries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {businessTypes.map((type) => (
                <Badge key={type} variant="secondary" className="text-sm">
                  {type}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Comprehensive Feature Set</h2>
            <p className="text-muted-foreground mt-2">
              Everything you need to run and grow your service business
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.name} className="hover:shadow-lg transition-shadow">
                <CardHeader className="space-y-3">
                  <feature.icon className="h-8 w-8 text-primary" />
                  <CardTitle className="text-lg">{feature.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Integrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-6 w-6" />
              Enterprise Integrations
            </CardTitle>
            <CardDescription>
              Seamlessly connected with industry-leading services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {integrations.map((integration) => (
                <div
                  key={integration.name}
                  className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
                >
                  <span className="text-3xl">{integration.logo}</span>
                  <div>
                    <h4 className="font-semibold">{integration.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {integration.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pricing Tiers */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Flexible Pricing</h2>
            <p className="text-muted-foreground mt-2">
              Choose the plan that grows with your business
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {pricingTiers.map((tier, index) => (
              <Card
                key={tier.name}
                className={`relative ${
                  index === 2 ? 'border-primary shadow-lg' : ''
                }`}
              >
                {index === 2 && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle>{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Architecture & Tech Stack */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-6 w-6" />
              Production-Ready Architecture
            </CardTitle>
            <CardDescription>
              Built with modern technologies for scale and performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">Frontend</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Next.js 15 with App Router</li>
                  <li>• TypeScript for type safety</li>
                  <li>• Tailwind CSS + shadcn/ui</li>
                  <li>• Real-time updates with Supabase</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Backend</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• PostgreSQL with Prisma ORM</li>
                  <li>• NextAuth.js authentication</li>
                  <li>• Edge functions for performance</li>
                  <li>• Webhook support for integrations</li>
                </ul>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="font-medium">Security:</span>
                <span className="text-muted-foreground">
                  Bank-level encryption, GDPR compliant, SOC 2 ready
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Service Business?
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of businesses already using BusinessFlow to streamline
              operations, increase revenue, and delight customers.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/signup">Start Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                <Link href="https://businessflow-saas.vercel.app">
                  View Live Demo
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}