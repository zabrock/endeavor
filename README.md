# Endeavor — Retirement Projection (prototype)

This repository contains a small prototype for projecting retirement assets and inflation-adjusted expenses. It includes a pure TypeScript calculation module and unit tests. The project is scaffolded for an Electron + React app, but the core calculation is framework-agnostic and can be reused on web or mobile.

**Key files**
- `src/calc/projections.ts` — core projection API and helpers.
- `src/calc/__tests__/projections.test.ts` — Jest unit tests for the calculation logic.
- `package.json`, `tsconfig.json`, `jest.config.cjs` — build and test configuration.
- `.devcontainer/` — Devcontainer configuration for development.

Overview
--------
The core module exposes functions to simulate yearly balances with monthly contributions and monthly compounding, project future expenses with inflation, and detect the first year when assets meet a retirement threshold (e.g., withdrawal multiple like 25x).

Getting started (local)
-----------------------
1. Install dependencies:

```bash
npm install
```

2. Run the unit tests:

```bash
npm test
```

3. Build the TypeScript output:

```bash
npm run build
```

4. Build the UI:

```bash
npm run ui:build
```

5. Run the UI in development mode:

```bash
npm run dev
```

This starts the Vite dev server for the React UI and launches Electron. The app should open with a form to input projection parameters and display a chart.

For production build:

```bash
npm run start
```

This builds everything and runs the packaged app.

Quick example (after build)
---------------------------
You can run a quick Node one-liner against the compiled output in `dist` (CommonJS):

```bash
# build first
npm run build

node -e "const {projectBalancesAndExpenses}=require('./dist/calc/projections'); console.log(projectBalancesAndExpenses({currentBalance:10000,annualRate:0.06,monthlyContribution:200,years:5}));"
```

Devcontainer
------------
Open the repository in VS Code and use `Remote-Containers: Reopen in Container`. The container will provide Node/TypeScript tooling matching the Dockerfile in `.devcontainer`. Inside the container you can run the same commands above.

Notes on implementation
-----------------------
- The calculation engine in `src/calc/projections.ts` is pure TypeScript and avoids Node-only APIs so it can be built for browser or bundled into mobile apps.
- Monthly contributions are simulated month-by-month with monthly compounding using `annualRate / 12` as the monthly rate.
- Inflation is applied to the current monthly expense to compute future annual expense.
- The retirement check compares `balance` to `annualExpense * withdrawalMultiple` and returns the first matching year.
- The UI is a React app with Plotly.js for charts, wrapped in Electron for desktop.

Next steps / ideas
------------------
- Add CSV export and import helpers for projection data.
- Add an example CLI script that generates CSV output for quick analysis.
- Add packaging (Electron build) and native installers.
