# MineSense Predictive Maintenance

MineSense is an interactive predictive-maintenance prototype that turns simulated mining-equipment telemetry into explainable risk signals and maintenance recommendations.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/minesense-maintenance/src/App.tsx` — interactive dashboard experience and simulated equipment data
- `artifacts/minesense-maintenance/src/index.css` — MineSense control-room theme, responsive layout, and chart styling
- `artifacts/minesense-maintenance/vite.config.ts` — Vite app configuration and artifact routing
- `artifacts/api-server/` — shared API scaffold, currently unused because this prototype runs on simulated frontend data

## Architecture decisions

- The first build is frontend-only so the interview prototype can demonstrate the product surface without requiring a live industrial data source.
- Equipment telemetry and model scores are simulated but structured around realistic mining signals: temperature, vibration, pressure, oil condition, fault history, downtime, and repair duration.
- The dashboard emphasizes explainability by showing the top contributing signals and an estimated service window alongside the risk score.

## Product

- Review overall fleet health, at-risk assets, uptime, and avoided downtime.
- Inspect a selected asset's telemetry trend and anomaly count over 24-hour, 7-day, or 30-day ranges.
- Filter the fleet by status and search equipment records.
- Browse maintenance history and schedule a recommended intervention from the dashboard.
- Explore simulated readings and model confidence in a compact data view.

## User preferences

No additional preferences recorded.

## Gotchas

- The web workflow supplies `PORT` and `BASE_PATH`; use the managed artifact workflow for preview instead of starting Vite manually.
- The prototype's data is intentionally simulated and should be replaced with a real API/data pipeline before production use.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
