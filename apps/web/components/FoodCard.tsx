import Link from 'next/link';
import type { Food } from '@/lib/types';

export function FoodCard({ food }: { food: Food }) {
  return (
    <li>
      <Link
        href={`/foods/${food.slug}`}
        className="card block text-ink underline-offset-4 hover:border-sage-600"
      >
        <span className="font-serif text-lg font-semibold">{food.name}</span>
        <span className="block text-sm text-muted">{food.category.name}</span>
      </Link>
    </li>
  );
}
