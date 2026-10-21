'use client';

import { ErrorState } from '@/components/States';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorState
      title="We could not load this page"
      message="The wine service may be unavailable. Please try again in a moment."
      onRetry={reset}
    />
  );
}
