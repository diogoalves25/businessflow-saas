'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Checkbox } from '@/src/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/src/components/ui/radio-group';
import { Label } from '@/src/components/ui/label';
import { Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/src/components/ui/use-toast';

export default function PreferencesPage() {
  const searchParams = useSearchParams();
  const contactId = searchParams.get('contact');
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [preferences, setPreferences] = useState({
    emailOptIn: true,
    smsOptIn: true,
    frequency: {
      email: 'immediate',
      sms: 'immediate',
    },
    categories: {
      email: ['promotions', 'updates', 'reminders'],
      sms: ['reminders'],
    },
  });

  useEffect(() => {
    if (contactId) {
      loadPreferences();
    } else {
      setLoading(false);
    }
  }, [contactId]);

  const loadPreferences = async () => {
    try {
      const response = await fetch(`/api/marketing/contacts/${contactId}/preferences`);
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!contactId) {
      toast({
        title: 'Error',
        description: 'Invalid preferences link. Please use the link from your email.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    setSaved(false);

    try {
      const response = await fetch('/api/marketing/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId,
          token: new URLSearchParams(window.location.search).get('token'),
          preferences,
        }),
      });

      if (response.ok) {
        setSaved(true);
        toast({
          title: 'Success',
          description: 'Your preferences have been updated.',
        });
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save preferences. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Communication Preferences</CardTitle>
            <CardDescription>
              Choose how you'd like to hear from us. You can update these preferences at any time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Channel Opt-ins */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Communication Channels</h3>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email-optin"
                  checked={preferences.emailOptIn}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, emailOptIn: !!checked }))
                  }
                />
                <Label htmlFor="email-optin" className="flex-1">
                  <div>Email Communications</div>
                  <div className="text-sm text-gray-500">
                    Receive updates, promotions, and reminders via email
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sms-optin"
                  checked={preferences.smsOptIn}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, smsOptIn: !!checked }))
                  }
                />
                <Label htmlFor="sms-optin" className="flex-1">
                  <div>SMS Messages</div>
                  <div className="text-sm text-gray-500">
                    Receive appointment reminders and urgent updates via text
                  </div>
                </Label>
              </div>
            </div>

            {/* Email Preferences */}
            {preferences.emailOptIn && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium">Email Preferences</h3>
                
                <div>
                  <Label className="text-sm font-medium mb-2">Frequency</Label>
                  <RadioGroup
                    value={preferences.frequency.email}
                    onValueChange={(value) =>
                      setPreferences(prev => ({
                        ...prev,
                        frequency: { ...prev.frequency, email: value },
                      }))
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="immediate" id="email-immediate" />
                      <Label htmlFor="email-immediate">As they happen</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="daily" id="email-daily" />
                      <Label htmlFor="email-daily">Daily digest</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="weekly" id="email-weekly" />
                      <Label htmlFor="email-weekly">Weekly summary</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2">Categories</Label>
                  <div className="space-y-2">
                    {['promotions', 'updates', 'reminders'].map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`email-${category}`}
                          checked={preferences.categories.email.includes(category)}
                          onCheckedChange={(checked) => {
                            setPreferences(prev => ({
                              ...prev,
                              categories: {
                                ...prev.categories,
                                email: checked
                                  ? [...prev.categories.email, category]
                                  : prev.categories.email.filter(c => c !== category),
                              },
                            }));
                          }}
                        />
                        <Label htmlFor={`email-${category}`} className="capitalize">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SMS Preferences */}
            {preferences.smsOptIn && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium">SMS Preferences</h3>
                
                <div>
                  <Label className="text-sm font-medium mb-2">Categories</Label>
                  <div className="space-y-2">
                    {['reminders', 'promotions'].map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`sms-${category}`}
                          checked={preferences.categories.sms?.includes(category) || false}
                          onCheckedChange={(checked) => {
                            setPreferences(prev => ({
                              ...prev,
                              categories: {
                                ...prev.categories,
                                sms: checked
                                  ? [...(prev.categories.sms || []), category]
                                  : (prev.categories.sms || []).filter(c => c !== category),
                              },
                            }));
                          }}
                        />
                        <Label htmlFor={`sms-${category}`} className="capitalize">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Unsubscribe All */}
            <div className="border-t pt-4">
              <Button
                variant="ghost"
                className="text-red-600 hover:text-red-700"
                onClick={() => {
                  setPreferences(prev => ({
                    ...prev,
                    emailOptIn: false,
                    smsOptIn: false,
                  }));
                }}
              >
                Unsubscribe from all communications
              </Button>
            </div>

            {/* Save Button */}
            <div className="flex justify-end space-x-4">
              <Button variant="outline" asChild>
                <a href="/">Cancel</a>
              </Button>
              <Button onClick={savePreferences} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Saved
                  </>
                ) : (
                  'Save Preferences'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}