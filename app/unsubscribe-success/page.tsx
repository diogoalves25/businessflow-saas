import { Suspense } from 'react';
import UnsubscribeSuccessContent from './UnsubscribeSuccessContent';

export default function UnsubscribeSuccess() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UnsubscribeSuccessContent />
    </Suspense>
  );
}