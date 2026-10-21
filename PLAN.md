# Wine & Food Pairing Website: Plan

Status: **plan only, nothing built yet.**

## 1. Requirements (from README)

- Website where users find wine and food pairing recommendations.
- Backend: Node, NestJS, TypeScript, PostgreSQL, Drizzle for migrations.
- Wine data is pulled from a public API.
- Frontend: Next.js, main colour sage green.
- Everything runs with `docker compose`, locally.
- Tested, with meaningful coverage.

## 2. Open questions and assumptions

The README leaves these open. I will proceed with the defaults below unless told otherwise.

| # | Question | Default assumption |
|---|----------|--------------------|
| 1 | Which public API? | **SampleAPIs Wines** (`https://api.sampleapis.com/wines/{reds,whites,sparkling,rose,dessert,port}`). It is free, needs no key and returns JSON. Access sits behind an adapter interface, so it can be swapped for another source. |
| 2 | Where do pairings come from? The API has no food data. | A **curated pairing rules table** seeded by us. It maps wine style or grape to food categories and dishes, with a short reason. |
| 3 | User accounts? | **No.** The site is read-only and public. Favourites could come later. |
| 4 | Pairing direction? | **Both**: wine → foods, and food → wines. |
| 5 | Monorepo layout? | npm workspaces: `apps/api`, `apps/web`. |

## 3. Architecture

```
Browser ── Next.js (apps/web, :3000) ── HTTP ──> NestJS (apps/api, :4000) ── Drizzle ──> PostgreSQL (:5432)
                                                      │
                                                      └── sync job ──> Public wine API
```

- The API **syncs** wine data from the public API into Postgres, once at startup and then on demand via a protected endpoint or a scheduled job. Requests are served from our DB, so the site stays fast and keeps working if the public API is down.
- The web app talks only to our API, never to the public API.

## 4. Data model (Drizzle, PostgreSQL)

- `wines`: id, external_id (unique), name, winery, type (red/white/sparkling/rose/dessert/port), grape, region, country, rating_average, rating_reviews, image_url, created_at, updated_at.
- `food_categories`: id, slug, name (e.g. red-meat, poultry, seafood, cheese, pasta, vegetarian, dessert, spicy).
- `foods`: id, category_id, slug, name.
- `pairing_rules`: id, wine_type, grape (nullable), food_category_id, strength (1–5), reason.
- Drizzle migrations live in `apps/api/drizzle/`. The seed script loads the categories, foods and pairing rules.

## 5. Backend (NestJS)

Modules:

- `DatabaseModule`: Drizzle client provider (`drizzle-orm/node-postgres`).
- `WinesModule`: list, filter and search wines. `GET /wines?type=&country=&q=&page=`, `GET /wines/:id`.
- `FoodsModule`: `GET /foods`, `GET /food-categories`.
- `PairingsModule`:
  - `GET /wines/:id/pairings` returns foods for a wine.
  - `GET /foods/:slug/wines` returns wines for a food.
  - Ranking: rule strength first, then wine rating.
- `SyncModule`: `WineSourceClient` interface with a SampleAPIs implementation. A sync service upserts by `external_id`, normalises types and handles bad records.
- Cross-cutting: `class-validator` DTOs, global validation pipe, error filter, CORS for the web origin, `/health` endpoint, Swagger docs at `/docs`, env config via `@nestjs/config`.

## 6. Frontend (Next.js, App Router, TypeScript)

Pages:

- `/`: hero with two entry points ("I have a wine" / "I have a dish") and featured pairings.
- `/wines`: browsable list with type, country and search filters, and pagination.
- `/wines/[id]`: wine details and recommended foods.
- `/foods`: food categories and foods.
- `/foods/[slug]`: wines that go with the food.

Design:

- Sage green as the primary colour, set as CSS variables: sage `#9CAF88` base, a darker `#6B8062` for text and buttons that need contrast, a light `#EEF2EA` for backgrounds. Neutrals are warm off-white and charcoal.
- Styling with Tailwind CSS, tokens defined in the theme config.
- Responsive and accessible: semantic HTML, keyboard navigation, WCAG AA contrast (hence the darker sage for text).
- Server Components fetch from the API. Client components are used only for filters and the search box.

## 7. Docker Compose

Services:

- `db`: `postgres:16`, a named volume and a healthcheck.
- `api`: multi-stage Dockerfile. On start it runs migrations, then seeds, then starts Nest.
- `web`: multi-stage Dockerfile, Next.js `standalone` output.
- Optional `docker-compose.override.yml` for dev with hot reload and mounted source.
- `.env.example` with all variables (DB credentials, `API_URL`, `WINE_API_BASE_URL`). `docker compose up --build` is the only command needed to run it.

## 8. Testing strategy

| Layer | Tooling | What is covered |
|-------|---------|-----------------|
| API unit | Jest | Services (pairing ranking, sync normalisation, upsert logic), the source client with mocked HTTP, DTO validation |
| API integration / e2e | Jest + Supertest + real Postgres (Testcontainers or the compose `db` service) | Every endpoint against a migrated, seeded DB. The public API is mocked. |
| Web unit / component | Vitest + React Testing Library | Components, filters, empty and error states |
| Web e2e | Playwright | Main flows against the full compose stack: find a wine → see pairings, pick a food → see wines |
| Coverage | Jest and Vitest coverage | Target **≥ 80%** lines on both apps, enforced in CI config |

## 9. Build order

1. **Scaffold**: monorepo, TypeScript configs, lint and format, `.gitignore`, `.env.example`.
2. **DB**: Drizzle schema, first migration, seed data for foods and pairing rules.
3. **Sync**: source client and sync service, with tests.
4. **API**: wines, foods and pairings modules, with unit and e2e tests.
5. **Docker**: compose for `db` and `api`. Verify migrate, seed and sync end to end.
6. **Web**: theme and layout, then pages one at a time, each with component tests.
7. **Docker**: add `web` to compose and run Playwright against the full stack.
8. **Polish**: error and loading states, accessibility pass, README with run and test instructions.

## 10. Definition of done

- `docker compose up --build` on a clean machine brings up db, api and web with no manual steps.
- The site shows sage green branding and the pairing flows work in both directions.
- All test suites pass and coverage meets the target.
- The README documents setup, env vars, scripts and the data source.

## 11. Risks

- **The public API may be thin, inconsistent or down.** Mitigation: the adapter, the local DB copy and defensive normalisation.
- **Pairing quality depends on our curated rules.** Mitigation: start with sound classic pairings, keep the rules in data so they are easy to extend.
- **The README is brief.** The assumptions in section 2 need confirmation before the build starts.
