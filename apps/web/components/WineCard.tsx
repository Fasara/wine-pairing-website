import Link from 'next/link';
import { formatRating } from '@/lib/format';
import type { Wine } from '@/lib/types';
import { TypeBadge } from './TypeBadge';
import { WineImage } from './WineImage';

export function WineCard({ wine }: { wine: Wine }) {
  const rating = formatRating(wine.ratingAverage, wine.ratingReviews);
  const origin = [wine.region, wine.country].filter(Boolean).join(', ');
  return (
    <article className="card flex flex-col gap-3">
      <WineImage src={wine.imageUrl} name={wine.name} />
      <div className="flex flex-col gap-1">
        <TypeBadge type={wine.type} />
        <h3 className="font-serif text-lg font-semibold text-ink">
          <Link href={`/wines/${wine.id}`} className="underline-offset-4 hover:underline">
            {wine.name}
          </Link>
        </h3>
        <p className="text-sm text-muted">{wine.winery}</p>
        {origin && <p className="text-sm text-muted">{origin}</p>}
        {rating && <p className="text-sm text-ink">Rating {rating}</p>}
      </div>
    </article>
  );
}
