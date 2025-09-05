import { Suspense } from 'react';
import BookingWidgetContent from './BookingWidgetContent';
import { Loader2 } from 'lucide-react';

export default function BookingWidgetPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <BookingWidgetContent />
    </Suspense>
  );
}