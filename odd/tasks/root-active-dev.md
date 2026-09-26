# Feature: root dev scripts target the active publication

Branch: `dev` (dirty WIP `package.json` repair included in this feature)
Decision date: 2026-09-26

## Goal

Root scripts must never hardcode a specific app (except `build`, which stays on
`@festivalarc/distribution`). `pnpm dev` / `pnpm start` resolve the **active
publication** from `editions.config.ts` at runtime and launch only that app,
through turbo (user decision). README and `docs/development.md` must match the
real behavior.

## Decisions (user-confirmed)

- Runner: turbo (`turbo run <task> --filter=<active pkg>`), not `pnpm -r`.
- Scope: only the active publication (currently `calls-2026`), not all apps.
- Ports: no pinning needed — single active app on default 4321; archives run
  separately via explicit `--filter` (Astro auto-increments on collision).
- `--filter` uses real package `name` values (`calls-2026`, …); renaming apps
  to `@festivalarc/*` scope is out of scope.

## Tasks

- [x] T1: Add `scripts/run-active.mjs` — plain-node import of
  `editions.config.ts`, read `active.packageName`, spawn
  `pnpm exec turbo run <task> --filter=<pkg>` with passthrough args.
  Fix applied during verification: strip a literal leading `--` from
  `process.argv.slice(3)` before re-adding the turbo delimiter (double `--`
  reached astro as `astro dev -- --help`).
- [x] T2: Repair root `package.json`: `dev`, `start`, `astro` → helper;
  `test:coverage` → `pnpm -r --if-present run test:coverage`; `build`
  untouched.
- [x] T3: Add `dev` / `start` (persistent, no cache) and `astro` (no cache)
  tasks to `turbo.json`.
- [x] T4: Update `README.md` — quick-commands table + intro paragraph
  (also fixes stale "archives for 2023 and 2024": 2025 also archived).
- [x] T5: Update `docs/development.md` — root-shortcut semantics, "wrong site"
  and port troubleshooting (Astro auto-increment claim was verified false).
  Extended to `docs/annual-publishing.md` (stale fixed-2025 claim + missing
  festival-2025 archive row) after repo-wide consistency grep.
- [x] T6: Verify without launching servers: turbo dry-runs for
  `dev`/`start`/`astro`, helper usage smoke, config-resolution smoke,
  JSON validity. Record evidence.

## Evidence

- Independent verify (gentle-ai-verify, 2 rounds):
  - changed-file scope OK (package.json, turbo.json, README.md,
    docs/development.md, docs/annual-publishing.md + new scripts/ and
    odd/tasks/root-active-dev.md); `git diff --check` clean
  - no self-referential script values remain in root package.json
  - `turbo --dry=json`: `calls-2026#dev`/`#start` persistent+cache false,
    `#astro` cache false; pre-existing tasks unchanged vs HEAD
  - helper usage → exit 1; `editions.config.ts` plain-node import →
    `calls-2026`; repo-wide grep: no fixed-2025 root-shortcut claims left
- Full chain `node scripts/run-active.mjs start -- --help` →
  `$ astro dev --help`, `Tasks: 1 successful`, no listener left on 4321.
- Note: `astro dev --help` intermittently slow to exit while another
  project's `turbo run test` was loading the machine; reproduced without
  our chain (pre-existing, unrelated).
