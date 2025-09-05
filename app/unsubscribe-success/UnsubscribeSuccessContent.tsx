'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function UnsubscribeSuccessContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Successfully Unsubscribed
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-4">
            {email ? (
              <>You've been unsubscribed from marketing communications for <strong>{email}</strong>.</>
            ) : (
              <>You've been successfully unsubscribed from marketing communications.</>
            )}
          </p>
          <p className="text-sm text-gray-500">
            We're sorry to see you go! If you change your mind, you can always re-subscribe 
            through your account settings or by contacting us.
          </p>
          <div className="mt-6">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Return to home page
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}