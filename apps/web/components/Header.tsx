import Link from 'next/link';

const links = [
  { href: '/wines', label: 'Wines' },
  { href: '/foods', label: 'Foods' },
];

export function Header() {
  return (
    <header className="border-b border-sage-100 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="font-serif text-xl font-bold text-sage-800">
          Sage &amp; Vine
        </Link>
        <nav aria-label="Main">
          <ul className="flex gap-5 text-sm font-medium">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sage-800 underline-offset-4 hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
