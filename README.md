# GameZM

GameZM is a React/Vite application with an Express API. The backend stores tournament, match, player, booking, store, and settings data in PostgreSQL through the `pg` connection pool. The same API is used locally and by the Vercel function in `api/index.ts`.

## Requirements and local setup

- Node.js 18 or later
- A reachable PostgreSQL database (Aiven PostgreSQL is supported)
- Python 3 only if you plan to import `tournament.db`

```sh
npm install
```

Copy `.env.example` to `.env` and replace the placeholders locally. Do not commit `.env` or paste connection strings into issue reports or logs. Set `DATABASE_URL` in Vercel's project environment variables for each deployment environment. Aiven connection strings should use TLS (`sslmode=require`). You can optionally set `PGSSL_CA` to the CA certificate contents (use `\n` for line breaks) to enable certificate verification.

The server applies the idempotent PostgreSQL schema in `database.sql` at startup. You can also run the schema step explicitly:

```sh
npm run db:migrate
```

Start the full-stack development server:

```sh
npm run dev
```

The local server listens on `http://localhost:3000` by default. Set `PORT` to use another port. Build and start the production server with:

```sh
npm run build
npm start
```

Run the TypeScript check with `npm run lint`. The API retains its existing paths, methods, and response payload structures. Vercel's serverless runtime uses the same PostgreSQL pool with a smaller connection limit. WebSockets are available only in the local standalone server; Vercel uses the existing polling behavior.

## Backend structure

- `src/server/routes/` declares API endpoints grouped by domain and applies shared request validation and async error forwarding.
- `src/server/controllers/` provides per-domain HTTP adapters.
- `src/server/services/` contains domain operations, transaction coordination, settings, and event publishing.
- `src/server/models/databaseModel.ts` owns the PostgreSQL pool and transaction context; `src/server/models/queryModel.ts` is the shared parameterized SQL gateway.

The route groups cover authentication, tournaments, teams, auctions/players, matches/scoring, reporting, commerce, and community/settings. Complex cross-entity behavior uses SQL joins and transactions through the shared query model.

**Refactor boundary:** domain route/controller/service modules now cover all existing endpoints, but the service handlers still accept Express request/response objects and issue parameterized SQL through the shared query model. Per-entity repositories and a strict HTTP-free service boundary remain follow-up work; this split removes the all-routes controller monolith but is not a fully isolated repository-per-entity design.

## Existing SQLite records: safe PostgreSQL import

The repository's `tournament.db` is **not** copied or imported automatically. Keep an unchanged backup before starting. The importer never updates or deletes PostgreSQL rows: it inserts SQLite rows with their original IDs and uses `ON CONFLICT DO NOTHING`. Conflicts on IDs or other unique constraints, and rows with invalid foreign-key references, are skipped. It then synchronizes PostgreSQL identity sequences.

1. Configure `DATABASE_URL` in your local environment (or `.env`) without sharing it. Ensure it points to the intended Aiven database.
2. Create/update the target schema:
   ```sh
   npm run db:migrate
   ```
3. Review the local source counts without connecting to PostgreSQL:
   ```sh
   npm run db:import:sqlite -- --dry-run
   ```
4. After reviewing the source and confirming the target, perform the import explicitly:
   ```sh
   npm run db:import:sqlite -- --apply
   ```
   To import a different SQLite file, append its path, for example `-- --apply "D:\backups\tournament.db"`.
5. Review the per-table imported/skipped counts, then verify the target data in your normal database administration tool.

The import is repeatable: rerunning it does not overwrite existing Aiven records. It uses Python's standard-library SQLite reader and the configured `DATABASE_URL`; it does not require or install a SQLite npm database driver.

## Deployment

Vercel serves the Vite build and routes `/api/*` through `api/index.ts`. Configure `DATABASE_URL` and any application secrets in Vercel's environment settings before deploying. The schema initialization is idempotent and runs when the API instance starts. Do not use the SQLite file as a serverless database.
