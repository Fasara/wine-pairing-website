import {
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const WINE_TYPES = ['red', 'white', 'sparkling', 'rose', 'dessert', 'port'] as const;
export type WineType = (typeof WINE_TYPES)[number];

export const wineTypeEnum = pgEnum('wine_type', WINE_TYPES);

export const wines = pgTable('wines', {
  id: serial('id').primaryKey(),
  externalId: text('external_id').notNull().unique(),
  name: text('name').notNull(),
  winery: text('winery').notNull(),
  type: wineTypeEnum('type').notNull(),
  grape: text('grape'),
  region: text('region'),
  country: text('country'),
  ratingAverage: doublePrecision('rating_average'),
  ratingReviews: integer('rating_reviews'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const foodCategories = pgTable('food_categories', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
});

export const foods = pgTable('foods', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id')
    .notNull()
    .references(() => foodCategories.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
});

export const pairingRules = pgTable(
  'pairing_rules',
  {
    id: serial('id').primaryKey(),
    wineType: wineTypeEnum('wine_type').notNull(),
    grape: text('grape'),
    foodCategoryId: integer('food_category_id')
      .notNull()
      .references(() => foodCategories.id, { onDelete: 'cascade' }),
    strength: integer('strength').notNull(),
    reason: text('reason').notNull(),
  },
  (t) => [uniqueIndex('pairing_rules_unique').on(t.wineType, t.grape, t.foodCategoryId)],
);

export type WineRow = typeof wines.$inferSelect;
export type FoodCategoryRow = typeof foodCategories.$inferSelect;
export type FoodRow = typeof foods.$inferSelect;
export type PairingRuleRow = typeof pairingRules.$inferSelect;
