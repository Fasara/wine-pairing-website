import Link from 'next/link';
import { StrengthMeter } from '@/components/StrengthMeter';
import { api } from '@/lib/api';
import type { Wine, WinePairing } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface Featured {
  wine: Wine;
  pairing: WinePairing;
}

async function loadFeatured(): Promise<Featured[]> {
  try {
    const { items } = await api.listWines({ pageSize: 3 });
    const results = await Promise.all(
      items.map(async (wine) => {
        const pairings = await api.getWinePairings(wine.id);
        return pairings[0] ? { wine, pairing: pairings[0] } : null;
      }),
    );
    return results.filter((r): r is Featured => r !== null);
  } catch {
    return []; // featured block is optional; the entry points still work
  }
}

export default async function HomePage() {
  const featured = await loadFeatured();
  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-sage-50 px-6 py-12 text-center">
        <h1 className="font-serif text-4xl font-bold text-sage-900 sm:text-5xl">
          What shall we pour, and what shall we eat?
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
          Find the perfect dish for your bottle, or the perfect bottle for your dinner.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/wines" className="btn px-6 py-3 text-base">
            I have a wine
          </Link>
          <Link href="/foods" className="btn-outline bg-white px-6 py-3 text-base">
            I have a dish
          </Link>
        </div>
      </section>

      {featured.length > 0 && (
        <section aria-labelledby="featured-heading">
          <h2 id="featured-heading" className="font-serif text-2xl font-semibold">
            Featured pairings
          </h2>
          <ul className="mt-4 grid gap-4 md:grid-cols-3">
            {featured.map(({ wine, pairing }) => (
              <li key={wine.id} className="card" data-testid="featured">
                <Link
                  href={`/wines/${wine.id}`}
                  className="font-serif text-lg font-semibold text-sage-800 underline underline-offset-4"
                >
                  {wine.name}
                </Link>
                <p className="mt-1 text-sm text-muted">pairs with</p>
                <p className="font-medium">{pairing.food.name}</p>
                <div className="mt-2">
                  <StrengthMeter strength={pairing.strength} />
                </div>
                <p className="mt-2 text-sm">{pairing.reason}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
