import { EmptyState } from '@/components/States';

export default function NotFound() {
  return (
    <EmptyState title="Page not found" action={{ href: '/', label: 'Back to home' }}>
      We could not find what you were looking for.
    </EmptyState>
  );
}
