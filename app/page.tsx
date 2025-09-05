'use client';

import { Check, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const pricingTiers = [
  {
    name: 'Starter',
    price: '$29.99',
    description: 'Perfect for individual service providers',
    features: [
      'Up to 50 bookings/month',
      'Basic scheduling',
      'Customer management',
      'SMS reminders',
      'Online payments',
    ],
  },
  {
    name: 'Growth',
    price: '$59.99',
    description: 'Great for small service teams',
    features: [
      'Up to 200 bookings/month',
      'Advanced scheduling',
      'Team management (up to 5)',
      'Route optimization',
      'Customer portal',
      'Email & SMS reminders',
      'Priority support',
    ],
    popular: true,
  },
  {
    name: 'Premium',
    price: '$99.99',
    description: 'For established service businesses',
    features: [
      'Unlimited bookings',
      'Unlimited team members',
      'Advanced analytics',
      'Custom branding',
      'API access',
      'Dedicated account manager',
      'Phone support',
    ],
  },
];

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Add immediate visible test
  return (
    <>
      <div style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        background: 'green', 
        color: 'white', 
        padding: '10px', 
        zIndex: 9999999,
        fontSize: '14px'
      }}>
        HOME PAGE LOADED
      </div>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">BusinessFlow</h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/features" className="text-gray-700 hover:text-blue-600">Features</Link>
              <Link href="/pricing" className="text-gray-700 hover:text-blue-600">Pricing</Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600">About</Link>
              <Link href="/booking" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                See Demo
              </Link>
              <Link href="/login" className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50">
                Sign In
              </Link>
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/features" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Features</Link>
              <Link href="/pricing" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Pricing</Link>
              <Link href="/about" className="block px-3 py-2 text-gray-700 hover:text-blue-600">About</Link>
              <Link href="/booking" className="block px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                See Demo
              </Link>
              <Link href="/login" className="block px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
                Sign In
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Streamline Your Service Business
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The all-in-one platform for scheduling, managing, and growing your service. 
            Save time, delight customers, and boost revenue.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700">
              Start Free Trial
            </Link>
            <Link href="/demo" className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50">
              Watch Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything you need to run your service business
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-2 text-gray-900">Smart Scheduling</h4>
              <p className="text-gray-600">Automated booking system with real-time availability and route optimization.</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-2 text-gray-900">Team Management</h4>
              <p className="text-gray-600">Assign jobs, track performance, and manage your service teams efficiently.</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-2 text-gray-900">Online Payments</h4>
              <p className="text-gray-600">Accept payments online with automated invoicing and secure processing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h3>
            <p className="text-lg text-gray-600">
              Choose the plan that fits your business. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`bg-white rounded-lg shadow-lg p-8 ${
                  tier.popular ? 'ring-2 ring-blue-600 relative' : ''
                }`}
              >
                {tier.popular && (
                  <span className="absolute top-0 right-8 transform -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                    Most Popular
                  </span>
                )}
                <div className="mb-8">
                  <h4 className="text-2xl font-bold text-gray-900">{tier.name}</h4>
                  <p className="text-gray-600 mt-2">{tier.description}</p>
                  <p className="text-4xl font-bold text-gray-900 mt-4">
                    {tier.price}
                    <span className="text-lg text-gray-600 font-normal">/month</span>
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link 
                  href="/signup" 
                  className={`block w-full py-3 text-center rounded-lg font-semibold ${
                    tier.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to grow your service business?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of service professionals who trust BusinessFlow
          </p>
          <Link href="/signup" className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 inline-block">
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h5 className="text-xl font-bold mb-4">BusinessFlow</h5>
              <p className="text-gray-400">The modern way to manage your service business.</p>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Product</h6>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/integrations" className="hover:text-white">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Company</h6>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Support</h6>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 BusinessFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}