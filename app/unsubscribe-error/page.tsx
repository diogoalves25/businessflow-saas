import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

export default function UnsubscribeError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Unsubscribe Error
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-4">
            We encountered an error processing your unsubscribe request. 
            This could be due to an invalid or expired link.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            If you continue to have issues, please contact our support team 
            and we'll be happy to help you manage your communication preferences.
          </p>
          <div className="space-y-3">
            <a
              href="/contact"
              className="block w-full bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </a>
            <a
              href="/"
              className="block w-full text-blue-600 hover:text-blue-500 font-medium"
            >
              Return to home page
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}