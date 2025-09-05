'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  duration: number;
  basePrice: number;
}

interface WhiteLabelSettings {
  brandName: string;
  primaryColor: string;
  logoUrl?: string;
}

export default function BookingWidgetContent() {
  const searchParams = useSearchParams();
  const organizationId = searchParams.get('organizationId');
  const customDomain = searchParams.get('customDomain');
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<WhiteLabelSettings | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actualOrganizationId, setActualOrganizationId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    serviceId: '',
    date: new Date(),
    time: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    specialInstructions: '',
  });

  useEffect(() => {
    fetchData();
    
    // Listen for config from parent
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [organizationId, customDomain]);

  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'businessflow-widget-config') {
      // Apply custom config from parent
      if (event.data.config.primaryColor) {
        document.documentElement.style.setProperty(
          '--primary',
          event.data.config.primaryColor
        );
      }
    }
  };

  const fetchData = async () => {
    if (!organizationId && !customDomain) return;
    
    try {
      let orgId = organizationId;
      
      // If custom domain, fetch organization ID first
      if (customDomain) {
        const orgRes = await fetch(`/api/public/organization-by-domain?domain=${customDomain}`);
        if (orgRes.ok) {
          const org = await orgRes.json();
          orgId = org.organizationId;
          setActualOrganizationId(org.organizationId);
        } else {
          throw new Error('Organization not found');
        }
      } else {
        setActualOrganizationId(organizationId);
      }
      
      if (!orgId) return;
      
      // Fetch services
      const servicesRes = await fetch(`/api/public/services?organizationId=${orgId}`);
      const servicesData = await servicesRes.json();
      setServices(servicesData);
      
      // Fetch white label settings
      const settingsRes = await fetch(`/api/public/white-label?organizationId=${orgId}`);
      const settingsData = await settingsRes.json();
      setSettings(settingsData);
      
      // Apply theme
      if (settingsData.primaryColor) {
        const hexToRgb = (hex: string) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
          } : null;
        };
        
        const rgb = hexToRgb(settingsData.primaryColor);
        if (rgb) {
          document.documentElement.style.setProperty(
            '--primary',
            `${rgb.r} ${rgb.g} ${rgb.b}`
          );
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/public/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          organizationId: actualOrganizationId || organizationId,
        }),
      });
      
      if (!response.ok) throw new Error('Booking failed');
      
      const booking = await response.json();
      
      // Notify parent window
      window.parent.postMessage({
        type: 'businessflow-booking-complete',
        booking,
      }, '*');
    } catch (error) {
      console.error('Error creating booking:', error);
      // Show error message
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedService = services.find(s => s.id === formData.serviceId);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {settings?.logoUrl && (
        <div className="text-center mb-6">
          <img
            src={settings.logoUrl}
            alt={settings.brandName}
            className="h-12 mx-auto"
          />
        </div>
      )}
      
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6">
          {/* Progress indicator */}
          <div className="flex justify-between mb-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex-1 h-2 mx-1 rounded ${
                  i <= step ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Select a Service</h2>
              <Select
                value={formData.serviceId}
                onValueChange={(value) => setFormData({ ...formData, serviceId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - ${service.basePrice}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="space-y-2">
                <Label>Select Date</Label>
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => date && setFormData({ ...formData, date })}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </div>

              <div className="space-y-2">
                <Label>Select Time</Label>
                <Select
                  value={formData.time}
                  onValueChange={(value) => setFormData({ ...formData, time: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a time" />
                  </SelectTrigger>
                  <SelectContent>
                    {['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'].map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                onClick={() => setStep(2)}
                disabled={!formData.serviceId || !formData.time}
              >
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Your Information</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setStep(3)}
                  disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Service Location</h2>
              
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main St"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    maxLength={2}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>ZIP Code</Label>
                <Input
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Special Instructions (Optional)</Label>
                <Textarea
                  value={formData.specialInstructions}
                  onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                  placeholder="Gate code, parking instructions, etc."
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Booking Summary</h3>
                <div className="text-sm space-y-1">
                  <p>Service: {selectedService?.name}</p>
                  <p>Date: {format(formData.date, 'MMMM d, yyyy')}</p>
                  <p>Time: {formData.time}</p>
                  <p className="font-medium">Total: ${selectedService?.basePrice}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={submitting || !formData.address || !formData.city || !formData.state || !formData.zipCode}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <button
        onClick={() => window.parent.postMessage({ type: 'businessflow-close-widget' }, '*')}
        className="text-center w-full mt-4 text-sm text-gray-500 hover:text-gray-700"
      >
        Close
      </button>
    </div>
  );
}