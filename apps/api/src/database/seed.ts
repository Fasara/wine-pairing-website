import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { categories, rules, slugify } from './seed-data';
import * as schema from './schema';

/** Idempotent: categories and foods are upserted by slug, pairing rules are replaced. */
export async function seed(pool: Pool) {
  const db = drizzle(pool, { schema });
  await db.transaction(async (tx) => {
    const categoryIds = new Map<string, number>();
    for (const c of categories) {
      const [row] = await tx
        .insert(schema.foodCategories)
        .values({ slug: c.slug, name: c.name })
        .onConflictDoUpdate({ target: schema.foodCategories.slug, set: { name: c.name } })
        .returning();
      categoryIds.set(c.slug, row.id);
      for (const name of c.foods) {
        await tx
          .insert(schema.foods)
          .values({ categoryId: row.id, slug: slugify(name), name })
          .onConflictDoUpdate({ target: schema.foods.slug, set: { name, categoryId: row.id } });
      }
    }
    await tx.delete(schema.pairingRules);
    await tx.insert(schema.pairingRules).values(
      rules.map((rule) => {
        const foodCategoryId = categoryIds.get(rule.category);
        if (!foodCategoryId) throw new Error(`Unknown category in rule: ${rule.category}`);
        return {
          wineType: rule.wineType,
          grape: rule.grape,
          foodCategoryId,
          strength: rule.strength,
          reason: rule.reason,
        };
      }),
    );
  });
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required');
  const pool = new Pool({ connectionString: url });
  try {
    await seed(pool);
    console.log(`Seeded ${categories.length} categories and ${rules.length} pairing rules`);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
