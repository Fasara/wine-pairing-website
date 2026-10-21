import Link from 'next/link';
import type { ReactNode } from 'react';

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: { href: string; label: string };
}) {
  return (
    <div className="rounded-xl border border-dashed border-sage-600 bg-white p-8 text-center" data-testid="empty-state">
      <h2 className="font-serif text-xl font-semibold text-ink">{title}</h2>
      {children && <p className="mt-2 text-muted">{children}</p>}
      {action && (
        <Link href={action.href} className="btn-outline mt-4">
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="rounded-xl border border-red-700 bg-red-50 p-6 text-red-900">
      <h2 className="font-serif text-xl font-semibold">{title}</h2>
      {message && <p className="mt-2">{message}</p>}
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn mt-4">
          Try again
        </button>
      )}
    </div>
  );
}

export function LoadingGrid({ count = 6, label = 'Loading' }: { count?: number; label?: string }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">{label}…</span>
      <div aria-hidden="true" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-xl bg-sage-100" />
        ))}
      </div>
    </div>
  );
}
