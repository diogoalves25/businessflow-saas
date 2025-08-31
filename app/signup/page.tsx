'use client';

import { useState } from 'react';
import { ArrowLeft, Check, DollarSign, Users, Zap, Calendar, BarChart3, Mail, Sparkles, Wrench, Wind, Smile, Scissors, Activity, BookOpen, Car, Trees, Utensils } from 'lucide-react';
import Link from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
// import { businessTemplates } from '@/src/lib/business-templates';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'sonner';

interface BusinessSignupData {
  businessName: string;
  businessType: string;
  ownerFirstName: string;
  ownerLastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  plan: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  agreeToTerms: boolean;
}

// Initialize Stripe
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_ID || '',
    features: [
      'Up to 50 bookings/month',
      'Basic scheduling',
      '3 team members',
      'Email support',
      'Customer database',
      'Basic reporting'
    ],
    recommended: false
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 59.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH_ID || '',
    features: [
      'Up to 200 bookings/month',
      'Advanced scheduling & routing',
      '10 team members',
      'Priority support',
      'Automated payroll',
      'Marketing tools',
      'Advanced analytics'
    ],
    recommended: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 99.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_ID || '',
    features: [
      'Unlimited bookings',
      'AI-powered optimization',
      'Unlimited team members',
      'Dedicated support',
      'White-label options',
      'API access',
      'Custom integrations'
    ],
    recommended: false
  }
];

export default function BusinessSignup() {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState('growth');
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<BusinessSignupData>({
    defaultValues: {
      plan: 'growth'
    }
  });

  const password = watch('password');

  const [submitting, setSubmitting] = useState(false);
  const [selectedBusinessType, setSelectedBusinessType] = useState('CLEANING');
  
  const businessTypeIcons: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
    CLEANING: Sparkles,
    PLUMBING: Wrench,
    HVAC: Wind,
    DENTAL: Smile,
    BEAUTY: Scissors,
    FITNESS: Activity,
    TUTORING: BookOpen,
    AUTO_REPAIR: Car,
    LANDSCAPING: Trees,
    CATERING: Utensils,
  };

  const onSubmit: SubmitHandler<BusinessSignupData> = async (data) => {
    setSubmitting(true);
    
    try {
      // First, create the organization in our database
      const signupData = {
        businessName: data.businessName,
        businessType: selectedBusinessType,
        email: data.email,
        password: data.password,
        firstName: data.ownerFirstName,
        lastName: data.ownerLastName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode
      };

      const orgResponse = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      if (!orgResponse.ok) {
        const error = await orgResponse.json();
        throw new Error(error.error || 'Failed to create organization');
      }

      const { organization } = await orgResponse.json();

      // Get the selected plan's Stripe price ID
      const selectedPlanData = plans.find(p => p.id === selectedPlan);
      
      if (!selectedPlanData?.priceId) {
        toast.error('Please run the Stripe setup script to configure pricing');
        return;
      }

      // Create Stripe checkout session
      const checkoutResponse = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: selectedPlanData.priceId,
          organizationId: organization.id,
        }),
      });

      if (!checkoutResponse.ok) {
        const error = await checkoutResponse.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { sessionId } = await checkoutResponse.json();

      // Redirect to Stripe Checkout
      if (!stripePromise) {
        throw new Error('Stripe is not configured');
      }

      const stripe = await stripePromise;
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        throw stripeError;
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const features = [
    { icon: Calendar, title: 'Smart Scheduling', desc: 'AI-powered route optimization' },
    { icon: Users, title: 'Team Management', desc: 'Track technicians & assignments' },
    { icon: DollarSign, title: 'Automated Billing', desc: 'Payments & invoicing' },
    { icon: BarChart3, title: 'Business Analytics', desc: 'Performance insights' },
    { icon: Zap, title: 'Customer Portal', desc: 'Self-service booking' },
    { icon: Mail, title: 'Marketing Tools', desc: 'Email & SMS campaigns' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center text-gray-700 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-xl font-bold text-blue-600">BusinessFlow Business Signup</h1>
            <div className="text-sm text-gray-600">
              Already have an account? <Link href="/admin" className="text-blue-600 hover:text-blue-700 font-medium">Sign In</Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Start Your 14-Day Free Trial
          </h1>
          <p className="text-xl text-gray-600">
            Join 1,000+ service businesses growing with BusinessFlow
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {features.map((feature) => (
            <div key={feature.title} className="bg-white rounded-lg p-6 shadow-sm">
              <feature.icon className="w-10 h-10 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Signup Form */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-lg p-8">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                  1
                </div>
                <div className={`w-24 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                  2
                </div>
                <div className={`w-24 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                  3
                </div>
              </div>
            </div>

            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Information</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Select Your Business Type *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(businessTypeIcons).map(([type, Icon]) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedBusinessType(type)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedBusinessType === type
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`h-8 w-8 mx-auto mb-2 ${
                          selectedBusinessType === type ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <div className={`text-sm font-medium ${
                          selectedBusinessType === type ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {type.charAt(0) + type.slice(1).toLowerCase().replace('_', ' ')}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name *
                  </label>
                  <input
                    {...register('businessName', { required: 'Business name is required' })}
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Sparkle Clean Services"
                  />
                  {errors.businessName && (
                    <p className="mt-1 text-sm text-red-600">{errors.businessName.message}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Owner First Name *
                    </label>
                    <input
                      {...register('ownerFirstName', { required: 'First name is required' })}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                    {errors.ownerFirstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.ownerFirstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Owner Last Name *
                    </label>
                    <input
                      {...register('ownerLastName', { required: 'Last name is required' })}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                    {errors.ownerLastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.ownerLastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Email *
                    </label>
                    <input
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      type="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="owner@cleaningbusiness.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Phone *
                    </label>
                    <input
                      {...register('phone', { required: 'Phone is required' })}
                      type="tel"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="(555) 123-4567"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Continue to Plan Selection
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Plan</h2>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`relative border-2 rounded-lg p-6 cursor-pointer transition ${
                        selectedPlan === plan.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      {plan.recommended && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Most Popular
                          </span>
                        </div>
                      )}
                      
                      <input
                        {...register('plan')}
                        type="radio"
                        value={plan.id}
                        checked={selectedPlan === plan.id}
                        onChange={() => setSelectedPlan(plan.id)}
                        className="sr-only"
                      />
                      
                      <div className="text-center mb-4">
                        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                        <div className="mt-2">
                          <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                          <span className="text-gray-600">/month</span>
                        </div>
                      </div>
                      
                      <ul className="space-y-2">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Continue to Account Setup
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Your Account</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      }
                    })}
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="At least 8 characters"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    {...register('confirmPassword', { 
                      required: 'Please confirm your password',
                      validate: value => value === password || 'Passwords do not match'
                    })}
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Re-enter password"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <h3 className="text-lg font-medium text-gray-900 mb-4">Business Address (Optional)</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    {...register('address')}
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      {...register('city')}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="San Francisco"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      {...register('state')}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="CA"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code
                    </label>
                    <input
                      {...register('zipCode')}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="94102"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Your Selected Plan:</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">
                      {plans.find(p => p.id === selectedPlan)?.name} Plan
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                      ${plans.find(p => p.id === selectedPlan)?.price}/month
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">14-day free trial, then billed monthly</p>
                </div>

                <div>
                  <label className="flex items-start">
                    <input
                      {...register('agreeToTerms', { required: 'You must agree to the terms' })}
                      type="checkbox"
                      className="mt-1 mr-2"
                    />
                    <span className="text-sm text-gray-600">
                      I agree to the <Link href="#" className="text-blue-600 hover:text-blue-700">Terms of Service</Link> and{' '}
                      <Link href="#" className="text-blue-600 hover:text-blue-700">Privacy Policy</Link>
                    </span>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms.message}</p>
                  )}
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Creating Your Account...' : 'Start Free Trial'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Testimonials */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-8">Trusted by service businesses nationwide</p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-gray-600 italic mb-4">
                &ldquo;BusinessFlow transformed how we manage our business. We&apos;ve doubled our bookings!&rdquo;
              </p>
              <div className="font-semibold text-gray-900">Sarah J.</div>
              <div className="text-sm text-gray-600">Sparkle Clean Co.</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-gray-600 italic mb-4">
                &ldquo;The automated scheduling alone saves us 10+ hours per week. Game changer!&rdquo;
              </p>
              <div className="font-semibold text-gray-900">Mike R.</div>
              <div className="text-sm text-gray-600">Premium Cleaning Services</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-gray-600 italic mb-4">
                &ldquo;Best investment for our growing service business. Highly recommend!&rdquo;
              </p>
              <div className="font-semibold text-gray-900">Lisa M.</div>
              <div className="text-sm text-gray-600">Fresh Home Technicians</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}