import { Suspense } from 'react';
import PreferencesContent from './PreferencesContent';
import { Loader2 } from 'lucide-react';

export default function PreferencesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <PreferencesContent />
    </Suspense>
  );
}