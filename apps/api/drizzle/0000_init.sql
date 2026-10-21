CREATE TYPE "public"."wine_type" AS ENUM('red', 'white', 'sparkling', 'rose', 'dessert', 'port');--> statement-breakpoint
CREATE TABLE "food_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "food_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "foods" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "foods_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "pairing_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"wine_type" "wine_type" NOT NULL,
	"grape" text,
	"food_category_id" integer NOT NULL,
	"strength" integer NOT NULL,
	"reason" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wines" (
	"id" serial PRIMARY KEY NOT NULL,
	"external_id" text NOT NULL,
	"name" text NOT NULL,
	"winery" text NOT NULL,
	"type" "wine_type" NOT NULL,
	"grape" text,
	"region" text,
	"country" text,
	"rating_average" double precision,
	"rating_reviews" integer,
	"image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wines_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
ALTER TABLE "foods" ADD CONSTRAINT "foods_category_id_food_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."food_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pairing_rules" ADD CONSTRAINT "pairing_rules_food_category_id_food_categories_id_fk" FOREIGN KEY ("food_category_id") REFERENCES "public"."food_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "pairing_rules_unique" ON "pairing_rules" USING btree ("wine_type","grape","food_category_id");