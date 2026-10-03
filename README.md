# MineSense Predictive Maintenance

MineSense is a predictive-maintenance dashboard prototype for mining operations. It simulates equipment telemetry, flags abnormal readings, estimates equipment failure risk, and helps maintenance teams plan service before unplanned downtime.

This project was created as a mechanical engineering concept for the Newmont Industrial Training Program. All readings and risk scores are simulated; they are for demonstration only and are not operational predictions.

## Features

- Fleet health, uptime, at-risk assets, and avoided downtime
- Equipment telemetry for temperature, vibration, pressure, oil condition, operating hours, and fault history
- Risk scores, anomaly alerts, contributing signals, and recommended service windows
- Maintenance scheduling, fleet search, and filtering
- 24-hour, 7-day, and 30-day telemetry views
- Overview, Fleet, Maintenance, and Data Explorer screens
- Responsive desktop and mobile layouts

## Run locally

Requirements: Node.js 20 or newer and pnpm 10 or newer.

```bash
git clone https://github.com/darolawei/minesense-predictive-maintenance.git
cd minesense-predictive-maintenance/MineSense-Predictive-Maintenance
pnpm install
```

Start the development server:

```bash
pnpm --filter @workspace/minesense-maintenance run dev
```

If the default port or base path needs to be set explicitly:

```bash
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/minesense-maintenance run dev
```

On Windows PowerShell:

```powershell
$env:PORT="5173"; $env:BASE_PATH="/"; pnpm --filter @workspace/minesense-maintenance run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Build and type-check

Run these from the `MineSense-Predictive-Maintenance` directory:

```bash
pnpm --filter @workspace/minesense-maintenance run build
pnpm --filter @workspace/minesense-maintenance run typecheck
```

## Project details

The dashboard uses React 19, TypeScript, Vite, Tailwind CSS, Recharts, Framer Motion, and Lucide React. The repository also includes API and database scaffolding for potential future integrations.

See the [detailed project README](MineSense-Predictive-Maintenance/README.md) for IntelliJ IDEA setup, build output, project structure, and future engineering improvements.
