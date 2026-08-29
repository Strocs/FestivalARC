# FestivalARC Project Context

## Repository

FestivalARC is a pnpm-managed Astro 5 static site using TypeScript ESM, React islands, Tailwind CSS 4, Astro sitemap, and the Vercel adapter. The current repository is the 2025 site and is not yet a monorepo.

Detected markers: `package.json`, `astro.config.mjs`, `tsconfig.json`, `playwright.config.ts`, `vitest.config.ts`, `AGENTS.md`.

## Commands

- Development: `pnpm dev`
- Build: `pnpm build` (`astro check && astro build`)
- Type check: `pnpm type` (`tsc --noEmit`)
- Unit/integration tests: `pnpm test` (Vitest and Testing Library)
- Coverage: `pnpm run test:coverage`
- E2E: `pnpm run test:e2e` (Playwright)
- E2E configuration: `playwright.config.ts`, Firefox and WebKit projects, `pnpm run dev` web server on port 4321

## Conventions

Use feature-based organization under `src/features/*`, `@/` imports, single quotes, no semicolons, two-space indentation, explicit TypeScript types, functional React components, `.astro` for pages/layouts, `.tsx` for interactive components, and tests in `__tests__/` directories. Run `pnpm build` before committing.

## SDD Configuration

Strict TDD is disabled. Standard testing remains available, but the RED/GREEN/TRIANGULATE/REFACTOR lifecycle is not required. SDD rules require problem statements in proposals, acceptance criteria in specs, tradeoffs in designs, review-workload protection in tasks, and `pnpm test` for apply/verify.

## Current SDD Direction

The recovered architecture context proposes a future pnpm-workspaces/Turborepo monorepo with independent Astro apps per final edition, a temporary 2026 call app, shared data/configuration packages (not shared UI), and a deterministic static distribution compositor publishing the active edition at `/` and archives under `/ediciones/YYYY`. This initialization does not implement that migration.

## Repository State and Constraints

Pre-existing user changes must remain untouched: modified `.gitignore` and untracked `refs/`. The working tree also contains untracked `.pi/` and `openspec/` initialization artifacts; these were observed during initialization and were not modified except for the non-destructive derived SDD configuration/context updates described here. Existing OpenSpec directories include `openspec/changes/archive` and `openspec/specs`; no active change artifacts were found.

The recovered handoff stated that `openspec/` had not yet been created. Current state conflicts with that statement: `openspec/config.yaml` and the OpenSpec directory structure already exist. The existing configuration was preserved and only its derived stack/testing context was completed.
