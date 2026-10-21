## Goal
Build a wine website where users can find wine and food pairing recommendation.

### Backend
Use Node, NestJS and Typescript.
Databasa PostgresSQL.
Migrations tool Drizzle.
The wine data is pulled from a public API.

### Frontend
Use NextJS for the frontend. The main colour of the design is sage green.

Everything runs with docker compose.
Must run locally.
Must be tested and covered with tests.

## Running

```
cp .env.example .env
docker compose up --build
```

- Web: http://localhost:3000
- API: http://localhost:4000 (Swagger at `/docs`)

On start the API runs migrations, seeds foods and pairing rules, and syncs wines from the public SampleAPIs wines API in the background. Endpoints are documented in `API_CONTRACT.md`.

## Tests

- API: `cd apps/api && npm ci && npm run test:cov` (unit). `npm run test:e2e` needs `DATABASE_URL` pointing at a **disposable** Postgres, because it drops the `public` schema.
- Web: `cd apps/web && npm ci && npm run test:cov`.
- Web e2e: `npm run build && npm run test:e2e` (uses a mock API), or `BASE_URL=http://localhost:3000 npm run test:e2e` against a running compose stack.
