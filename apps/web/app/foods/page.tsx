import type { Metadata } from 'next';
import { FoodCard } from '@/components/FoodCard';
import { EmptyState } from '@/components/States';
import { api } from '@/lib/api';
import type { Food } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Foods' };

export default async function FoodsPage() {
  const [categories, foods] = await Promise.all([api.listFoodCategories(), api.listFoods()]);

  const groups = categories
    .map((category) => ({
      category,
      foods: foods.filter((f: Food) => f.category.slug === category.slug),
    }))
    .filter((g) => g.foods.length > 0);

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl font-bold text-sage-900">Foods</h1>
      {groups.length === 0 ? (
        <EmptyState title="No foods available">Check back soon.</EmptyState>
      ) : (
        groups.map(({ category, foods: list }) => (
          <section key={category.id} aria-labelledby={`cat-${category.slug}`}>
            <h2 id={`cat-${category.slug}`} className="mb-3 font-serif text-xl font-semibold text-sage-800">
              {category.name}
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {list.map((food) => (
                <FoodCard key={food.id} food={food} />
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
