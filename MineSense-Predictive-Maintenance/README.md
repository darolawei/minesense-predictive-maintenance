# MineSense Predictive Maintenance

MineSense is a predictive-maintenance dashboard prototype for mining operations. It simulates equipment telemetry, highlights abnormal readings, estimates failure risk, and helps maintenance teams schedule an intervention before unplanned downtime.

This prototype was created as a mechanical engineering project concept for the Newmont Industrial Training Program.

## What the prototype demonstrates

- Fleet health, uptime, at-risk assets, and avoided downtime
- Simulated mining equipment telemetry:
  - Operating hours
  - Temperature
  - Vibration
  - Pressure
  - Oil condition
  - Fault history
  - Downtime
  - Maintenance type
  - Repair duration
- Equipment types including haul trucks, crushers, pumps, excavators, conveyor motors, and compressors
- Anomaly indicators and alert thresholds
- Equipment risk scores with model confidence
- Explainable contributing signals
- Recommended service windows
- Maintenance scheduling interaction
- Fleet search and filtering
- 24-hour, 7-day, and 30-day telemetry views
- Overview, Fleet, Maintenance, and Data Explorer screens
- Responsive desktop and mobile layouts

> The current readings and risk scores are simulated for demonstration. A production version would connect to real condition-monitoring sensors and use a trained anomaly-detection or remaining-useful-life model.

## Technology

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Framer Motion
- Lucide React
- pnpm workspaces

## Requirements

- Node.js 20 or newer
- pnpm 10 or newer

Check your installed versions:

```bash
node --version
pnpm --version
```

If pnpm is not installed, enable it through Corepack:

```bash
corepack enable
corepack prepare pnpm@10.26.1 --activate
```

## Run in IntelliJ IDEA

1. Extract the ZIP file, or clone the GitHub repository.
2. Open the extracted project folder in IntelliJ IDEA.
3. Open the IntelliJ Terminal.
4. Install dependencies:

   ```bash
   pnpm install
   ```

5. Start the dashboard:

   ```bash
   PORT=5173 BASE_PATH=/ pnpm --filter @workspace/minesense-maintenance run dev
   ```

6. Open the local address printed by Vite, usually:

   ```text
   http://localhost:5173
   ```

### Windows PowerShell

Use this command instead:

```powershell
$env:PORT="5173"; $env:BASE_PATH="/"; pnpm --filter @workspace/minesense-maintenance run dev
```

### IntelliJ run configuration

To run it with the IntelliJ Run button:

1. Open **Run > Edit Configurations**.
2. Add an **npm** configuration.
3. Set the package manager to **pnpm**.
4. Set the command to:

   ```text
   --filter @workspace/minesense-maintenance run dev
   ```

5. Add these environment variables:

   ```text
   PORT=5173;BASE_PATH=/
   ```

Alternatively, use the IntelliJ Terminal command above.

## Build the production bundle

Compile the dashboard with:

```bash
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/minesense-maintenance run build
```

The compiled static files are written to:

```text
artifacts/minesense-maintenance/dist/public
```

To preview the compiled output locally:

```bash
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/minesense-maintenance run serve
```

## Type checking

Run the dashboard type check:

```bash
pnpm --filter @workspace/minesense-maintenance run typecheck
```

## GitHub publishing

From the project root:

```bash
git init
git add .
git commit -m "Add MineSense predictive maintenance prototype"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

The repository already ignores generated files, dependencies, IDE settings, and local Replit files through `.gitignore`.

## Project structure

```text
.
├── artifacts/
│   ├── minesense-maintenance/   # Main React dashboard
│   ├── api-server/               # Shared API scaffold for future real data
│   └── mockup-sandbox/           # Existing design preview scaffold
├── lib/
│   ├── api-client-react/         # Shared generated API client
│   ├── api-spec/                 # OpenAPI source
│   ├── api-zod/                  # Generated API validation types
│   └── db/                       # Database package scaffold
├── package.json
├── pnpm-lock.yaml
└── pnpm-workspace.yaml
```

## Future engineering improvements

1. Connect the dashboard to live PLC/SCADA or IoT sensor readings.
2. Store historical telemetry and maintenance records in PostgreSQL.
3. Train and validate an anomaly-detection model against labelled fault events.
4. Add remaining-useful-life prediction for each asset.
5. Add role-based maintenance approvals and audit history.
6. Connect alerts to email, SMS, or a maintenance-management system.
