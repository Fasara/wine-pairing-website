import Link from 'next/link';
import type { FoodPairing, WinePairing } from '@/lib/types';
import { StrengthMeter } from './StrengthMeter';
import { TypeBadge } from './TypeBadge';

export function WinePairingList({ pairings }: { pairings: WinePairing[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2" aria-label="Recommended foods">
      {pairings.map((p) => (
        <li key={p.food.id} className="card" data-testid="pairing">
          <div className="flex items-start justify-between gap-3">
            <Link
              href={`/foods/${p.food.slug}`}
              className="font-serif text-lg font-semibold text-sage-800 underline underline-offset-4"
            >
              {p.food.name}
            </Link>
            <StrengthMeter strength={p.strength} />
          </div>
          <p className="text-sm text-muted">{p.food.category.name}</p>
          <p className="mt-2 text-sm">{p.reason}</p>
        </li>
      ))}
    </ul>
  );
}

export function FoodPairingList({ pairings }: { pairings: FoodPairing[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2" aria-label="Recommended wines">
      {pairings.map((p) => (
        <li key={p.wine.id} className="card" data-testid="pairing">
          <div className="flex items-start justify-between gap-3">
            <Link
              href={`/wines/${p.wine.id}`}
              className="font-serif text-lg font-semibold text-sage-800 underline underline-offset-4"
            >
              {p.wine.name}
            </Link>
            <StrengthMeter strength={p.strength} />
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted">
            <TypeBadge type={p.wine.type} />
            <span>{p.wine.winery}</span>
          </div>
          <p className="mt-2 text-sm">{p.reason}</p>
        </li>
      ))}
    </ul>
  );
}
