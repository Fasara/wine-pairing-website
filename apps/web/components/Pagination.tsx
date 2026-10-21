import Link from 'next/link';

interface Props {
  page: number;
  pageSize: number;
  total: number;
  hrefFor: (page: number) => string;
}

export function Pagination({ page, pageSize, total, hrefFor }: Props) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;

  const start = Math.max(1, Math.min(page - 2, pages - 4));
  const end = Math.min(pages, start + 4);
  const numbers = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className="btn-outline">
          Previous
        </Link>
      ) : (
        <span aria-disabled="true" className="rounded-md px-4 py-2 text-sm text-muted">
          Previous
        </span>
      )}
      <ul className="flex gap-1">
        {numbers.map((n) => (
          <li key={n}>
            <Link
              href={hrefFor(n)}
              aria-current={n === page ? 'page' : undefined}
              aria-label={`Page ${n}`}
              className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm font-semibold ${
                n === page ? 'bg-sage-700 text-white' : 'text-sage-800 hover:bg-sage-50'
              }`}
            >
              {n}
            </Link>
          </li>
        ))}
      </ul>
      {page < pages ? (
        <Link href={hrefFor(page + 1)} rel="next" className="btn-outline">
          Next
        </Link>
      ) : (
        <span aria-disabled="true" className="rounded-md px-4 py-2 text-sm text-muted">
          Next
        </span>
      )}
    </nav>
  );
}
