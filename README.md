# Forge Masters Ascension Planner

Browser-based planner for Forge Masters clanmates. It turns the workbook into a faster, mobile-friendly calculator for summon ascension planning, remaining resource gaps, and ETA estimates.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Zustand persistence

## Features

- Pillar planner for `Skills`, `Pets`, and `Mount`
- Level-aware requirement calculation from any current level to 100
- Optional partial-progress handling inside the current level
- Modifier math for discount, extra drop, and both combined
- Income composition from dungeon, clan war, ranked league, clan milestones, and manual overrides
- Safe / minimum / optimal-reset target modes
- Bottleneck detection, ETA, readiness status, and copyable summary sentence
- Local persistence with `localStorage`

## Getting Started

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Workbook Extraction

Normalized data is generated from the provided workbook with:

```bash
npm run extract-data
```

The extraction script expects the workbook at:

`C:\Users\W11\Downloads\Forge Master.xlsx`

If that path changes, update `scripts/extract_workbook.py`.

## Data Files

Generated / maintained config lives in [`/src/data`](/D:/ForgeMasters-AscensionCalc/src/data):

- [`skills.json`](/D:/ForgeMasters-AscensionCalc/src/data/skills.json)
- [`pets.json`](/D:/ForgeMasters-AscensionCalc/src/data/pets.json)
- [`mounts.json`](/D:/ForgeMasters-AscensionCalc/src/data/mounts.json)
- [`forge.json`](/D:/ForgeMasters-AscensionCalc/src/data/forge.json)
- [`ascensionTargets.json`](/D:/ForgeMasters-AscensionCalc/src/data/ascensionTargets.json)
- [`clanWarRewards.json`](/D:/ForgeMasters-AscensionCalc/src/data/clanWarRewards.json)
- [`rankedLeagueRewards.json`](/D:/ForgeMasters-AscensionCalc/src/data/rankedLeagueRewards.json)
- [`individualClanRewards.json`](/D:/ForgeMasters-AscensionCalc/src/data/individualClanRewards.json)
- [`dungeonYieldConfig.json`](/D:/ForgeMasters-AscensionCalc/src/data/dungeonYieldConfig.json)
- [`appConfig.json`](/D:/ForgeMasters-AscensionCalc/src/data/appConfig.json)

## What Came Directly From The Workbook

- Level-by-level summon progression for skills, pets, and mounts
- Forge gold progression used for shared gold requirement
- Base ascension totals and max-tech totals from the `Ascension` sheet
- Safe reserve / legendary recovery values from the lower `Ascension` table
- Discount-plus-extra-drop behavior validated against `Discount and Extra Drop Final D`
- Clan war, ranked league, and individual clan reward values

## What Is Still Configurable / Assumed

- Dungeon yields are seeded as editable zero-value placeholders because workbook scaling is incomplete.
- `Safe ascend` and `Optimal reset` are modular config-driven targets, with `Optimal reset` currently matching `Safe ascend`.
- Reward-sheet row labels were not preserved cleanly in the workbook export. V1 maps the first four relevant reward rows into `gold`, `tickets`, `eggshells`, and `clockwinders`, while preserving source metadata so the mapping can be corrected without changing UI code.

## Important Formula Notes

- Effective multiplier: `(1 - discountPct) / (1 + extraDropPct)`
- Effective final discount: `1 - effectiveMultiplier`
- Final requirement uses `ceil` / round-up behavior
- If remaining amount is positive and daily income is `0`, ETA is reported as `N/A`

## Project Structure

- [`src/lib`](/D:/ForgeMasters-AscensionCalc/src/lib): pure calculator and formatting utilities
- [`src/store/plannerStore.ts`](/D:/ForgeMasters-AscensionCalc/src/store/plannerStore.ts): persisted planner state
- [`src/components`](/D:/ForgeMasters-AscensionCalc/src/components): planner panels and result tables
- [`scripts/extract_workbook.py`](/D:/ForgeMasters-AscensionCalc/scripts/extract_workbook.py): workbook normalization

## Verification

- `npm run build`
- Local dev server responded with HTTP `200` during smoke verification

## GitHub Workflow

Two workflows are included under [`.github/workflows`](/D:/ForgeMasters-AscensionCalc/.github/workflows):

- [`ci.yml`](/D:/ForgeMasters-AscensionCalc/.github/workflows/ci.yml): installs, lints, and builds on pushes and pull requests
- [`deploy-pages.yml`](/D:/ForgeMasters-AscensionCalc/.github/workflows/deploy-pages.yml): deploys the `dist` folder to GitHub Pages on pushes to `main`

Once this repo is pushed to GitHub:

1. Enable GitHub Pages for the repository.
2. Leave the source as `GitHub Actions`.
3. Push to `main` and the workflow will publish the app automatically.
