'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Code, Smartphone, Monitor, Calendar } from 'lucide-react';

export default function WidgetEmbedPage() {
  const { data: session } = useSession();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const organizationId = session?.user?.organizationId || 'YOUR_ORGANIZATION_ID';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.businessflow.com';

  const embedCode = `<!-- BusinessFlow Booking Widget -->
<script 
  src="${baseUrl}/widget/booking-widget.js"
  data-businessflow-widget
  data-organization-id="${organizationId}"
  data-base-url="${baseUrl}"
  data-primary-color="#0066FF"
  data-position="bottom-right"
></script>`;

  const advancedCode = `<!-- BusinessFlow Booking Widget (Advanced) -->
<script src="${baseUrl}/widget/booking-widget.js"></script>
<script>
  window.addEventListener('DOMContentLoaded', function() {
    const widget = new BusinessFlowBookingWidget({
      organizationId: '${organizationId}',
      baseUrl: '${baseUrl}',
      primaryColor: '#0066FF',
      position: 'bottom-right',
      width: '400px',
      height: '600px',
      onBookingComplete: function(booking) {
        // Custom callback when booking is completed
        console.log('Booking completed:', booking);
        // You can trigger analytics, show custom messages, etc.
      }
    });
  });
</script>`;

  const iframeCode = `<!-- BusinessFlow Booking Widget (iFrame) -->
<iframe 
  src="${baseUrl}/booking/widget?organizationId=${organizationId}"
  width="400"
  height="600"
  frameborder="0"
  style="border: 1px solid #ddd; border-radius: 8px;"
></iframe>`;

  const copyToClipboard = async (code: string, type: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(type);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Booking Widget</h1>
        <p className="text-muted-foreground">
          Embed the booking widget on your website to let customers book directly
        </p>
      </div>

      <Alert>
        <AlertDescription>
          The booking widget automatically inherits your white label settings including logo, colors, and branding.
          Customers can book services directly from your website.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="simple" className="space-y-4">
        <TabsList>
          <TabsTrigger value="simple">Simple Embed</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="iframe">iFrame</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="simple" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Simple Embed Code</CardTitle>
              <CardDescription>
                Copy and paste this code into your website's HTML where you want the booking button to appear
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{embedCode}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(embedCode, 'simple')}
                >
                  {copiedCode === 'simple' ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Features:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Floating booking button</li>
                  <li>Responsive modal window</li>
                  <li>Mobile-friendly</li>
                  <li>Automatic theme inheritance</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Customization Options:</h4>
                <div className="grid gap-2 text-sm">
                  <div>
                    <code className="bg-muted px-2 py-1 rounded">data-position</code>
                    <span className="text-muted-foreground ml-2">
                      Position: bottom-right, bottom-left, top-right, top-left
                    </span>
                  </div>
                  <div>
                    <code className="bg-muted px-2 py-1 rounded">data-primary-color</code>
                    <span className="text-muted-foreground ml-2">
                      Button color (hex code)
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Integration</CardTitle>
              <CardDescription>
                Full control over the widget with JavaScript API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{advancedCode}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(advancedCode, 'advanced')}
                >
                  {copiedCode === 'advanced' ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Advanced Features:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Custom callback functions</li>
                  <li>Programmatic control</li>
                  <li>Custom dimensions</li>
                  <li>Event handling</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">API Methods:</h4>
                <div className="space-y-2 text-sm font-mono">
                  <div className="bg-muted p-2 rounded">widget.open()</div>
                  <div className="bg-muted p-2 rounded">widget.close()</div>
                  <div className="bg-muted p-2 rounded">widget.onBookingComplete(callback)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="iframe" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>iFrame Embed</CardTitle>
              <CardDescription>
                Embed the booking form directly in your page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{iframeCode}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(iframeCode, 'iframe')}
                >
                  {copiedCode === 'iframe' ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              <Alert>
                <AlertDescription>
                  The iFrame method embeds the booking form directly in your page. 
                  Best for dedicated booking pages or when you want the form always visible.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Widget Preview</CardTitle>
              <CardDescription>
                See how the widget looks and works
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    <h4 className="font-medium">Desktop View</h4>
                  </div>
                  <div className="border rounded-lg p-4 bg-gray-50 h-96 relative">
                    <div className="absolute bottom-4 right-4">
                      <button className="bg-primary text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    <h4 className="font-medium">Mobile View</h4>
                  </div>
                  <div className="border rounded-lg p-4 bg-gray-50 h-96 max-w-xs mx-auto relative">
                    <div className="absolute bottom-4 right-4">
                      <button className="bg-primary text-white p-3 rounded-full shadow-lg">
                        <Calendar className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Button onClick={() => window.open(`${baseUrl}/booking/widget?organizationId=${organizationId}`, '_blank')}>
                  <Code className="mr-2 h-4 w-4" />
                  Test Live Widget
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}