import type { Metadata } from 'next';
import { EmptyState } from '@/components/States';
import { Pagination } from '@/components/Pagination';
import { WineCard } from '@/components/WineCard';
import { WineFilters } from '@/components/WineFilters';
import { api } from '@/lib/api';
import { parsePage, parseType, winesHref } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Wines' };

type Search = { type?: string; country?: string; q?: string; page?: string };

export default async function WinesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const type = parseType(sp.type);
  const country = sp.country || undefined;
  const q = sp.q?.trim() || undefined;
  const page = parsePage(sp.page);

  const [result, countries] = await Promise.all([
    api.listWines({ type, country, q, page }),
    api.listCountries().catch(() => [] as string[]),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold text-sage-900">Wines</h1>
      <WineFilters type={type} country={country} q={q} countries={countries} />
      <p aria-live="polite" className="text-sm text-muted">
        {result.total} {result.total === 1 ? 'wine' : 'wines'} found
      </p>
      {result.items.length === 0 ? (
        <EmptyState title="No wines match your filters" action={{ href: '/wines', label: 'Clear filters' }}>
          Try a different search or remove a filter.
        </EmptyState>
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {result.items.map((wine) => (
              <li key={wine.id}>
                <WineCard wine={wine} />
              </li>
            ))}
          </ul>
          <Pagination
            page={result.page}
            pageSize={result.pageSize}
            total={result.total}
            hrefFor={(p) => winesHref({ type, country, q, page: p })}
          />
        </>
      )}
    </div>
  );
}
