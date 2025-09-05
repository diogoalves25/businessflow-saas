'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useWhiteLabel } from '@/lib/white-label/theme-provider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Palette,
  Upload,
  Globe,
  Mail,
  Code,
  Eye,
  Save,
  Loader2,
  AlertCircle,
  Crown,
  Terminal,
} from 'lucide-react';
import { canAccessFeature } from '@/src/lib/feature-gating';
import { useRouter } from 'next/navigation';

export default function BrandingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { theme, updateTheme } = useWhiteLabel();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  
  const [formData, setFormData] = useState({
    brandName: '',
    primaryColor: '#0066FF',
    secondaryColor: '#F3F4F6',
    customDomain: '',
    emailFromName: '',
    emailFromAddress: '',
    customCSS: '',
    removeBusinessFlowBranding: false,
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  useEffect(() => {
    // Check Premium access
    const checkAccess = async () => {
      if (session?.user?.organizationId) {
        try {
          const response = await fetch('/api/organization/' + session.user.organizationId);
          if (response.ok) {
            const org = await response.json();
            setHasPremiumAccess(canAccessFeature(org.stripePriceId || null, 'hasWhiteLabel'));
          }
        } catch (error) {
          console.error('Error checking Premium access:', error);
        }
      }
      setLoading(false);
    };
    
    checkAccess();
  }, [session]);

  useEffect(() => {
    if (theme) {
      setFormData({
        brandName: theme.brandName || 'BusinessFlow',
        primaryColor: theme.primaryColor || '#0066FF',
        secondaryColor: theme.secondaryColor || '#F3F4F6',
        customDomain: theme.customDomain || '',
        emailFromName: theme.emailFromName || '',
        emailFromAddress: theme.emailFromAddress || '',
        customCSS: theme.customCSS || '',
        removeBusinessFlowBranding: theme.removeBusinessFlowBranding || false,
      });
    }
  }, [theme]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formDataToSend = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString());
      });

      // Add files if selected
      if (logoFile) {
        formDataToSend.append('logo', logoFile);
      }
      if (faviconFile) {
        formDataToSend.append('favicon', faviconFile);
      }

      const response = await fetch('/api/white-label/settings', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      await updateTheme(formData);
      // Show success message
    } catch (error) {
      console.error('Error saving branding settings:', error);
      // Show error message
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasPremiumAccess) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-yellow-500" />
              White Label Branding
            </CardTitle>
            <CardDescription>
              Customize BusinessFlow with your own branding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                White label branding is available on the Premium plan ($99.99/mo).
                Upgrade to customize your platform with your own logo, colors, and domain.
              </AlertDescription>
            </Alert>
            <Button className="mt-4" onClick={() => window.location.href = '/admin/billing'}>
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">White Label Branding</h1>
          <p className="text-muted-foreground">
            Customize BusinessFlow with your own branding
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="mr-2 h-4 w-4" />
            {previewMode ? 'Exit Preview' : 'Preview'}
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Custom Domains</CardTitle>
            <CardDescription>Use your own domain</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => router.push('/admin/branding/domains')}>
              <Globe className="mr-2 h-4 w-4" />
              Manage Domains
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Booking Widget</CardTitle>
            <CardDescription>Embed on your website</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => router.push('/admin/branding/widget')}>
              <Code className="mr-2 h-4 w-4" />
              Get Widget Code
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">API White Label</CardTitle>
            <CardDescription>Branded API access</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => router.push('/admin/branding/api')}>
              <Terminal className="mr-2 h-4 w-4" />
              API Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="colors">Colors & Theme</TabsTrigger>
            <TabsTrigger value="domain">Custom Domain</TabsTrigger>
            <TabsTrigger value="email">Email Settings</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Brand Identity</CardTitle>
                <CardDescription>
                  Basic branding settings for your platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="brandName">Brand Name</Label>
                  <Input
                    id="brandName"
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    placeholder="Your Business Name"
                  />
                  <p className="text-sm text-muted-foreground">
                    This will replace "BusinessFlow" throughout the platform
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="logo">Logo</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      {theme?.logoUrl ? (
                        <img
                          src={theme.logoUrl}
                          alt="Current logo"
                          className="mx-auto h-20 object-contain mb-2"
                        />
                      ) : null}
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Recommended: 200x50px PNG with transparent background
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="favicon">Favicon</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      {theme?.faviconUrl ? (
                        <img
                          src={theme.faviconUrl}
                          alt="Current favicon"
                          className="mx-auto h-8 w-8 object-contain mb-2"
                        />
                      ) : null}
                      <Input
                        id="favicon"
                        type="file"
                        accept="image/x-icon,image/png"
                        onChange={(e) => setFaviconFile(e.target.files?.[0] || null)}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        32x32px ICO or PNG file
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="removeBranding"
                    checked={formData.removeBusinessFlowBranding}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, removeBusinessFlowBranding: checked })
                    }
                  />
                  <Label htmlFor="removeBranding">
                    Remove "Powered by BusinessFlow" branding
                  </Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="colors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Colors & Theme</CardTitle>
                <CardDescription>
                  Customize the color scheme of your platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        placeholder="#0066FF"
                        className="flex-1"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Used for buttons, links, and primary actions
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        placeholder="#F3F4F6"
                        className="flex-1"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Used for backgrounds and secondary elements
                    </p>
                  </div>
                </div>

                {/* Color Preview */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Preview</h4>
                  <div className="space-y-3">
                    <Button style={{ backgroundColor: formData.primaryColor }}>
                      Primary Button
                    </Button>
                    <div
                      className="p-4 rounded"
                      style={{ backgroundColor: formData.secondaryColor }}
                    >
                      <p className="text-sm">Secondary Background</p>
                    </div>
                    <a
                      href="#"
                      style={{ color: formData.primaryColor }}
                      className="text-sm hover:underline"
                    >
                      Link Color
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="domain" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Custom Domain</CardTitle>
                <CardDescription>
                  Use your own domain for the platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customDomain">Custom Domain</Label>
                  <Input
                    id="customDomain"
                    value={formData.customDomain}
                    onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                    placeholder="app.yourbusiness.com"
                  />
                  <p className="text-sm text-muted-foreground">
                    Point your domain's CNAME to: app.businessflow.com
                  </p>
                </div>

                {formData.customDomain && (
                  <Alert>
                    <Globe className="h-4 w-4" />
                    <AlertDescription>
                      <strong>DNS Configuration:</strong>
                      <br />
                      Add a CNAME record for {formData.customDomain} pointing to app.businessflow.com
                      <br />
                      SSL certificate will be automatically provisioned once DNS is configured.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Domain Status</h4>
                  {theme?.customDomain ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                        Active
                      </Badge>
                      <span className="text-sm">{theme.customDomain}</span>
                    </div>
                  ) : (
                    <Badge variant="secondary">Not configured</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Settings</CardTitle>
                <CardDescription>
                  Customize email sender information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="emailFromName">From Name</Label>
                    <Input
                      id="emailFromName"
                      value={formData.emailFromName}
                      onChange={(e) => setFormData({ ...formData, emailFromName: e.target.value })}
                      placeholder="Your Business"
                    />
                    <p className="text-sm text-muted-foreground">
                      Name shown in email "From" field
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailFromAddress">From Email</Label>
                    <Input
                      id="emailFromAddress"
                      type="email"
                      value={formData.emailFromAddress}
                      onChange={(e) => setFormData({ ...formData, emailFromAddress: e.target.value })}
                      placeholder="noreply@yourbusiness.com"
                    />
                    <p className="text-sm text-muted-foreground">
                      Must be verified with your email provider
                    </p>
                  </div>
                </div>

                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    Email domains must be verified with your email service provider (SendGrid, Resend, etc.)
                    before they can be used as the "From" address.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Custom CSS</CardTitle>
                <CardDescription>
                  Add custom CSS to further customize the platform appearance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customCSS">Custom CSS</Label>
                  <Textarea
                    id="customCSS"
                    value={formData.customCSS}
                    onChange={(e) => setFormData({ ...formData, customCSS: e.target.value })}
                    placeholder="/* Your custom CSS here */
.custom-class {
  /* styles */
}"
                    className="font-mono text-sm"
                    rows={10}
                  />
                  <p className="text-sm text-muted-foreground">
                    Advanced: Override default styles with custom CSS
                  </p>
                </div>

                <Alert>
                  <Code className="h-4 w-4" />
                  <AlertDescription>
                    Be careful with custom CSS. Test thoroughly to ensure it doesn't break the layout.
                    Use specific selectors to avoid conflicts.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}