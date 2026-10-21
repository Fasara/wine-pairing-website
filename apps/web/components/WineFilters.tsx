import Link from 'next/link';
import { typeLabel } from '@/lib/format';
import { WINE_TYPES } from '@/lib/types';

interface Props {
  type?: string;
  country?: string;
  q?: string;
  countries: string[];
}

/** Plain GET form: filters live in the URL and work without client JS. */
export function WineFilters({ type, country, q, countries }: Props) {
  const active = Boolean(type || country || q);
  return (
    <form
      action="/wines"
      method="get"
      role="search"
      aria-label="Filter wines"
      className="grid gap-3 rounded-xl border border-sage-100 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5"
    >
      <div className="lg:col-span-2">
        <label htmlFor="q" className="mb-1 block text-sm font-medium">
          Search
        </label>
        <input id="q" name="q" type="search" defaultValue={q} placeholder="Name, winery or grape" className="field" />
      </div>
      <div>
        <label htmlFor="type" className="mb-1 block text-sm font-medium">
          Type
        </label>
        <select id="type" name="type" defaultValue={type ?? ''} className="field">
          <option value="">All types</option>
          {WINE_TYPES.map((t) => (
            <option key={t} value={t}>
              {typeLabel(t)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="country" className="mb-1 block text-sm font-medium">
          Country
        </label>
        <select id="country" name="country" defaultValue={country ?? ''} className="field">
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-end gap-2">
        <button type="submit" className="btn">
          Apply
        </button>
        {active && (
          <Link href="/wines" className="btn-outline">
            Clear
          </Link>
        )}
      </div>
    </form>
  );
}
