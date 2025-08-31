'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  Smartphone,
  Monitor,
  CreditCard,
  Users,
  Settings,
  Calendar,
  MessageSquare,
  TrendingUp,
  FileText,
  Palette,
  Globe,
  Brain,
  DollarSign,
} from 'lucide-react';

interface TestItem {
  id: string;
  category: string;
  description: string;
  tier?: 'starter' | 'growth' | 'premium';
  completed: boolean;
}

export default function TestingChecklistPage() {
  const [testItems, setTestItems] = useState<TestItem[]>([
    // User Flows
    { id: '1', category: 'User Flows', description: 'Sign up → Select business type → Create first booking', completed: false },
    { id: '2', category: 'User Flows', description: 'Customer booking flow (from widget)', completed: false },
    { id: '3', category: 'User Flows', description: 'Forgot password → Reset → Login', completed: false },
    { id: '4', category: 'User Flows', description: 'Update profile and business settings', completed: false },
    
    // Subscription & Billing
    { id: '5', category: 'Subscription', description: 'Upgrade from Starter → Growth', tier: 'growth', completed: false },
    { id: '6', category: 'Subscription', description: 'Upgrade from Growth → Premium', tier: 'premium', completed: false },
    { id: '7', category: 'Subscription', description: 'Downgrade subscription', completed: false },
    { id: '8', category: 'Subscription', description: 'Cancel and reactivate subscription', completed: false },
    
    // Feature Testing - Starter
    { id: '9', category: 'Starter Features', description: 'Create and manage services', tier: 'starter', completed: false },
    { id: '10', category: 'Starter Features', description: 'Book appointment from calendar', tier: 'starter', completed: false },
    { id: '11', category: 'Starter Features', description: 'Manage customer database', tier: 'starter', completed: false },
    { id: '12', category: 'Starter Features', description: 'Email notifications working', tier: 'starter', completed: false },
    
    // Feature Testing - Growth
    { id: '13', category: 'Growth Features', description: 'Process payment with Stripe', tier: 'growth', completed: false },
    { id: '14', category: 'Growth Features', description: 'Send SMS reminder', tier: 'growth', completed: false },
    { id: '15', category: 'Growth Features', description: 'Switch between locations', tier: 'growth', completed: false },
    { id: '16', category: 'Growth Features', description: 'View advanced reports', tier: 'growth', completed: false },
    { id: '17', category: 'Growth Features', description: 'Customer portal access', tier: 'growth', completed: false },
    
    // Feature Testing - Premium
    { id: '18', category: 'Premium Features', description: 'AI Assistant responds correctly', tier: 'premium', completed: false },
    { id: '19', category: 'Premium Features', description: 'Create marketing campaign', tier: 'premium', completed: false },
    { id: '20', category: 'Premium Features', description: 'Track expenses and view P&L', tier: 'premium', completed: false },
    { id: '21', category: 'Premium Features', description: 'Process payroll', tier: 'premium', completed: false },
    { id: '22', category: 'Premium Features', description: 'White label branding works', tier: 'premium', completed: false },
    { id: '23', category: 'Premium Features', description: 'Custom domain routing', tier: 'premium', completed: false },
    
    // Feature Gating
    { id: '24', category: 'Feature Gating', description: 'Starter can\'t access Growth features', completed: false },
    { id: '25', category: 'Feature Gating', description: 'Growth can\'t access Premium features', completed: false },
    { id: '26', category: 'Feature Gating', description: 'Upgrade prompts show correctly', completed: false },
    { id: '27', category: 'Feature Gating', description: 'Features unlock after upgrade', completed: false },
    
    // Mobile Testing
    { id: '28', category: 'Mobile', description: 'Responsive on mobile devices', completed: false },
    { id: '29', category: 'Mobile', description: 'Touch interactions work properly', completed: false },
    { id: '30', category: 'Mobile', description: 'Booking widget mobile friendly', completed: false },
    { id: '31', category: 'Mobile', description: 'Calendar swipe gestures work', completed: false },
    
    // Performance & Polish
    { id: '32', category: 'Performance', description: 'Pages load under 3 seconds', completed: false },
    { id: '33', category: 'Performance', description: 'No console errors', completed: false },
    { id: '34', category: 'Performance', description: 'Loading states for all actions', completed: false },
    { id: '35', category: 'Performance', description: 'Error handling with user feedback', completed: false },
    { id: '36', category: 'Performance', description: 'Form validation works correctly', completed: false },
    
    // Demo Accounts
    { id: '37', category: 'Demo Data', description: 'Sparkle Clean account has full data', completed: false },
    { id: '38', category: 'Demo Data', description: 'QuickFix Plumbing has Growth data', completed: false },
    { id: '39', category: 'Demo Data', description: 'Bright Dental has Starter data', completed: false },
    { id: '40', category: 'Demo Data', description: 'Charts show realistic trends', completed: false },
  ]);

  const toggleItem = (id: string) => {
    setTestItems(items =>
      items.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const categories = [...new Set(testItems.map(item => item.category))];
  const completedCount = testItems.filter(item => item.completed).length;
  const totalCount = testItems.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'starter': return 'bg-blue-100 text-blue-700';
      case 'growth': return 'bg-green-100 text-green-700';
      case 'premium': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'User Flows': return Users;
      case 'Subscription': return CreditCard;
      case 'Starter Features': return Calendar;
      case 'Growth Features': return TrendingUp;
      case 'Premium Features': return Brain;
      case 'Feature Gating': return Settings;
      case 'Mobile': return Smartphone;
      case 'Performance': return Monitor;
      case 'Demo Data': return FileText;
      default: return Circle;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Testing Checklist</h1>
          <p className="text-muted-foreground">
            Complete all tests before recording the demo video
          </p>
        </div>

        {/* Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Testing Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{completedCount} / {totalCount}</span>
              <Badge variant={completionPercentage === 100 ? 'success' : 'secondary'}>
                {completionPercentage}% Complete
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Test Results Summary */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Test with actual demo accounts to ensure realistic user experience.
            Login credentials are in DEMO_CREDENTIALS.md
          </AlertDescription>
        </Alert>

        {/* Test Items by Category */}
        {categories.map(category => {
          const categoryItems = testItems.filter(item => item.category === category);
          const categoryCompleted = categoryItems.filter(item => item.completed).length;
          const Icon = getCategoryIcon(category);
          
          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {category}
                  </div>
                  <Badge variant="outline">
                    {categoryCompleted} / {categoryItems.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryItems.map(item => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => toggleItem(item.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {item.description}
                        </span>
                        {item.tier && (
                          <Badge variant="outline" className={`text-xs ${getTierColor(item.tier)}`}>
                            {item.tier}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {item.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-300" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">All tests completed?</span>
                <Badge variant={completionPercentage === 100 ? 'success' : 'secondary'}>
                  {completionPercentage === 100 ? 'Ready for Demo!' : 'Keep Testing'}
                </Badge>
              </div>
              
              {completionPercentage === 100 && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Excellent!</strong> All tests passed. The platform is ready for the Upwork demo video.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="pt-4 space-y-2">
                <h4 className="font-medium">Next Steps:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Complete all remaining tests</li>
                  <li>Run npm run db:seed-demo to populate demo data</li>
                  <li>Test all three demo accounts</li>
                  <li>Record Loom video showing key features</li>
                  <li>Submit to Upwork with live URL</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}