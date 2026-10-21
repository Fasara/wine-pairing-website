import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { WinePairingList } from '@/components/PairingLists';
import { EmptyState } from '@/components/States';
import { TypeBadge } from '@/components/TypeBadge';
import { WineImage } from '@/components/WineImage';
import { ApiError, api } from '@/lib/api';
import { formatRating } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Wine' };

export default async function WineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  let wine, pairings;
  try {
    [wine, pairings] = await Promise.all([api.getWine(id), api.getWinePairings(id)]);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const rating = formatRating(wine.ratingAverage, wine.ratingReviews);
  const details: [string, string | null][] = [
    ['Winery', wine.winery],
    ['Grape', wine.grape],
    ['Region', wine.region],
    ['Country', wine.country],
    ['Rating', rating],
  ];

  return (
    <div className="space-y-8">
      <Link href="/wines" className="text-sm text-sage-800 underline underline-offset-4">
        Back to wines
      </Link>
      <section className="grid gap-6 md:grid-cols-[16rem_1fr]">
        <WineImage src={wine.imageUrl} name={wine.name} />
        <div>
          <TypeBadge type={wine.type} />
          <h1 className="mt-2 font-serif text-3xl font-bold text-sage-900">{wine.name}</h1>
          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
            {details
              .filter(([, v]) => v)
              .map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="font-medium text-muted">{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
          </dl>
        </div>
      </section>
      <section aria-labelledby="pairings-heading">
        <h2 id="pairings-heading" className="mb-4 font-serif text-2xl font-semibold">
          Goes well with
        </h2>
        {pairings.length === 0 ? (
          <EmptyState title="No pairings yet">We have no food suggestions for this wine.</EmptyState>
        ) : (
          <WinePairingList pairings={pairings} />
        )}
      </section>
    </div>
  );
}
