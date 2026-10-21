import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FoodPairingList } from '@/components/PairingLists';
import { EmptyState } from '@/components/States';
import { ApiError, api } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Food' };

export default async function FoodDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let food, pairings;
  try {
    [food, pairings] = await Promise.all([api.getFood(slug), api.getFoodWines(slug)]);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <div className="space-y-8">
      <Link href="/foods" className="text-sm text-sage-800 underline underline-offset-4">
        Back to foods
      </Link>
      <header>
        <p className="text-sm text-muted">{food.category.name}</p>
        <h1 className="font-serif text-3xl font-bold text-sage-900">{food.name}</h1>
      </header>
      <section aria-labelledby="wines-heading">
        <h2 id="wines-heading" className="mb-4 font-serif text-2xl font-semibold">
          Wines that go with {food.name}
        </h2>
        {pairings.length === 0 ? (
          <EmptyState title="No wines yet">We have no wine suggestions for this dish.</EmptyState>
        ) : (
          <FoodPairingList pairings={pairings} />
        )}
      </section>
    </div>
  );
}
