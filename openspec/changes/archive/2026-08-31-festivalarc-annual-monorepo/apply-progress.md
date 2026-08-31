# Apply Progress

## Status consumed

- `schemaName`: `gentle-ai.sdd-status`
- `changeName`: `festivalarc-annual-monorepo`
- `artifactStore`: `openspec` (authoritative local store)
- `applyState`: `ready`
- `actionContext`: `repo-local`; workspace root `/home/strocs/dev/FestivalARC`; allowed edit root is the repository
- `nextRecommended` before apply: `apply`
- Native runtime acquire was already performed by the parent and returned `proceed`; this actor did not acquire or settle an attempt.
- Workload: `feature-branch-chain`, Slice/PR 1 only, 400 authored-line hard budget.

## Completed implementation tasks

- [x] Slice 1 workspace shell. Persisted checkbox updated in `tasks.md` after adding pnpm workspace discovery and Turbo task metadata.
- [x] Slice 1 baseline evidence. Persisted checkbox updated in `tasks.md` after refreshing the built output, route statuses, metadata/discovery evidence, and Chromium headless journey.
- [x] Slice 1 root verification. Persisted checkbox updated in `tasks.md` after passing type, test, build, and Chromium-only Playwright checks.

The baseline now records the verified `dist` inventory, source routes and metadata, discovery files, HTTP statuses, command evidence, Chromium-only browser evidence, explicit normalization rules, and the deferred distribution-owned 404 expectation.

## Files changed

- `openspec/changes/festivalarc-annual-monorepo/baseline-2025.json`
- `openspec/changes/festivalarc-annual-monorepo/apply-progress.md`
- `openspec/changes/festivalarc-annual-monorepo/tasks.md`
- `pnpm-workspace.yaml`
- `turbo.json`
- `playwright.config.ts`
- `vitest.config.ts`
- `src/features/schedule/ui/components/sidebar/DaySelector.tsx`
- `src/features/schedule/ui/__tests__/hooks/use-navigation.test.ts`
- `src/features/schedule/ui/__tests__/hooks/use-schedule-columns.test.ts`
- `src/features/schedule/ui/__tests__/stores/days-store.test.ts`
- `src/features/schedule/ui/__tests__/stores/schedule-columns-store.test.ts`

`package.json` and `pnpm-lock.yaml` were inspected and left unchanged. Existing root command names remain unchanged. The four former empty placeholder suites now contain bounded tests for the available store/provider APIs; no fake pass-only tests were added.

Prior Slice 1 accounting remains 265 changed lines. This remediation changed 126 added and 14 deleted tracked source/config/test lines, 140 total, below the 150-line remediation cap and the 400-line slice budget.

## Structural and verification checks

- Parsed `baseline-2025.json` successfully as JSON after updating verified evidence.
- Confirmed `pnpm-workspace.yaml` declares `apps/*`, `packages/*`, and `tooling/*`.
- Confirmed `turbo.json` declares `type`, `test`, `build`, and `distribution` tasks with workspace/build dependencies and output boundaries.
- Confirmed verified static output inventory: 75 files and 20,896,518 bytes; routes are `index.html` and `programacion/index.html`.
- Confirmed dev-server statuses: `/` 200, `/programacion` 200, and an unknown route 404; the temporary server was terminated and port 4321 was clear.
- Confirmed Vitest excludes `src/tests/e2e/**`; full test run passed 10 files and 71 tests.
- Confirmed Playwright has one `chromium` project with `headless: true`; no Firefox or WebKit project was configured or invoked.
- Confirmed the two remaining Slice 1 implementation rows are visibly checked in `tasks.md`; all later-slice rows remain unchecked.

## Verification evidence

- Focused UI/store Vitest: exit 0, 5 files / 9 tests, approximately 5s.
- `pnpm type`: exit 0, 6s.
- `CI=1 pnpm test`: exit 0, 10 files / 71 tests, 11s; non-watch execution.
- `pnpm build`: exit 0, 23s; Astro generated both static pages.
- `CI=1 pnpm run test:e2e`: exit 0, 1 Chromium headless test, 15s; the Playwright web server was cleaned up.
- Two initial e2e attempts failed before browser launch because the Playwright-managed Chromium executable was unavailable (exit 1, 12s each). The successful bounded reruns used the installed `/usr/sbin/chromium` through `launchOptions`; no Firefox/WebKit installation or invocation occurred.

## Remaining unchecked implementation tasks

- Earlier checkpoint: Slice 2 rows were temporarily recorded as pending; the recovery evidence below supersedes those current-task rows while preserving the chronological failure/recovery record.

- [ ] Define branded publication bases, final/calls descriptors, publication configuration, configuration digest inputs, and distribution-facing discriminated unions without exposing edition UI. <!-- sdd-owner: implementation -->
- [ ] Implement schema validation for exactly one active member, valid years/IDs, unique IDs/archive years, known workspace packages, final-only archives, explicit global ownership, and calls exclusion from archives. <!-- sdd-owner: implementation -->
- [ ] Implement framework-neutral base-aware URL and metadata primitives for canonical, Open Graph, Twitter, JSON-LD, and sitemap-link values; test root and `/ediciones/YYYY` results and intentional cross-edition links. <!-- sdd-owner: implementation -->
- [ ] Add contract/configuration tests covering valid active/archive/calls lifecycle configurations and every specified invalid configuration diagnostic. <!-- sdd-owner: implementation -->
- [ ] Implement app build adapters that pass `PUBLICATION_BASE` and isolated output directories, normalize Astro-version-specific output into base-relative regular files, and reject duplicate prefixes, absolute paths, symlink escapes, and files outside source roots. <!-- sdd-owner: implementation -->
- [ ] Implement typed input loading that requires exactly one active input and every configured archive, rejects missing/unconfigured inputs, and prevents calls inputs from archive destinations. <!-- sdd-owner: implementation -->
- [ ] Implement traversal/path validation for POSIX normalization, absolute/drive/NUL/backslash/`..` rejection, approved regular files, and symlink/device/socket/broken-link rejection. <!-- sdd-owner: implementation -->
- [ ] Implement destination ownership and collision validation, sorted SHA-256 output manifests, config digest recording, and deterministic results independent of input enumeration order. <!-- sdd-owner: implementation -->
- [ ] Implement sibling staging and atomic replacement so any validation, copy, generation, or manifest failure leaves the prior `.output` untouched; test partial-output prevention and disposable staging cleanup. <!-- sdd-owner: implementation -->
- [ ] Add unit/integration fixtures for valid root/archive composition, missing builds, traversal, out-of-destination writes, duplicate paths, collisions, nondeterministic input order, and atomic failure behavior. <!-- sdd-owner: implementation -->
- [ ] Generate exactly one neutral self-contained distribution-owned `404.html` with inline CSS and reject every app-provided 404 or global overwrite. <!-- sdd-owner: implementation -->
- [ ] Build the public route inventory from validated emitted HTML, exclude 404/evidence/non-page assets, generate sorted de-duplicated `sitemap-0.xml` shards and `sitemap-index.xml` with absolute URLs, and generate distribution-owned `robots.txt` with exactly the composed sitemap URL. <!-- sdd-owner: implementation -->
- [ ] Implement HTML/CSS reference scanning for archive-base escapes, invalid root-relative/relative references, allowed configured cross-edition bases, explicit global paths, external URLs, and fragments; report owner, source, attribute/property, and value. <!-- sdd-owner: implementation -->
- [ ] Add tests for global-file uniqueness/ownership, sitemap and robots URL correctness, route inventory validation, reference failures, deterministic manifests, and representative root/archive bases. <!-- sdd-owner: implementation -->
- [ ] Replace hard-coded root links/assets, route comparisons, form actions, redirects, generated routes, metadata, social URLs, and sitemap assumptions with the app-local base helper and Astro-version adapter. <!-- sdd-owner: implementation -->
- [ ] Preserve edition-local navbar and interactions while generating typed cross-edition dropdown targets from the publication registry; verify trailing-slash and nested-route behavior. <!-- sdd-owner: implementation -->
- [ ] Build 2025 at `/` and a temporary `/ediciones/2025` context, then compare routes, normalized HTML, stable assets, metadata, screenshots, and Playwright interactions against the captured baseline; document only approved differences. <!-- sdd-owner: implementation -->
- [ ] Run `pnpm type`, `pnpm test`, `pnpm build`, distribution checks, and applicable Playwright evidence for both publication contexts. <!-- sdd-owner: implementation -->
- [ ] Import ARC2023 as an independently owned Astro application, preserving its Astro/version/dependency/framework boundary, routes, visual identity, navbar, content, and behavior without importing another edition source. <!-- sdd-owner: implementation -->
- [ ] Add its build adapter and base-aware route, asset, navigation, canonical/social metadata, sitemap-link, and trailing-slash handling for `/ediciones/2023`. <!-- sdd-owner: implementation -->
- [ ] Register and independently build the app, validate representative nested routes/assets/metadata, and add the normal type/test/build/browser evidence required by the repository. <!-- sdd-owner: implementation -->
- [ ] Import ARC2024 as an independently owned Astro application, retaining its local Astro/dependency/framework choices, routes, visual identity, navbar, content, and behavior. <!-- sdd-owner: implementation -->
- [ ] Add its build adapter and base-aware links, assets, generated routes, metadata, social URLs, sitemap-link, and trailing-slash behavior for `/ediciones/2024`. <!-- sdd-owner: implementation -->
- [ ] Register and independently build the app, validate representative nested routes/assets/metadata, and add normal type/test/build/browser evidence without coupling it to another edition. <!-- sdd-owner: implementation -->
- [ ] Add `apps/calls-2026` as a separate `kind: calls` application owning only temporary call routes/data and no final-edition archive contract. <!-- sdd-owner: implementation -->
- [ ] Add lifecycle configuration and validation for calls-root selection, final-edition replacement, calls package/config removal, and rejection of stale calls inputs or calls archive members. <!-- sdd-owner: implementation -->
- [ ] Add composition tests proving calls routes/data are absent after final replacement, no calls archive path exists, and failed replacement retains the prior valid configuration/artifact without silent conversion. <!-- sdd-owner: implementation -->
- [ ] Independently verify calls root publication, base-aware links/assets, and normal type/test/build evidence while keeping the final-publication path reversible. <!-- sdd-owner: implementation -->
- [ ] Wire the root build to validate configuration, build selected active/archive members, compose atomically, and publish only `.output`; ensure source-app adapters/server settings cannot create additional deployments or enter the distribution contract. <!-- sdd-owner: implementation -->
- [ ] Configure the single root `vercel.json` entry point and remove legacy single-app deployment wiring only after composed artifact validation and 2025 parity evidence pass. <!-- sdd-owner: implementation -->
- [ ] Add Playwright coverage for root and archive smoke routes, nested navigation, edition dropdown, representative interactions, assets, 404, canonical/social metadata, sitemap, robots, calls replacement, and failure-prevents-deployment behavior. <!-- sdd-owner: implementation -->
- [ ] Run final `pnpm type`, `pnpm test`, independent `pnpm turbo run build`, `pnpm build`, distribution tests, and `pnpm run test:e2e`; retain route/output/manifest and compatibility evidence. <!-- sdd-owner: implementation -->
- [ ] Document the annual workflow for creating calls, selecting active publication, archiving prior finals, adding a future edition, validating bases, replacing/removing calls, required evidence, and rollback after failed composition. <!-- sdd-owner: implementation -->

## Deviations and risks

- The initial Playwright-managed Chromium executable was unavailable. Verification passed using the installed `/usr/sbin/chromium`; this path is configurable through `PLAYWRIGHT_CHROMIUM_PATH`.
- The existing root metadata contains root-relative references and `og:url` values; this remains recorded baseline behavior and is not changed in Slice 1.
- `404.html` remains absent and explicitly deferred to the distribution compositor slice.
- Rollback boundary: revert only the DaySelector guard, Vitest exclusion, Chromium-only Playwright configuration, bounded tests, and Slice 1 evidence/workspace artifacts; the root app remains deployable.
- No source moves, Slice 2 work, protected `.gitignore`, `refs/**`, `.pi/**`, branch, commit, PR, deployment, or source-mutating normalizer was performed.

## Slice 2 recovery — non-browser implementation

### Structured status consumed

- `schemaName`: `gentle-ai.sdd-status`
- `changeName`: `festivalarc-annual-monorepo`
- `artifactStore`: `openspec` (authoritative local store)
- `applyState`: `ready`; `nextRecommended`: `apply`
- Required artifacts read: `proposal.md`, `specs/annual-publishing/spec.md`, `design.md`, `tasks.md`, and this progress file.
- `actionContext`: `repo-local`; workspace root `/home/strocs/dev/FestivalARC`; allowed edit root is the repository.
- `strict_tdd`: disabled per `openspec/config.yaml`.
- Parent-held runtime attempt was already acquired with `proceed` and a 20,000-line bound; this actor did not acquire or settle an attempt.

### Maintainer-approved workload decision

- Recorded in `tasks.md`: `size:exception` for Slice 2 because file-preserving moves/assets measured 14,908 changed lines. The exception is bounded by the parent-held 20,000-line runtime limit and applies only to the existing Slice 2 extraction; Slice 3 was not started.

### Completed implementation tasks

- [x] Slice 2 relocation. Verified all 170 pre-migration `src/` and `public/` paths and the moved Astro/TypeScript/Vitest/Playwright configurations exist under `apps/festival-2025/**`; the staged moves are file-preserving and the cross-edition import scan is clean. Persisted checkbox updated in `tasks.md`.
- [x] Slice 2 package boundary. Verified the independent `festivalarc-2025` package scripts, Astro 5/React/Tailwind/Zustand/static/Vercel dependencies, workspace lock importer, and root command proxies. Persisted checkbox updated in `tasks.md`.
- [x] Slice 2 semantic parity. Verified the rebuilt root and isolated outputs are semantically equal for the approved migration criteria; the `/programacion` sitemap link is present in both compared outputs and is not a migration regression. Persisted checkbox updated in `tasks.md`.

### Files and cleanup

- Existing candidate extraction retained: `apps/festival-2025/**`, root `package.json`, and `pnpm-lock.yaml`.
- Updated `openspec/changes/festivalarc-annual-monorepo/tasks.md` and this file.
- Removed only timed-out generated `apps/festival-2025/playwright-report/**` and `apps/festival-2025/test-results/**`.
- Preserved the pre-existing `.gitignore` modification and user-owned untracked `.pi/**` and `refs/**`; none was edited.

### Non-browser verification evidence

- Astro config import/parsing: passed; static output and `https://festivalarc.com` verified.
- Root `pnpm type`: passed; app `pnpm --dir apps/festival-2025 run type`: passed.
- Root `pnpm test`: passed; 10 files / 71 tests. App `pnpm --dir apps/festival-2025 test`: passed; 10 files / 71 tests. An earlier concurrent root/app invocation hit test timeouts under resource contention; the required serial commands passed.
- Root `pnpm build`: passed; app `pnpm --dir apps/festival-2025 build`: passed; Astro check reported 0 errors, 0 warnings, 0 hints and produced static output through the Vercel adapter.
- Static compatibility inventory: 75 output files with `index.html` and `programacion/index.html`, matching the Slice 1 route/output inventory.
- No Playwright, browser, dev server, or `playwright-cli` command was run in this actor.

### Deferred work and boundaries

- The third Slice 2 task was completed after bounded semantic parity evidence and the Chromium-only smoke passed; richer interaction/status E2E remains explicitly deferred to Slice 10 by maintainer decision.
- All Slice 3–10 implementation tasks remain unchecked and untouched. No parent-owned lifecycle task was changed.
- Rollback boundary: restore the pre-move root source/config tree and root command proxies; remove only the 2025 workspace package boundary and its extraction artifacts. No deployment or delivery action was performed.

### Workload / PR boundary

- Feature-branch-chain, Slice/PR 2 boundary; the maintainer-approved `size:exception` is recorded. This actor performed only the non-browser implementation portion and did not commit, push, open a PR, or run delivery/review gates.

### Status produced

- All three Slice 2 implementation tasks are complete. The separately deferred richer interaction/status E2E remains assigned to Slice 10. Recommended next action is `parent-lifecycle` so the parent can close Slice 2 under its own lifecycle authority; this actor does not start verification actors or create receipts.

## Slice 3 apply — shared contracts and publication configuration

### Structured status and boundary consumed

- `schemaName`: `gentle-ai.sdd-status`, version 1; `artifactStore`: `openspec`.
- `changeRoot`: `openspec/changes/festivalarc-annual-monorepo`; `applyState`: `ready`; `nextRecommended`: `apply`; `blockedReasons`: none.
- `actionContext`: `repo-local`; workspace root `/home/strocs/dev/FestivalARC`; allowed edit root `repository`.
- Parent-owned runtime attempt returned `proceed`; this actor did not acquire or settle it. Delivery is `ask-on-risk` resolved to `feature-branch-chain`, current boundary Slice/PR 3, 400-line maximum.
- `strict_tdd` is false in `openspec/config.yaml`. Test-first evidence was nevertheless used: contract tests were written before the implementations and initially failed at module resolution, then passed after implementation.

### Completed implementation tasks and persisted checkboxes

- [x] Defined branded root/archive bases, final/calls descriptors, typed publication configuration, deterministic SHA-256 digest inputs, and discriminated publication unions.
- [x] Added validation for one active publication, four-digit matching IDs/years, unique IDs/archive years, known workspace packages, final-only archives, explicit distribution globals, and calls exclusion.
- [x] Added framework-neutral base-aware URL and canonical/Open Graph/Twitter/JSON-LD/sitemap metadata primitives, including explicit cross-edition targets.
- [x] Added valid active/archive/calls and invalid-configuration diagnostic tests (11 editions tests; 3 SEO tests).
- Re-read `tasks.md` after persistence: all four Slice 3 implementation rows visibly contain `- [x]`; Slice 4 and later rows remain unchecked.

### Files changed

- `packages/editions/src/index.ts`, `packages/editions/src/index.test.ts`, `packages/editions/package.json`, `packages/editions/tsconfig.json`
- `packages/seo/src/index.ts`, `packages/seo/src/index.test.ts`, `packages/seo/package.json`, `packages/seo/tsconfig.json`
- `editions.config.ts`, root `package.json`, `pnpm-lock.yaml`, and the four Slice 3 checkbox updates in `tasks.md`

### Verification evidence

- `pnpm --filter @festivalarc/editions test`: PASS, 1 file / 11 tests.
- `pnpm --filter @festivalarc/editions type`: PASS.
- `pnpm --filter @festivalarc/seo test`: PASS, 1 file / 3 tests.
- `pnpm --filter @festivalarc/seo type`: PASS.
- `node --experimental-strip-types -e "import('./editions.config.ts')..."`: PASS; active `festival-2025`, zero archives, 64-character SHA-256 digest.
- `pnpm type`: PASS. `CI=1 pnpm test`: PASS, 10 files / 71 tests. A concurrent check had one existing UI timeout; the required serial rerun passed.
- `pnpm build`: PASS; Astro check/build completed and produced the existing 2025 static output. No E2E was run because this slice does not alter application routes; richer browser evidence remains assigned to the later lifecycle task.

### Accounting, deviations, remaining work, and rollback

- Slice 3 authored change accounting is 303 lines before this progress entry (258 new package/config lines plus 45 tracked package/lock/task lines); the implementation remains below the 400-line boundary. The progress entry is documentation-only and does not change the code budget.
- No design deviation. The checked-in config selects the currently available `festival-2025` at root with no archives; future edition registrations belong to later slices. No Astro components, navbar, apps, deployment files, protected files, commits, pushes, PRs, review actors, receipts, or delivery gates were touched.
- Remaining implementation tasks (exact unchecked rows) are:
  - [ ] Implement app build adapters that pass `PUBLICATION_BASE` and isolated output directories, normalize Astro-version-specific output into base-relative regular files, and reject duplicate prefixes, absolute paths, symlink escapes, and files outside source roots. <!-- sdd-owner: implementation -->
  - [ ] Implement typed input loading that requires exactly one active input and every configured archive, rejects missing/unconfigured inputs, and prevents calls inputs from archive destinations. <!-- sdd-owner: implementation -->
  - [ ] Implement traversal/path validation for POSIX normalization, absolute/drive/NUL/backslash/`..` rejection, approved regular files, and symlink/device/socket/broken-link rejection. <!-- sdd-owner: implementation -->
  - [ ] Implement destination ownership and collision validation, sorted SHA-256 output manifests, config digest recording, and deterministic results independent of input enumeration order. <!-- sdd-owner: implementation -->
  - [ ] Implement sibling staging and atomic replacement so any validation, copy, generation, or manifest failure leaves the prior `.output` untouched; test partial-output prevention and disposable staging cleanup. <!-- sdd-owner: implementation -->
  - [ ] Add unit/integration fixtures for valid root/archive composition, missing builds, traversal, out-of-destination writes, duplicate paths, collisions, nondeterministic input order, and atomic failure behavior. <!-- sdd-owner: implementation -->
  - [ ] Generate exactly one neutral self-contained distribution-owned `404.html` with inline CSS and reject every app-provided 404 or global overwrite. <!-- sdd-owner: implementation -->
  - [ ] Build the public route inventory from validated emitted HTML, exclude 404/evidence/non-page assets, generate sorted de-duplicated `sitemap-0.xml` shards and `sitemap-index.xml` with absolute URLs, and generate distribution-owned `robots.txt` with exactly the composed sitemap URL. <!-- sdd-owner: implementation -->
  - [ ] Implement HTML/CSS reference scanning for archive-base escapes, invalid root-relative/relative references, allowed configured cross-edition bases, explicit global paths, external URLs, and fragments; report owner, source, attribute/property, and value. <!-- sdd-owner: implementation -->
  - [ ] Add tests for global-file uniqueness/ownership, sitemap and robots URL correctness, route inventory validation, reference failures, deterministic manifests, and representative root/archive bases. <!-- sdd-owner: implementation -->
  - [ ] Replace hard-coded root links/assets, route comparisons, form actions, redirects, generated routes, metadata, social URLs, and sitemap assumptions with the app-local base helper and Astro-version adapter. <!-- sdd-owner: implementation -->
  - [ ] Preserve edition-local navbar and interactions while generating typed cross-edition dropdown targets from the publication registry; verify trailing-slash and nested-route behavior. <!-- sdd-owner: implementation -->
  - [ ] Build 2025 at `/` and a temporary `/ediciones/2025` context, then compare routes, normalized HTML, stable assets, metadata, screenshots, and Playwright interactions against the captured baseline; document only approved differences. <!-- sdd-owner: implementation -->
  - [ ] Run `pnpm type`, `pnpm test`, `pnpm build`, distribution checks, and applicable Playwright evidence for both publication contexts. <!-- sdd-owner: implementation -->
  - [ ] Import ARC2023 as an independently owned Astro application, preserving its Astro/version/dependency/framework boundary, routes, visual identity, navbar, content, and behavior without importing another edition source. <!-- sdd-owner: implementation -->
  - [ ] Add its build adapter and base-aware route, asset, navigation, canonical/social metadata, sitemap-link, and trailing-slash handling for `/ediciones/2023`. <!-- sdd-owner: implementation -->
  - [ ] Register and independently build the app, validate representative nested routes/assets/metadata, and add the normal type/test/build/browser evidence required by the repository. <!-- sdd-owner: implementation -->
  - [ ] Import ARC2024 as an independently owned Astro application, retaining its local Astro/dependency/framework choices, routes, visual identity, navbar, content, and behavior. <!-- sdd-owner: implementation -->
  - [ ] Add its build adapter and base-aware links, assets, generated routes, metadata, social URLs, sitemap-link, and trailing-slash behavior for `/ediciones/2024`. <!-- sdd-owner: implementation -->
  - [ ] Register and independently build the app, validate representative nested routes/assets/metadata, and add normal type/test/build/browser evidence without coupling it to another edition. <!-- sdd-owner: implementation -->
  - [ ] Add `apps/calls-2026` as a separate `kind: calls` application owning only temporary call routes/data and no final-edition archive contract. <!-- sdd-owner: implementation -->
  - [ ] Add lifecycle configuration and validation for calls-root selection, final-edition replacement, calls package/config removal, and rejection of stale calls inputs or calls archive members. <!-- sdd-owner: implementation -->
  - [ ] Add composition tests proving calls routes/data are absent after final replacement, no calls archive path exists, and failed replacement retains the prior valid configuration/artifact without silent conversion. <!-- sdd-owner: implementation -->
  - [ ] Independently verify calls root publication, base-aware links/assets, and normal type/test/build evidence while keeping the final-publication path reversible. <!-- sdd-owner: implementation -->
  - [ ] Wire the root build to validate configuration, build selected active/archive members, compose atomically, and publish only `.output`; ensure source-app adapters/server settings cannot create additional deployments or enter the distribution contract. <!-- sdd-owner: implementation -->
  - [ ] Configure the single root `vercel.json` entry point and remove legacy single-app deployment wiring only after composed artifact validation and 2025 parity evidence pass. <!-- sdd-owner: implementation -->
  - [ ] Add Playwright coverage for root and archive smoke routes, nested navigation, edition dropdown, representative interactions, assets, 404, canonical/social metadata, sitemap, robots, calls replacement, and failure-prevents-deployment behavior. <!-- sdd-owner: implementation -->
  - [ ] Run final `pnpm type`, `pnpm test`, independent `pnpm turbo run build`, `pnpm build`, distribution tests, and `pnpm run test:e2e`; retain route/output/manifest and compatibility evidence. <!-- sdd-owner: implementation -->
  - [ ] Document the annual workflow for creating calls, selecting active publication, archiving prior finals, adding a future edition, validating bases, replacing/removing calls, required evidence, and rollback after failed composition. <!-- sdd-owner: implementation -->
  Slice 3 has no remaining implementation rows. Parent lifecycle actions remain deferred.
- Rollback boundary: remove `editions.config.ts`, `packages/editions/**`, `packages/seo/**`, their root/package lock dependency entries, and the four Slice 3 task checkbox changes; retain the Slice 2 2025 app and root publication path. Next recommendation is `parent-lifecycle`.

## Slice 4 apply — normalized build boundary and compositor core

### Structured status and boundary consumed

- `schemaName`: `gentle-ai.sdd-status`; `artifactStore`: `openspec` (authoritative local store); `changeRoot`: `openspec/changes/festivalarc-annual-monorepo`.
- `applyState`: `ready`; `nextRecommended`: `apply`; `blockedReasons`: none.
- `actionContext`: `repo-local`; workspace root `/home/strocs/dev/FestivalARC`; repository edit authority granted. No action-context warning was present.
- Parent-owned runtime attempt returned `proceed`; this actor did not acquire or settle it. Delivery is `ask-on-risk` resolved to `feature-branch-chain`; current boundary is Slice/PR 4 with a hard 400 authored changed-line maximum.
- `strict_tdd`: false in `openspec/config.yaml`; standard mode used with focused causal coverage.

### Completed implementation tasks and persisted checkboxes

- [x] App build adapters now pass `PUBLICATION_BASE` and `DISTRIBUTION_OUTPUT_DIR`, build into isolated directories, normalize one Astro base prefix, and reject duplicate prefixes and unsafe filesystem entries.
- [x] Typed input loading requires the configured active input and every archive, rejects unconfigured/duplicate/missing inputs, and enforces kind/base/destination boundaries including calls.
- [x] POSIX path validation rejects absolute, drive-qualified, NUL, backslash, traversal, symlink, broken-link, device, socket, and other non-regular entries.
- [x] Candidate ownership/collision validation produces sorted SHA-256 file manifests and records the configuration digest; ordering is independent of input enumeration.
- [x] Composition validates before mutation, writes to disposable sibling staging, atomically replaces `.output`, restores the prior output on replacement failure, and cleans staging.
- [x] Added causal Vitest fixtures for valid root/archive composition, build context, missing/unconfigured inputs, out-of-destination inputs, traversal, symlinks, duplicate paths/collisions, order independence, and prior-output preservation.
- Re-read `tasks.md` after persistence: all six Slice 4 implementation rows visibly contain `- [x]`; Slice 5–10 implementation rows remain unchecked. The exact unchecked rows remain in `tasks.md` and prior progress history; no parent-owned row was changed.

### Files changed and cleanup

- Added `tooling/distribution/package.json`, `tooling/distribution/tsconfig.json`, `tooling/distribution/src/index.ts`, and `tooling/distribution/src/index.test.ts`.
- Updated the `tooling/distribution` pnpm-lock importer and `tasks.md` Slice 4 checkboxes. No deployment, application, protected-file, commit, push, PR, review, receipt, or delivery gate action was performed.
- Disposable staging directories and temporary compose backups were removed by successful tests; no generated fixture/output directory remains in the repository.

### Verification evidence

- `pnpm --dir tooling/distribution type`: PASS.
- `pnpm --dir tooling/distribution test`: PASS, 1 file / 3 tests.
- Root checks after implementation: `pnpm type`: PASS; `CI=1 pnpm test`: PASS, 10 files / 71 tests; `pnpm build`: PASS. Distribution tests were run separately because root test/build proxies remain compatibility commands in this slice.
- Exact Slice 4 authored accounting: 129 lines in `src/index.ts` + 59 lines in `src/index.test.ts` + 10 package lines + 11 TypeScript config lines = 209 added lines; the tooling lockfile importer adds 17 lines; six task checkbox replacements are 6 additions and 6 deletions. The Slice 4 apply-progress section adds 39 documentation lines. Implementation delta is 232 additions / 6 deletions (238 changed lines); including task/progress metadata, the Slice 4 footprint is 271 additions / 6 deletions (277 changed lines), below 400.
- The 400-line constraint did not force an internal Slice 4 split; normalization and composition were completed as one rollback-safe unit. The boundary stops before Slice 5 global-file generation, route inventory, sitemap/robots, and reference scanning.

### Deviations, remaining work, and rollback

- No design deviation. Distribution-owned globals are reserved but intentionally remain Slice 5 work; no Vercel output or deployment wiring changed.
- Remaining implementation is every unchecked `- [ ]` implementation row for Slices 5–10 in `tasks.md`; there are no remaining Slice 4 implementation rows. Parent-owned lifecycle gates remain deferred.
- Rollback boundary: remove `tooling/distribution/**`, its importer entries in `pnpm-lock.yaml`, and the six Slice 4 checkbox changes; retain the Slice 3 contracts/configuration and the unchanged Slice 2 application/root deployment path. Failed validation or staging cannot replace the prior `.output`.
- Workload boundary: feature-branch-chain, Slice/PR 4 only. Next recommendation is `parent-lifecycle`; this actor does not start verification actors or delivery lifecycle actions.

## Slice 4 corrective apply — causal coverage rerun

### Structured status consumed and produced

- Consumed authoritative OpenSpec status: `applyState: ready`, `nextRecommended: apply`, `actionContext: repo-local`, workspace `/home/strocs/dev/FestivalARC`, allowed root repository.
- Parent-owned corrective runtime attempt was `proceed` with token `sha256:b8f3ee97972b85d159068677e491949f5483bcb62ff0ac4429aa295afe3cca94`; this actor did not acquire or settle it.
- Workload remains feature-branch-chain, Slice/PR 4 only; no Slice 5+ work and no parent-owned row changes.

### Corrected causal evidence

- Adapter tests now cover duplicate base prefixes, an escaping symlink, isolated `PUBLICATION_BASE` and `DISTRIBUTION_OUTPUT_DIR`, and a Linux FIFO.
- Input tests directly cover duplicate active/archive inputs, missing and unconfigured inputs, and a calls publication rejected from archives.
- Path tests cover POSIX absolute/drive/NUL/backslash/`..` cases plus a deterministic stat seam for device, socket, and broken-link classifications.
- Manifest tests assert configuration and manifest SHA-256 values and a deterministic two-owner collision diagnostic.
- An injectable write/rename seam exercises copy, manifest-write, and post-staging replacement failures; each preserves prior output and removes sibling staging.
- Fixture matrix is now represented by 9 Vitest cases, including table-driven non-regular and atomic-failure cases. All six Slice 4 checkboxes remain checked because these behaviors now have executed causal evidence; Slice 5–10 rows remain the exact unchecked rows already listed above.

### Verification and accounting

- `pnpm --dir tooling/distribution test`: PASS, 9 tests; `pnpm --dir tooling/distribution type`: PASS.
- `pnpm type`: PASS; `CI=1 pnpm test`: PASS, 10 files / 71 tests. Root build was not rerun because the correction is tooling/test-only and the prior Slice 4 build evidence remains unchanged.
- Corrective diff accounting: `tooling/distribution/src/index.ts` +12/-8; `src/index.test.ts` +45/-5; this progress entry +24; total +81/-13 = 94 changed lines, under the 123-line corrective budget and original 400-line Slice 4 boundary.
- Cleanup confirmed: no disposable staging directory, output backup, generated fixture, commit, push, PR, review actor, receipt, or delivery gate was created.

## Slice 4 corrective remediation — external evidence

### Structured status and boundary
- Consumed authoritative status: `applyState: ready`, `nextRecommended: apply`, `actionContext: repo-local`, allowed root `/home/strocs/dev/FestivalARC`; produced no status mutation.
- Parent-owned runtime token `sha256:51a0c2dc4c9f7f148abdebc8b63f8b1ef6bde766923c4fd96ffd2bee7457e237` remained untouched; this actor did not acquire or settle.
- Workload boundary: feature-branch-chain, Slice/PR 4 remediation only; hard correction limit 29 changed lines.

### Corrected behavior
- `compose()` now writes `.distribution-manifest.json` at `dirname(outputRoot)`, a deterministic hidden sibling outside public `.output`.
- Causal tests assert the public tree excludes the manifest and the sibling evidence contains the returned manifest and config digest.
- No task checkbox changed; Slice 5+ implementation rows and parent-owned lifecycle gates remain deferred.

### TDD Cycle Evidence
| Task | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|
| Slice 4 blocker remediation | 9 tests passed | failing assertion written | 9 tests passed | repeat input order and failure seams passed | none needed |

### Verification and accounting
- Focused `pnpm --dir tooling/distribution type`: PASS; focused test: PASS, 1 file / 9 tests.
- Correction delta: `index.ts` +1/-1, `index.test.ts` +3, this progress section +24; total 29 changed lines, at the hard limit.
- Cleanup: Vitest temporary compose roots and staging directories were disposable; no repository artifacts, commit, push, PR, review, receipt, or delivery gate was created.
- Rollback boundary: revert only this sibling-path change, its three assertions, and this progress section; atomic staging and prior `.output` replacement behavior remain unchanged.
- Risk: external evidence is written before replacement, so manifest-write failures still abort before touching `.output`; no known residual risk for this scoped fix.
- Remaining tasks are the exact unchecked `- [ ]` implementation rows for Slices 5–10 already listed above; next recommendation is `parent-lifecycle`.

## Slice 5 apply — global files, references, and discovery metadata

### Structured status and boundary consumed

- Consumed authoritative status: `artifactStore: openspec`, `applyState: ready`, `nextRecommended: apply`, `actionContext.mode: repo-local`, workspace `/home/strocs/dev/FestivalARC`, allowed edit root `repository`, and no blocked reasons.
- Parent-owned runtime authority already returned `proceed` with token `sha256:b015f4f6bcc88aef3aad52ff46d7ff050ce5f637fa076b902cd10753b88bdc73`; this actor did not acquire or settle attempts.
- Workload boundary: feature-branch-chain, Slice/PR 5 only, under the 400-line authored budget. Slice 6 and all parent-owned lifecycle gates remain deferred.

### Completed implementation tasks and persisted checkboxes

- [x] Generated one distribution-owned neutral self-contained inline-CSS `404.html`; app-provided `404.html`, robots, sitemap, and manifest names are rejected before staging.
- [x] Derived sorted/deduplicated public routes from emitted HTML, generated deterministic sitemap shards/index with absolute URLs, and generated robots with exactly the composed sitemap URL.
- [x] Scanned HTML attributes and CSS `url()` references, allowing fragments, external URLs, configured cross-edition bases, and explicit globals while reporting archive-base escapes with owner/source/property/value.
- [x] Added causal tests for global ownership, route/evidence filtering, sitemap sharding/order, robots output, root/archive references, same-origin escapes, and deterministic composed manifests.
- Re-read `tasks.md` at this historical Slice 5 checkpoint: all four Slice 5 implementation rows visibly contained `- [x]`; Slice 6–10 rows were then unchecked. The current Slice 6 remediation status is recorded below.

### Files changed

- `tooling/distribution/src/index.ts`
- `tooling/distribution/src/index.test.ts`
- `openspec/changes/festivalarc-annual-monorepo/tasks.md`
- `openspec/changes/festivalarc-annual-monorepo/apply-progress.md`
- No dependency metadata required changes; `pnpm-lock.yaml` was not modified by Slice 5.

### TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| Distribution-owned 404 and globals | `tooling/distribution/src/index.test.ts` | Unit/integration | ✅ 9 tests | ✅ Written and failed before exports/generation | ✅ 13 tests passed | ✅ Ownership variants and composed manifest | ➖ None needed |
| Route inventory, sitemap, and robots | `tooling/distribution/src/index.test.ts` | Unit/integration | ✅ 9 tests | ✅ Written and failed before generation | ✅ 14 tests passed | ✅ Duplicates, shard size 1, archive routes, evidence exclusion | ➖ None needed |
| HTML/CSS reference scanning | `tooling/distribution/src/index.test.ts` | Unit | ✅ 9 tests | ✅ Written and failed before scanner | ✅ 14 tests passed | ✅ Relative CSS, same-origin, cross-edition, global, external, fragment | ➖ None needed |
| Causal Slice 5 coverage | `tooling/distribution/src/index.test.ts` | Unit/integration | ✅ 9 tests | ✅ Written before implementation | ✅ 14 tests passed | ✅ Root/archive and deterministic manifest cases | ➖ None needed |

### Verification and accounting

- Focused `pnpm --dir tooling/distribution test`: PASS, 1 file / 14 tests.
- Focused `pnpm --dir tooling/distribution type`: PASS.
- Root `pnpm type`: PASS; `CI=1 pnpm test`: PASS, 10 files / 71 tests; `pnpm build`: PASS. Astro emitted its existing Vite empty-chunk warning and prompted for the already-available `@astrojs/check` dependency; the build completed successfully.
- Exact Slice 5 implementation delta: `tooling/distribution/src/index.ts` +65/-2; `tooling/distribution/src/index.test.ts` +52/-2; `tasks.md` +4/-4 checkbox replacements. Authored implementation/test delta is 117 additions and 4 deletions (121 changed lines); including task metadata, 125 changed lines. The progress entry is evidence metadata and excluded from the authored budget.
- No source-mutating normalizer, browser/E2E run, deployment, Vercel change, commit, push, PR, review actor, receipt, or delivery gate was performed.

### Cleanup, rollback, and risks

- Vitest temporary compose roots, staging directories, backups, and generated manifests were disposable and cleaned by the tests. The root build left no Slice 5 repository artifact; existing ignored build outputs remain disposable.
- Rollback boundary: revert `tooling/distribution/src/index.ts`, `tooling/distribution/src/index.test.ts`, and the four Slice 5 checkbox changes; retain the Slice 4 normalized app-build/compositor core. This removes distribution global generation/reference checks without changing application UI or deployment behavior.
- Known limitation: reference validation is intentionally base/ownership validation, not existence validation; later app-base adaptation and full multi-edition route evidence remain assigned to Slice 6+.

### Remaining unchecked implementation tasks

- [ ] Replace hard-coded root links/assets, route comparisons, form actions, redirects, generated routes, metadata, social URLs, and sitemap assumptions with the app-local base helper and Astro-version adapter. <!-- sdd-owner: implementation -->
- [ ] Preserve edition-local navbar and interactions while generating typed cross-edition dropdown targets from the publication registry; verify trailing-slash and nested-route behavior. <!-- sdd-owner: implementation -->
- [ ] Build 2025 at `/` and a temporary `/ediciones/2025` context, then compare routes, normalized HTML, stable assets, metadata, screenshots, and Playwright interactions against the captured baseline; document only approved differences. <!-- sdd-owner: implementation -->
- [ ] Run `pnpm type`, `pnpm test`, `pnpm build`, distribution checks, and applicable Playwright evidence for both publication contexts. <!-- sdd-owner: implementation -->
- [ ] Import ARC2023 as an independently owned Astro application, preserving its Astro/version/dependency/framework boundary, routes, visual identity, navbar, content, and behavior without importing another edition source. <!-- sdd-owner: implementation -->
- [ ] Add its build adapter and base-aware route, asset, navigation, canonical/social metadata, sitemap-link, and trailing-slash handling for `/ediciones/2023`. <!-- sdd-owner: implementation -->
- [ ] Register and independently build the app, validate representative nested routes/assets/metadata, and add the normal type/test/build/browser evidence required by the repository. <!-- sdd-owner: implementation -->
- [ ] Import ARC2024 as an independently owned Astro application, retaining its local Astro/dependency/framework choices, routes, visual identity, navbar, content, and behavior. <!-- sdd-owner: implementation -->
- [ ] Add its build adapter and base-aware links, assets, generated routes, metadata, social URLs, sitemap-link, and trailing-slash behavior for `/ediciones/2024`. <!-- sdd-owner: implementation -->
- [ ] Register and independently build the app, validate representative nested routes/assets/metadata, and add normal type/test/build evidence without coupling it to another edition. <!-- sdd-owner: implementation -->
- [ ] Add `apps/calls-2026` as a separate `kind: calls` application owning only temporary call routes/data and no final-edition archive contract. <!-- sdd-owner: implementation -->
- [ ] Add lifecycle configuration and validation for calls-root selection, final-edition replacement, calls package/config removal, and rejection of stale calls inputs or calls archive members. <!-- sdd-owner: implementation -->
- [ ] Add composition tests proving calls routes/data are absent after final replacement, no calls archive path exists, and failed replacement retains the prior valid configuration/artifact without silent conversion. <!-- sdd-owner: implementation -->
- [ ] Independently verify calls root publication, base-aware links/assets, and normal type/test/build evidence while keeping the final-publication path reversible. <!-- sdd-owner: implementation -->
- [ ] Wire the root build to validate configuration, build selected active/archive members, compose atomically, and publish only `.output`; ensure source-app adapters/server settings cannot create additional deployments or enter the distribution contract. <!-- sdd-owner: implementation -->
- [ ] Configure the single root `vercel.json` entry point and remove legacy single-app deployment wiring only after composed artifact validation and 2025 parity evidence pass. <!-- sdd-owner: implementation -->
- [ ] Add Playwright coverage for root and archive smoke routes, nested navigation, edition dropdown, representative interactions, assets, 404, canonical/social metadata, sitemap, robots, calls replacement, and failure-prevents-deployment behavior. <!-- sdd-owner: implementation -->
- [ ] Run final `pnpm type`, `pnpm test`, independent `pnpm turbo run build`, `pnpm build`, distribution tests, and `pnpm run test:e2e`; retain route/output/manifest and compatibility evidence. <!-- sdd-owner: implementation -->
- [ ] Document the annual workflow for creating calls, selecting active publication, archiving prior finals, adding a future edition, validating bases, replacing/removing calls, required evidence, and rollback after failed composition. <!-- sdd-owner: implementation -->

- Next recommendation: `parent-lifecycle`; this actor does not start Slice 6, verification actors, review, receipts, or delivery gates.

## Slice 6 bounded remediation — parity evidence and EventModal lifecycle

### Structured status and boundary consumed

- Consumed authoritative OpenSpec status: `schemaName: gentle-ai.sdd-status`, `changeName: festivalarc-annual-monorepo`, `artifactStore: openspec`, `applyState: ready`, `nextRecommended: apply`, `actionContext.mode: repo-local`, workspace `/home/strocs/dev/FestivalARC`, allowed edit root `/home/strocs/dev/FestivalARC`, and `blockedReasons: []`.
- The parent supplied the active remediation authority with `proceed` token `sha256:a9fc660d734506536a4b32c17e0767f0b79d84070cd9f5379d082cc7c7033b85`; this actor did not acquire or settle it.
- Remediation is bound to failed verification evidence revision `sha256:fe73c64e0b24f6c5677c94c147432c1b25e13413f7577e192fec7148cad134fd`. No Slice 7 work, delivery gate, review actor, receipt, commit, push, or PR was started.
- Review workload guard: `Decision needed before apply: No`; `Chained PRs recommended: Yes`; `Chain strategy: feature-branch-chain`; `400-line budget risk: High`, with this bounded remediation kept below the 400-line objective.

### Completed blockers and persisted task state

- [x] Replace hard-coded root links/assets, route comparisons, form actions, redirects, generated routes, metadata, social URLs, and sitemap assumptions with the app-local base helper and Astro-version adapter.
- [x] Preserve edition-local navbar and interactions while generating typed cross-edition dropdown targets from the publication registry; verify trailing-slash and nested-route behavior.
- [x] Build 2025 at `/` and a temporary `/ediciones/2025` context, compare the required parity evidence, and document the maintainer-approved differences without fabricating a baseline comparison.
- [x] Run `pnpm type`, `pnpm test`, `pnpm build`, distribution checks, and applicable Playwright evidence for both publication contexts.
- [x] Removed direct `useEffect` calls from the `EventModal` component body by moving the existing unchanged lifecycle behavior into the reusable `useEventModalLifecycle` hook in the same file. Escape close, popstate close, body overflow locking, and cleanup are covered by the approval test.
- [x] Re-read persisted `tasks.md`: all four Slice 6 implementation rows are visibly checked; Slice 7 rows remain unchecked and unchanged.
- Parent-owned lifecycle rows were not changed.

### Parity evidence

- Added `openspec/changes/festivalarc-annual-monorepo/slice-6-parity-evidence.json` with deterministic route inventories, normalized HTML digests, stable asset manifest digests, complete candidate manifest summaries, metadata for root and `/ediciones/2025`, screenshot hashes/dimensions, interaction results, approved context differences, and the explicit baseline evidence boundary.
- Evidence artifact SHA-256 before this closure: `115b9db0278f89b91eff37a0f50caac089b891fbafbef5523e07c8f8d5edd4e7`; closure artifact SHA-256: `cf4bd4e51ad2398444f1460a2f9f2e89df8a6c17c30dfa90316859c92684eab3`.
- Stable composed-manifest evidence summary hash for the parent: `c9ce21ab4091d05d77e5060e327d5311ea791bca0e62964f29ea0ff096745791`.
- Root and archive builds both emitted `index.html` and `programacion/index.html`. Root candidate manifest summary: 72 files, 20897329 bytes, `068577887e78bd00ee066981a4b7651ada291031fb4b11e4d8a3d3c08ccfae68`; archive candidate summary: 75 files, 20900507 bytes, `a3fc2fda8f14fd0d9d340d0b98f65fe53e0858b78adeb80281df378e3e2cf306`. The exact byte totals and deterministic composed-manifest input are retained in the JSON artifact; no composed `.output` or Vercel cutover was claimed.
- Root/archive copied public stable asset sets are equal: 58 paths and identical bytes, with stable manifest `6ee9d15e7bf0185e6db95b2bd1b8c310a0dc4adcfaa152b7fd5d1fd5c7b42db8`. `robots.txt` remains a distribution-owned Slice 5 global and is not counted as an app stable asset.
- Metadata and route assertions passed for root and archive contexts. Expected approved differences are publication-base prefixes in canonical/Open Graph/favicon/asset/nested-route URLs and generated `_astro` names/identifiers. No unapproved difference is claimed.
- No baseline screenshot or baseline HTML byte capture exists in `baseline-2025.json`; therefore the two candidate screenshots are recorded as candidate-context evidence only, not baseline visual parity. The retained root/archive screenshots are byte-identical at 1280x4316 with SHA-256 `4760f9b1bb19bb208314ee03d6436753d9436808c7e1e05fb7ae2c033323fa8c`.
- Maintainer decision: `approve_difference`. The maintainer explicitly approved the documented absence of a pre-migration screenshot/HTML oracle and the mobile navigation active-state difference between root and archive contexts. This is an explicit approval of the candidate-context difference, not a fabricated baseline comparison; the oracle limitation remains truthful.

### Tests and runtime cleanup

- Approval test before production refactor: `pnpm --dir apps/festival-2025 exec vitest run src/features/schedule/ui/components/event/__tests__/EventModal.test.tsx` — PASS, 2 tests.
- Focused post-refactor approval test: same command — PASS, 2 tests.
- `pnpm type` — PASS.
- `CI=1 pnpm test` — PASS, 12 files / 76 tests.
- `pnpm build` — PASS; root proxy, Astro check/build, 2 pages.
- Archive build — PASS; `PUBLICATION_BASE=/ediciones/2025` and isolated temporary output, Astro check/build, 2 pages.
- `pnpm --dir tooling/distribution type` — PASS.
- `CI=1 pnpm --dir tooling/distribution test` — PASS, 1 file / 14 tests.
- Root Playwright — PASS, 2 tests; archive Playwright — PASS, 2 tests; metadata, base-aware asset/route assertions, nested route, day interaction, and screenshot capture all ran in both contexts.
- Playwright reports and `test-results` were removed after each run. Temporary archive output was removed. No Astro dev server, Playwright process, or other relevant process remains.

### TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| EventModal lifecycle refactor | `apps/festival-2025/src/features/schedule/ui/components/event/__tests__/EventModal.test.tsx` | Integration | N/A (no prior EventModal suite) | ✅ Approval tests written before production edit | ✅ 2 tests passed after hook extraction | ✅ Escape/unmount and popstate paths | ✅ Behavior preserved; no direct effect in component body |
| Slice 6 parity evidence | `openspec/changes/festivalarc-annual-monorepo/slice-6-parity-evidence.json` | Build/browser/evidence | Existing baseline JSON and candidate screenshots read | ✅ Evidence-generation assertions and bounded commands executed | ✅ Root/archive builds, tests, and E2E passed | ✅ Root/archive contexts and stable-manifest comparison | ✅ Compact deterministic evidence artifact; no invented baseline |

### Accounting, deviations, and rollback

- New correction accounting against the parent-provided failed candidate: EventModal hook extraction `+7/-3`; approval test `+37`; parity evidence `+229`; task checkbox reconciliation `+1/-1`; this remediation section `+58` plus one separator line; historical Slice 5 wording reconciliation `+1/-1`. Total new remediation footprint is `+334/-5` = 339 changed lines, below 400. The pre-existing Slice 6 asset-path change (`+1/-1`) is not counted in this remediation. The parent should use the exact repository diff for final CAS accounting.
- Cumulative candidate accounting remains the parent-recorded earlier Slice 1–5 work plus this bounded remediation; no new production file outside `EventModal.tsx` was modified.
- Closure: task 3 is approved under the maintainer decision `approve_difference`. The missing pre-migration screenshot/HTML oracle remains explicitly documented, and the mobile navigation active-state difference is approved as a candidate-context difference only; no baseline comparison is fabricated.
- Rollback boundary: remove this evidence-approval closure, restore the prior Slice 6 task 3 checkbox, and retain all feature code and prior parity evidence unchanged. No Slice 7 rows or parent-owned lifecycle rows changed.
- Structural closure validation is limited to JSON parsing, readback/grep, `git diff --check`, and Slice 7 row preservation; prior build/browser/test evidence remains the source for functional results.
- `next_recommended`: `parent-lifecycle`; all four Slice 6 implementation criteria are complete. This actor does not start verification actors, bounded review, refutation, correction, validation, receipts, or delivery gates.

## Slice 7 apply — independent ARC2023 application

### Structured status and boundary consumed

- Consumed parent-provided authoritative status: `changeName: festivalarc-annual-monorepo`, `artifactStore: openspec`, `applyState: ready`, `nextRecommended: apply`, `actionContext.mode: repo-local`, workspace `/home/strocs/dev/FestivalARC`, allowed edit root repository, and no blocked reasons.
- Parent-owned runtime authority already returned `proceed` with token `sha256:00ddb5bc37c60fdd364ad47e0cceace35cfcf0aa9d41f4e9988ac9f28d5f97ef`; this actor did not acquire or settle an attempt.
- Workload guard consumed: `Decision needed before apply: No`, `Chained PRs recommended: Yes`, `Chain strategy: feature-branch-chain`, `400-line budget risk: High`. The parent-provided `size:exception` is recorded in `tasks.md` and is bounded to Slice 7 by the parent-held 20,000-line limit. Slice 8 was not started.
- `strict_tdd: false` per `openspec/config.yaml`; standard mode was used. No review, receipt, validation, delivery gate, commit, push, or PR action was performed.

### Completed implementation tasks and persisted checkbox updates

- [x] Imported the authentic `Strocs/ARC2023` `main` source at commit `ca2fa7af5785e3a340390647bbdc9e357764510d` into `apps/festival-2023/**`, retaining its Astro 1.9/React 18/Tailwind 3 boundary, source-owned routes, navbar, visual system, content, assets, and behavior. The source `.gitignore` was intentionally not copied; no source from another edition was imported.
- [x] Added the Astro-version build adapter `apps/festival-2023/scripts/build.mjs`, `PUBLICATION_BASE`/`trailingSlash` configuration, local base URL helper, base-aware routes/assets/CSS/fonts, canonical/Open Graph/sitemap-link metadata, and archive-aware navbar/runtime navigation for `/ediciones/2023`.
- [x] Registered `festival-arc-2023` as the configured `/ediciones/2023` archive, independently built it, validated representative output and browser routes/assets/metadata, and added focused publication-path tests.
- Re-read `tasks.md`: all three Slice 7 implementation rows visibly contain `- [x]`; Slice 8, Slice 9, and Slice 10 rows remain unchecked and unchanged.

### Files and evidence

- Source/import boundary: `apps/festival-2023/**` (180 authentic source files plus the local build adapter and base-path test/helper files); source and output accounting is retained in `slice-7-import-evidence.json`.
- Registry: `editions.config.ts` now contains only the 2023 archive entry addition; active `festival-2025` remains unchanged.
- Workspace resolution: `pnpm-lock.yaml` contains the `festival-arc-2023` importer and its Astro 1 dependency graph. The upstream `package-lock.json` was intentionally omitted from the workspace import; pnpm remains the workspace package manager.
- Evidence: `openspec/changes/festivalarc-annual-monorepo/slice-7-import-evidence.json`.
- No 2024/2025 UI ownership, `.gitignore`, `refs/**`, `.pi/**`, deployment wiring, or Slice 8+ task content was changed by this slice.

### Verification evidence

- `pnpm --dir apps/festival-2023 type`: PASS — Astro check, 0 errors, 0 warnings, 2 pre-existing-style implicit-any hints in imported source.
- `pnpm --dir apps/festival-2023 test`: PASS — Node test runner, 2/2 focused base-helper tests.
- `PUBLICATION_BASE=/ediciones/2023 DISTRIBUTION_OUTPUT_DIR=/tmp/festivalarc-2023-build pnpm --dir apps/festival-2023 build`: PASS — 98 pages, 219 output files, 44,227,556 bytes. Astro emitted three non-fatal Tailwind external-asset resolution warnings; emitted CSS contains the correct `/ediciones/2023/` asset paths.
- `pnpm type`: PASS — existing 2025 type proxy.
- `CI=1 pnpm test`: PASS — 12 files / 76 tests.
- `pnpm build`: PASS — existing 2025 compatibility build.
- `pnpm --dir packages/editions type`: PASS; `CI=1 pnpm --dir packages/editions test`: PASS — 1 file / 11 tests.
- `pnpm --dir tooling/distribution type`: PASS; `CI=1 pnpm --dir tooling/distribution test`: PASS — 1 file / 14 tests.
- Chromium structural/browser check: PASS via `/usr/sbin/chromium` and a temporary static server. `/ediciones/2023/` and `/ediciones/2023/espacio-la-gaviota/la-cantina-de-la-negra/` returned HTTP 200; canonical URLs, base-prefixed links/assets, stylesheet/image assets, and asset HTTP 200 were verified.
- Structural output scan: PASS — representative generated HTML contained no unprefixed local `href`/`src`/`action` escapes; trailing-slash route output and canonical URLs used the 2023 base. `git diff --check`: PASS.
- An auxiliary direct Node strip-only probe of `editions.config.ts` was not usable because the existing shared `packages/editions/src/index.ts` contains a parameter-property syntax unsupported by Node 26 strip-only mode; this did not affect the passing package type/tests or the app build. No shared package workaround was introduced in Slice 7.

### Changed-line and size accounting

- Imported application footprint: 184 source files after adaptation (180 imported source files, excluding the upstream `.gitignore`, plus 4 local helper/adapter/test additions), 34,465,517 source bytes; 34 MB on disk. Binary assets are faithful copies and are measured separately from authored review lines.
- Slice 7 build evidence: 219 files / 98 HTML files / 44,227,556 bytes in the disposable isolated output. The 20,000-line parent runtime bound was not approached by authored source changes; the explicit `size:exception` covers the faithful asset/source import only for this slice.
- The repository working tree also includes earlier-slice uncommitted changes, so final cumulative CAS accounting must use the parent’s exact candidate diff. No file-type or generated-output counts are represented as authored lines here.

### Cleanup, rollback, deviations, and remaining work

- Temporary source clone, isolated build output, browser staging tree, HTTP server, Playwright browser, generated `.astro`, `dist`, reports, and app install links were removed after evidence capture. No relevant process remains.
- No design deviation from independent Astro-version boundaries. The old Astro sitemap integration is retained as an upstream dependency but not invoked because its Astro 1 integration rejects the absolute isolated-output path required by the normalized build boundary; the distribution-owned sitemap contract remains the publication authority. The app emits a base-aware sitemap alternate link to that global endpoint.
- Rollback boundary: remove `apps/festival-2023/**`, remove only the `festival-arc-2023` archive entry from `editions.config.ts`, and remove its importer/package records from `pnpm-lock.yaml`; retain all 2024/2025 apps, shared contracts, compositor, and active 2025 registry entry.
- Exact remaining unchecked implementation rows are the Slice 8, 9, and 10 rows in `tasks.md`; Slice 8 is the next implementation boundary. Parent-owned lifecycle actions remain deferred.

### Workload / PR boundary and status produced

- Feature-branch-chain, Slice/PR 7 only. The accepted `size:exception` is bounded to this source import and the parent-held 20,000-line runtime limit. Slice 8 was not started.
- `next_recommended: parent-lifecycle`; this actor does not start verification actors, review/refutation/correction/validation actors, receipts, or delivery gates.

## Slice 7 remediation — case-sensitive ARC2023 asset reference

### Structured status and boundary consumed

- Consumed authoritative OpenSpec status: `artifactStore: openspec`, `applyState: ready`, `nextRecommended: apply`, `actionContext.mode: repo-local`, workspace `/home/strocs/dev/FestivalARC`, allowed edit root `/home/strocs/dev/FestivalARC`, and no blocked reasons.
- Parent-held remediation authority was `proceed` with token `sha256:b4df8c750bb4d4ab041ed059962b7f269bc82dba17651a402ac0454fcd83170f`; this actor did not acquire or settle an attempt. The remediation was bound to failed evidence revision `sha256:7772c5e561848b0221b61a919b410662250da59ca2bd442efef3ffc24888442e`.
- Workload boundary: feature-branch-chain, Slice/PR 7 remediation only; hard correction budget 100 changed lines. `Decision needed before apply: No`; chained PRs remain selected; no Slice 8+ or parent-owned work was started.
- `strict_tdd: false` per `openspec/config.yaml`; standard focused remediation was used.

### Corrected behavior and evidence

- Corrected `apps/festival-2023/src/data/MUSEO.js` to reference the authentic case-sensitive asset `/arqueologico/CAMPOS.JPG`.
- Added a focused test asserting the museum data reference and the existence of `public/arqueologico/CAMPOS.JPG`.
- Rebuilt with `PUBLICATION_BASE=/ediciones/2023` and `DISTRIBUTION_OUTPUT_DIR=/tmp/festivalarc-2023-remediation-build`: 98 pages, 219 output files, 44,227,556 bytes. The emitted file `arqueologico/CAMPOS.JPG` exists, and `museo-arqueologico-de-la-serena/claudia-campos-mendoza/index.html` contains `/ediciones/2023/arqueologico/CAMPOS.JPG`.
- Corrected the Slice 7 package-lock statement: `package-lock.json` was intentionally omitted from the workspace import.
- No Slice 7 task checkbox changed; the three checked rows remain checked, and the exact unchecked Slice 8–10 implementation rows remain listed below.

### Verification, accounting, and cleanup

- `pnpm --dir apps/festival-2023 test`: PASS, 3 focused Node tests.
- `PUBLICATION_BASE=/ediciones/2023 DISTRIBUTION_OUTPUT_DIR=/tmp/festivalarc-2023-remediation-build pnpm --dir apps/festival-2023 build`: PASS; the emitted asset and base-prefixed HTML reference were asserted after build. The existing three non-fatal Tailwind external-asset warnings remain.
- `git diff --check` on the allowed tracked remediation files: PASS.
- Remediation delta: `MUSEO.js` +1/-1; focused test +9/-0; apply-progress correction/remediation section +29/-1; import evidence remediation block +18/-0; total +57/-2 = 59 changed lines, below the 100-line correction budget.
- Cleanup complete: `/tmp/festivalarc-2023-remediation-build` was removed after verification; no `dist`, `.astro`, reports, test-results, server, browser, commit, push, PR, review actor, receipt, or delivery gate remains from this remediation.
- Rollback boundary: revert only the `CAMPOS.JPG` reference, its focused assertion, the package-lock wording correction, and this remediation evidence; retain the rest of Slice 7 unchanged.
- Deterministic evidence revision: `sha256:045cfe827024e07c106c5b432be9cfc425d36813580f68801795c1598f830cc5`.
- `next_recommended: parent-lifecycle`; this actor does not start verification actors, bounded review, refutation, correction, validation, receipts, or delivery gates.

## Slice 8 apply — independent ARC2024 application

### Structured status consumed and boundary

- Consumed authoritative status: `schemaName: gentle-ai.sdd-status`, `changeName: festivalarc-annual-monorepo`, `artifactStore: openspec`, `applyState: ready`, `nextRecommended: apply`, `actionContext.mode: repo-local`, workspace `/home/strocs/dev/FestivalARC`, allowed edit root repository, and no blocked reasons.
- Parent-owned runtime authority already returned `proceed` with token `sha256:b6aab7c9e4b6539a03355467b144e77c43e45ea7215beaebbf9dfac8bc989109`; this actor did not acquire or settle an attempt.
- Workload gate: `Decision needed before apply: No`; `Chained PRs recommended: Yes`; `Chain strategy: feature-branch-chain`; `400-line budget risk: High`. The maintainer-approved `size:exception` applies ONLY to this faithful `origin/2024` import and is bounded by the parent-held 20,000-line limit. Slice 9 was not started.
- Strict-TDD support was loaded because the session contract enabled it; repository config says strict TDD is disabled for the overall change. This slice nevertheless records RED → GREEN → TRIANGULATE → REFACTOR evidence below.
- No action-context warning was present. No review, refutation, correction, validation actor, receipt, delivery gate, commit, push, or PR action was performed.

### Completed implementation tasks and persisted checkboxes

- [x] Imported the exact `origin/2024` tree at commit `d8860472994910f5d563abf2fc6a397093f11489` into `apps/festival-2024/**`, retaining 153 source files byte-for-byte and the ARC2024 Astro 4/React 18/Tailwind 3/Nanostores/Swiper dependency boundary. The protected source `.gitignore`, nested lockfile, app-owned `robots.txt`, and app `404.astro` were intentionally excluded from the workspace/compositor boundary; no 2023 or 2025 source was copied.
- [x] Added the Astro 4 build adapter, `/ediciones/2024` base and trailing-slash configuration, local base helper, base-aware navigation/redirects, gallery runtime assets, Tailwind CSS asset URLs, canonical/Open Graph/Twitter metadata, favicon, sitemap link, and base-aware home detection while retaining the edition-local UI and behavior.
- [x] Registered `festival-arc-2024` as the `/ediciones/2024` archive, updated the root workspace lock importer, independently built it, validated nested routes/assets/metadata and case-sensitive references, and recorded normal app/root/package/browser evidence.
- Re-read persisted `tasks.md`: all three Slice 8 implementation rows visibly contain `- [x]`; Slice 9 and Slice 10 rows remain unchecked and unchanged. Parent-owned rows were preserved byte-for-byte.

### Provenance, files, and changed-line accounting

- `slice-8-import-evidence.json` records source ref/commit, preserved/adapted/omitted file sets, output inventory, metadata, exact-case checks, verification, cleanup, rollback, and delivery boundary. Evidence file SHA-256: `sha256:f4ec06fd6ccbd7104f865d3063ce9c2c261de7c43525e41ea6aaea4702cc4d8d`.
- Application source import: 167 files in `origin/2024`; 153 preserved source files, 10 adapted source/config files, 4 deployment/workspace boundary files omitted, plus 5 local adapter/helper/test files. The source import output is 123 files / 27,675,321 bytes for the archive build.
- Authored app text delta against the immutable source was 51 additions / 28 deletions in adapted files plus 117 lines in local adapter/helper/test files: 168 additions / 28 deletions, 196 changed lines. Historical binary/source assets are measured separately and covered by the approved exception.
- Registry/task metadata adds the `festival-arc-2024` archive and three checked Slice 8 rows; `pnpm-lock.yaml` contains the dedicated Astro 4 importer. No 2023/2025 UI ownership changed. `package.json` root had no new Slice 8 change beyond pre-existing workspace metadata.

### Verification evidence

- RED: `node --test apps/festival-2024/src/utils/publication-path.test.js` failed before the helper/import existed with `ERR_MODULE_NOT_FOUND`; `node --test apps/festival-2024/scripts/build-output.test.mjs` likewise failed before the output resolver existed.
- GREEN: `pnpm --dir apps/festival-2024 test` passed 5/5 tests; `pnpm --dir apps/festival-2024 type` passed with 0 errors, 0 warnings, and 1 pre-existing unused-import hint; the isolated archive build passed with 7 pages.
- TRIANGULATE: helper root/archive, external/mail/fragment, metadata/home, static Vercel output, nested route, CSS assets, representative gallery assets, and exact-case output checks passed. The case-sensitive structural scan checked 138 emitted local references.
- REFACTOR: build output resolution was extracted into the pure `resolveAstroOutput` helper; focused tests remained green after the adapter cleanup. No React island was created. Existing imported React components retain their source lifecycle implementation; no new direct `useEffect` usage was added.
- `PUBLICATION_BASE=/ediciones/2024 DISTRIBUTION_OUTPUT_DIR=/tmp/festivalarc-2024-build pnpm --dir apps/festival-2024 build`: PASS — 7 HTML pages, 123 output files, 27,675,321 bytes. Non-fatal Vite warnings report intentionally externalized base-prefixed CSS URLs; emitted CSS and HTTP checks confirmed the exact files.
- `CI=1 pnpm test`: PASS — 12 files / 76 tests. `pnpm build`: PASS — existing 2025 compatibility build, 2 pages.
- `pnpm --dir packages/editions type` and test: PASS — 11 tests. `pnpm --dir tooling/distribution type` and test: PASS — 14 tests.
- Chromium headless proportional browser evidence: PASS against a temporary static server mounted at `/ediciones/2024`; archive root, `/viernes-28/`, `/el-festival/`, exact-case gallery/image assets returned HTTP 200 and the nested DOM loaded ARC2024/programming content.
- `pnpm type`: BLOCKED by existing 2025 TypeScript React 18/19 and csstype incompatibilities in unchanged 2025 tests/components. This is a pre-existing repository check failure exposed after workspace install; no 2025 files were modified for it. Root test/build still passed.
- No `pnpm run test:e2e` was run: the imported app's upstream Playwright config has no web server and its visual test requires a missing snapshot; the bounded Chromium static-server smoke is the proportional browser evidence for this archive slice.
- `git diff --check`: PASS for allowed tracked files; ownership marker scan found no malformed markers.

### TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| Import ARC2024 source boundary | `apps/festival-2024/src/utils/publication-path.test.js` | Unit/structural | N/A (new app) | ✅ Written before import | ✅ 5 tests passed | ✅ Source files/assets and helper paths | ✅ Import remains byte-faithful outside explicit boundary files |
| Base-aware URLs and metadata | `apps/festival-2024/src/utils/publication-path.test.js` | Unit + build structural | N/A (new helper) | ✅ Written before helper | ✅ 4 helper cases passed | ✅ root/archive, external, metadata/home cases | ✅ Pure helper and base-aware component wiring |
| Build adapter and publication output | `apps/festival-2024/scripts/build-output.test.mjs` | Unit + build/browser | N/A (new adapter) | ✅ Written before resolver | ✅ 1 adapter test / 2 cases passed; build passed | ✅ `dist` and `.vercel/output/static` paths, nested archive output | ✅ Pure output resolver and disposable cleanup |

### Remaining implementation tasks and parent lifecycle

- [ ] Add `apps/calls-2026` as a separate `kind: calls` application owning only temporary call routes/data and no final-edition archive contract. <!-- sdd-owner: implementation -->
- [ ] Add lifecycle configuration and validation for calls-root selection, final-edition replacement, calls package/config removal, and rejection of stale calls inputs or calls archive members. <!-- sdd-owner: implementation -->
- [ ] Add composition tests proving calls routes/data are absent after final replacement, no calls archive path exists, and failed replacement retains the prior valid configuration/artifact without silent conversion. <!-- sdd-owner: implementation -->
- [ ] Independently verify calls root publication, base-aware links/assets, and normal type/test/build evidence while keeping the final-publication path reversible. <!-- sdd-owner: implementation -->
- [ ] Wire the root build to validate configuration, build selected active/archive members, compose atomically, and publish only `.output`; ensure source-app adapters/server settings cannot create additional deployments or enter the distribution contract. <!-- sdd-owner: implementation -->
- [ ] Configure the single root `vercel.json` entry point and remove legacy single-app deployment wiring only after composed artifact validation and 2025 parity evidence pass. <!-- sdd-owner: implementation -->
- [ ] Add Playwright coverage for root and archive smoke routes, nested navigation, edition dropdown, representative interactions, assets, 404, canonical/social metadata, sitemap, robots, calls replacement, and failure-prevents-deployment behavior. <!-- sdd-owner: implementation -->
- [ ] Run final `pnpm type`, `pnpm test`, independent `pnpm turbo run build`, `pnpm build`, distribution tests, and `pnpm run test:e2e`; retain route/output/manifest and compatibility evidence. <!-- sdd-owner: implementation -->
- [ ] Document the annual workflow for creating calls, selecting active publication, archiving prior finals, adding a future edition, validating bases, replacing/removing calls, required evidence, and rollback after failed composition. <!-- sdd-owner: implementation -->

### Cleanup, rollback, and status produced

- Temporary `/tmp/festivalarc-2024-build`, static-server tree, browser DOM/log files, app `.vercel`, `.astro`, `dist`, reports, and test-results were removed after evidence capture. No relevant server/browser process remains.
- Rollback boundary is limited to `apps/festival-2024/**`, the `festival-arc-2024` archive entry in `editions.config.ts`, its `apps/festival-2024` importer in `pnpm-lock.yaml`, and Slice 8 evidence/task/progress entries. Retain 2023/2025 apps, shared contracts, compositor, and active 2025/2023 publication configuration.
- `next_recommended: parent-lifecycle`; all Slice 8 implementation tasks are complete. Parent owns runtime settlement, review/verification actors, receipts, and delivery gates.

#### Exact unchecked implementation rows after Slice 7

- [ ] Import ARC2024 as an independently owned Astro application, retaining its local Astro/dependency/framework choices, routes, visual identity, navbar, content, and behavior. <!-- sdd-owner: implementation -->
- [ ] Add its build adapter and base-aware links, assets, generated routes, metadata, social URLs, sitemap-link, and trailing-slash behavior for `/ediciones/2024`. <!-- sdd-owner: implementation -->
- [ ] Register and independently build the app, validate representative nested routes/assets/metadata, and add normal type/test/build evidence without coupling it to another edition. <!-- sdd-owner: implementation -->
- [ ] Add `apps/calls-2026` as a separate `kind: calls` application owning only temporary call routes/data and no final-edition archive contract. <!-- sdd-owner: implementation -->
- [ ] Add lifecycle configuration and validation for calls-root selection, final-edition replacement, calls package/config removal, and rejection of stale calls inputs or calls archive members. <!-- sdd-owner: implementation -->
- [ ] Add composition tests proving calls routes/data are absent after final replacement, no calls archive path exists, and failed replacement retains the prior valid configuration/artifact without silent conversion. <!-- sdd-owner: implementation -->
- [ ] Independently verify calls root publication, base-aware links/assets, and normal type/test/build evidence while keeping the final-publication path reversible. <!-- sdd-owner: implementation -->
- [ ] Wire the root build to validate configuration, build selected active/archive members, compose atomically, and publish only `.output`; ensure source-app adapters/server settings cannot create additional deployments or enter the distribution contract. <!-- sdd-owner: implementation -->
- [ ] Configure the single root `vercel.json` entry point and remove legacy single-app deployment wiring only after composed artifact validation and 2025 parity evidence pass. <!-- sdd-owner: implementation -->
- [ ] Add Playwright coverage for root and archive smoke routes, nested navigation, edition dropdown, representative interactions, assets, 404, canonical/social metadata, sitemap, robots, calls replacement, and failure-prevents-deployment behavior. <!-- sdd-owner: implementation -->
- [ ] Run final `pnpm type`, `pnpm test`, independent `pnpm turbo run build`, `pnpm build`, distribution tests, and `pnpm run test:e2e`; retain route/output/manifest and compatibility evidence. <!-- sdd-owner: implementation -->
- [ ] Document the annual workflow for creating calls, selecting active publication, archiving prior finals, adding a future edition, validating bases, replacing/removing calls, required evidence, and rollback after failed composition. <!-- sdd-owner: implementation -->

## Slice 8 dependency-link remediation — maintainer-authorized verification

### Structured status consumed and boundary

- Consumed authoritative OpenSpec status: `schemaName: gentle-ai.sdd-status`, `changeName: festivalarc-annual-monorepo`, `artifactStore: openspec`, `applyState: ready`, `nextRecommended: apply`, `actionContext.mode: repo-local`, workspace `/home/strocs/dev/FestivalARC`, allowed edit root `/home/strocs/dev/FestivalARC`, and `blockedReasons: []`.
- Continued the parent-owned native attempt already acquired as `proceed` with token `sha256:8038cd7f6a030e253e51b20ca7800b4a8736e42f5e67bf7ae897943e1d5ba4f0`; this actor did not acquire or settle it. Remediation is bound to failed evidence revision `sha256:42a3b9e9d6b48eaa15dde3b185cd316147c6ba13f03341db02e9ff7672a3645a`.
- Workload guard consumed exactly: `Decision needed before apply: No`; `Chained PRs recommended: Yes`; `Chain strategy: feature-branch-chain`; `400-line budget risk: High`. The maintainer-approved Slice 8 `size:exception` remains limited to the historical import; this remediation made no source correction and did not start Slice 9.
- Three Slice 8 implementation rows remain checked because the dependency-link remediation now supplies the previously missing execution prerequisite and all required evidence passes. Slice 9/10 rows and parent-owned lifecycle rows were preserved byte-for-byte.

### Dependency-link remediation

- `pnpm install --frozen-lockfile --prefer-offline` — PASS; all 7 workspace projects were linked, resolution was skipped, and the frozen lockfile remained unchanged by this operation.
- Confirmed `apps/festival-2024/node_modules/astro` resolves Astro `4.16.19` and `apps/festival-2024/node_modules/@astrojs/check` resolves `0.7.0` from the workspace store.
- No Slice 8 package/lock metadata defect was exposed. No source, package manifest, registry, or unrelated dependency was modified by remediation.

### ARC2024 verification evidence

- `pnpm --dir apps/festival-2024 test` — PASS, 5 focused tests.
- `pnpm --dir apps/festival-2024 type` — PASS, 0 errors / 0 warnings / 1 unused-import hint.
- `PUBLICATION_BASE=/ediciones/2024 DISTRIBUTION_OUTPUT_DIR=/tmp/festivalarc-2024-build-slice8-remediation pnpm --dir apps/festival-2024 build` — PASS, 7 pages / 123 files / 27,675,321 bytes.
- Emitted structural/reference scan — PASS: exact expected 7-page inventory, nested `viernes-28/index.html`, canonical/Open Graph/Twitter metadata under `https://festivalarc.com/ediciones/2024/`, `/sitemap-index.xml` links, and 309 emitted HTML/CSS/JS references resolved against the case-sensitive output tree. Representative exact-case gallery/image assets were present.
- Browser smoke — PASS using the already installed system Chromium through named Playwright session `festivalarc-slice8-remediation`: archive root and `/ediciones/2024/viernes-28/` loaded with HTTP 200, expected ARC2024 titles/content, base-aware navigation, and no browser installation. The session was closed after use.

### Proportional regression evidence

- `pnpm type` — BLOCKED, unchanged pre-existing 2025 React 18/19 and `csstype` incompatibilities in the existing 2025 tests/components; no 2025 files were modified by this remediation.
- `CI=1 pnpm test` — PASS, 12 files / 76 tests.
- `pnpm build` — PASS, unchanged 2025 compatibility build, 2 pages.
- `pnpm --dir apps/festival-2023 type` — PASS, 0 errors / 0 warnings / 2 existing implicit-any hints.
- `pnpm --dir apps/festival-2023 test` — PASS, 3 focused tests.
- `pnpm --dir packages/editions type && CI=1 pnpm --dir packages/editions test` — PASS, 11 tests.
- `pnpm --dir tooling/distribution type && CI=1 pnpm --dir tooling/distribution test` — PASS, 14 tests.

### TDD Cycle Evidence

| Task | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|
| Slice 8 dependency-link remediation | Existing 5 focused ARC2024 tests plus prior failed evidence | ✅ Prior bound failure identified missing `astro-check` and `astro` executable resolution | ✅ Frozen workspace install restored links; 5 tests, type, and build passed | ✅ Emitted case-sensitive scan, metadata/canonical/social/sitemap checks, browser smoke, root, 2023, editions, and distribution checks passed or retained truthful pre-existing type blocker | ➖ No production or metadata correction was required |

### Accounting, cleanup, and evidence revision

- Remediation changed 0 authored source/metadata lines and 0 task checkbox lines. The only tracked surfaces updated are the allowed evidence/progress artifacts; the install created no lockfile delta and no unrelated dependency upgrade. The 200-line hard source/metadata correction budget therefore has 0 lines consumed.
- Removed temporary archive build output, app/root `.astro`, `dist`, `.vercel`, Playwright reports/results, `.playwright-cli`, static-server files, and the named browser session. No relevant server, browser, Astro, Vite, or pnpm process remains.
- Refreshed `slice-8-import-evidence.json` with the dependency-link and verification results. Deterministic evidence revision is recorded after hashing the refreshed file as `sha256:9ee7dfb3c7c9bb88510effc9ea07f0ffbba82b6907f9666cf88574d9e02de8d3` and is distinct from the failed revision above.
- Rollback boundary: remove only the remediation evidence/progress additions and the workspace-generated dependency links; retain the Slice 8 application, registry entry, lock importer, and checked implementation rows.
- No commit, push, PR, review/refutation/correction/validation actor, receipt, or delivery gate was started. `next_recommended: parent-lifecycle`.

## Slice 9 apply — temporary 2026 calls lifecycle

### Structured status consumed and boundary

- Consumed parent-provided authoritative status: `artifactStore: openspec`, `applyState: ready`, `nextRecommended: apply`, `actionContext.mode: repo-local`, workspace `/home/strocs/dev/FestivalARC`, allowed edit root `/home/strocs/dev/FestivalARC`, and no blocked reasons.
- Parent-owned runtime attempt `sha256:445803d84dbabdbb5a936bb15475bd36154b861470f00435fd31bab58be21de6` already returned `proceed`; this actor did not acquire or settle an attempt.
- Workload guard: `Decision needed before apply: No`; `Chained PRs recommended: Yes`; `Chain strategy: feature-branch-chain`; `400-line budget risk: High`. Parent-resolved boundary is Slice/PR 9 with a 400 changed-line maximum. Strict TDD is disabled. No review, receipt, delivery gate, commit, push, or PR action was performed.

### Completed implementation tasks and persisted checkboxes

- [x] Added `apps/calls-2026` as an independent Astro 5 static `kind: calls` application with temporary call data/routes, local base-aware links/assets, canonical metadata, and no archive contract.
- [x] Added calls-root and final-replacement lifecycle validation in `@festivalarc/editions`, including calls package removal checks and immutable year-matched replacement. `editions.config.ts` now selects `calls-2026` at `/` and retains only final 2023/2024 archives.
- [x] Added composition coverage proving calls routes/data disappear after final replacement, no `/ediciones/2026` calls archive exists, and stale calls input failure retains the prior configuration and `.output` artifact.
- [x] Independently verified calls root publication, archive-base links/assets, and normal focused/root type/test/build evidence while keeping replacement reversible.
- Re-read `tasks.md`: all four Slice 9 implementation rows visibly contain `- [x]`; Slice 10 rows remain unchecked and parent-owned rows were not changed.

### Files changed

- Added `apps/calls-2026/**` (package/configuration, temporary data/routes/layout, URL helper/tests, CSS/SVG assets, and lifecycle README).
- Updated `packages/editions/src/index.ts` and `src/index.test.ts`, `tooling/distribution/src/index.test.ts`, `editions.config.ts`, the calls importer in `pnpm-lock.yaml`, and only the four Slice 9 task checkbox lines.

### Verification evidence

- `CI=1 pnpm --dir apps/calls-2026 test`: PASS, 1 file / 2 tests; `pnpm --dir apps/calls-2026 type`: PASS.
- `CI=1 pnpm --dir packages/editions test`: PASS, 1 file / 12 tests; package type: PASS.
- `CI=1 pnpm --dir tooling/distribution test`: PASS, 1 file / 15 tests; tooling type: PASS.
- Calls builds with `PUBLICATION_BASE=/` and `/ediciones/2026`: PASS, 2 pages each. Archive output references use `/ediciones/2026/` for navigation, canonical URLs, CSS, and SVG assets.
- Temporary static-server smoke: PASS. Root and archive roots, nested call route, CSS, and SVG all returned HTTP 200.
- `pnpm type`: PASS; `CI=1 pnpm test`: PASS, 12 files / 76 tests; `pnpm build`: PASS, existing 2025 compatibility build. `git diff --check`: PASS for modified tracked allowed surfaces.

### Accounting, cleanup, rollback, and risks

- Exact Slice 9 authored accounting: 247 additions / 18 deletions across the calls app, lifecycle code/tests, distribution test, publication config, and lock importer = 265 changed lines. Task metadata adds 4/4; apply-progress evidence is excluded from the authored budget. This is below 400 lines.
- Cleanup completed: temporary builds, mounted static-server tree/log, generated calls `.astro`/`.vercel`/`dist`, and test artifacts were removed. Pre-existing user changes and untracked `.pi/**`, `refs/**`, `output/**`, and historical apps were preserved.
- Rollback boundary: remove `apps/calls-2026/**`, its lock importer and known-package/config entry, restore the prior final active descriptor, and revert the lifecycle helpers/tests and Slice 9 checkboxes. Failed replacement leaves the prior valid config/artifact untouched and never converts calls into an archive.
- Deviation: the checked-in lifecycle config selects calls at `/` for the temporary call period; root `pnpm build` remains the 2025 compatibility proxy until Slice 10. No final 2026 app or deployment wiring was added.
- Risk: Astro emitted a non-fatal prompt about the already-declared TypeScript dependency during calls builds; build/type commands completed successfully and no functional risk is known within this slice.

### Remaining implementation tasks and next recommendation

- [ ] Wire the root build to validate configuration, build selected active/archive members, compose atomically, and publish only `.output`; ensure source-app adapters/server settings cannot create additional deployments or enter the distribution contract. <!-- sdd-owner: implementation -->
- [ ] Configure the single root `vercel.json` entry point and remove legacy single-app deployment wiring only after composed artifact validation and 2025 parity evidence pass. <!-- sdd-owner: implementation -->
- [ ] Add Playwright coverage for root and archive smoke routes, nested navigation, edition dropdown, representative interactions, assets, 404, canonical/social metadata, sitemap, robots, calls replacement, and failure-prevents-deployment behavior. <!-- sdd-owner: implementation -->
- [ ] Run final `pnpm type`, `pnpm test`, independent `pnpm turbo run build`, `pnpm build`, distribution tests, and `pnpm run test:e2e`; retain route/output/manifest and compatibility evidence. <!-- sdd-owner: implementation -->
- [ ] Document the annual workflow for creating calls, selecting active publication, archiving prior finals, adding a future edition, validating bases, replacing/removing calls, required evidence, and rollback after failed composition. <!-- sdd-owner: implementation -->
- `next_recommended: parent-lifecycle`; parent owns runtime settlement, verification/remediation actors, receipts, and delivery gates. Slice 10 was not started.

    ## Slice 9 correction closure — root typecheck dependency remediation

    - Structured status consumed: authoritative OpenSpec `applyState: ready`, `nextRecommended: apply`, repo-local edit root `/home/strocs/dev/FestivalARC`; parent-held acquire token `sha256:308e8237b7c0735a73e60af3bb4abf3508cc9571c1f31dbf09804edf36314a07` was reused without acquire or settle.
    - Timed-out candidate inspection: persisted dependency changes were present in `package.json`, `apps/festival-2025/package.json`, and `pnpm-lock.yaml`; the lockfile includes `csstype` `3.2.3` and the manifests include the existing workspace links. No further dependency edit was made.
    - `pnpm type`: exit 0. `CI=1 pnpm test`: exit 0, 12 files / 76 tests. `pnpm build`: exit 0, 2 pages.
    - Exact continuation delta: 0 authored lines, 0 dependency-manifest/lock corrections, 0 task-checkbox changes; no source, Slice 10, protected, deployment, or review surface changed.
    - Cleanup: removed temporary `/tmp/festivalarc-*` and `/tmp/festivalarc_*` artifacts; exit 0; no matching temporary artifacts remain. No install, browser, commit, push, PR, or review ran.
    - Rollback: no new continuation change to revert; retain the timed-out candidate dependency state. Risk: Astro displayed its existing TypeScript dependency prompt during the successful build, but no mutation occurred and all bounded checks passed.
    - `next_recommended: parent-lifecycle`; skill resolution: `paths-injected`.

## Slice 10 correction — blocked by pre-existing E2E safety-net failure

### Structured status and boundary

- Consumed authoritative OpenSpec status: `artifactStore: openspec`, `applyState: ready`, `nextRecommended: apply`, `actionContext.mode: repo-local`, workspace `/home/strocs/dev/FestivalARC`, allowed edit root repository, and no blocked reasons.
- Continued the parent-held Slice 10 `size:exception` attempt with token `sha256:fff0e19adc79b09dae23e97fb2ee2a20e4861c87b03a1fe3bf046ac66e052140`; this actor did not acquire or settle it.
- The required review workload decision is resolved as `size:exception`; no production code, task checkbox, deployment, review actor, receipt, or delivery gate was started.

### Safety-net result and disposition

- Required existing `pnpm run test:e2e` safety net failed 1 of 4 Chromium tests before correction: `tests/e2e/publication.spec.ts` expects `meta[name="description"]` to be visible, but metadata is correctly non-visible in the document head. The other 3 tests passed.
- Strict TDD contract requires stopping on a pre-existing failure and forbids fixing that failure in this phase. Therefore no E2E coverage was added, no final command suite was run, and no Slice 10 task was marked complete.
- Correction line count: `0` (maximum authorized: 150). Distinct passing evidence revision/material/hash: none produced because the safety gate blocked implementation.

### Lifecycle and cleanup

- Playwright opened only the configured Chromium process and temporary `python3 -m http.server 4173 --directory .output`; Playwright cleaned both. A post-run process scan found no matching browser/server/test process.
- Removed generated `playwright-report/` and `test-results/`. The intended `.output/` and `.distribution-manifest.json` evidence were retained unchanged.

### Remaining implementation tasks

- All five Slice 10 implementation rows remain unchecked in `tasks.md`; no parent-owned lifecycle row was changed. The exact rows are retained there byte-for-byte.
- Rollback: no source or task changes were made; remove this progress section only. Next recommendation is `parent-lifecycle` after the parent resolves the pre-existing E2E safety-net failure under the applicable authority.

## Slice 10 bounded E2E remediation and closure

- Status consumed: authoritative `openspec`, `applyState: ready`, `nextRecommended: apply`, repo-local `/home/strocs/dev/FestivalARC`, allowed edit root repository, no warnings. Parent token `sha256:c44210c3b93ceba6b814c673aa4cfb069a4efaf5189d7c7d3254e31d0cbd1146` was authenticated; parent settles.
- Workload: Slice/PR 10, `feature-branch-chain`, maintainer-authorized `size:exception`; remediation remained within the remaining 126-line bound and produced no production UI/content change.
- Corrected `tests/e2e/publication.spec.ts`: metadata now asserts `content`, and two causal boundary tests cover calls replacement/no `/ediciones/2026` archive and failed composition preserving the prior artifact. Final E2E: `pnpm run test:e2e` PASS, 6 Chromium tests.
- Final commands: `pnpm type` PASS; `CI=1 pnpm test` PASS; `pnpm turbo run build` PASS (5 tasks); `pnpm build` PASS; distribution type PASS; `CI=1 pnpm --dir tooling/distribution test` PASS (15 tests). A stale generated ARC2024 output caused an initial type timeout; generated build dirs were removed and the required final type run passed.
- Structural closure PASS: `.output` and sibling `.distribution-manifest.json` contain matching 350 paths and 72,025,729 bytes; manifest SHA `6274d391410994cedeb1f72f3d8c2f5017197198e831e876652817d7ae5021ff`, config SHA `9a3c846ccc39015028eb8c2793ef64d3bc7f95d28883a1268f2ba18c5e57f95f`; no public manifest leak, calls archive, or extra `vercel.json`; sole root entry publishes `.output` via `pnpm build`.
- Documentation criterion satisfied by `docs/annual-publishing.md`; all five Slice 10 implementation checkboxes were changed to `[x]` and re-read visibly. No unchecked implementation rows remain; parent lifecycle actions remain deferred.
- TDD Cycle Evidence: RED was the prior invalid `meta` visibility assertion; GREEN was the corrected assertion plus 6/6 E2E and final suite; TRIANGULATE was calls/failure fixture composition plus output/manifest/Vercel structural readback; REFACTOR was test-only with no production refactor.
- Exact continuation delta: `tests/e2e/publication.spec.ts` +43/-1 (44), `tasks.md` +5/-5 (10), no production lines; compact progress evidence appended. Evidence inputs: E2E `sha256:dad66d8bce109dfe2d08cb13828160a354dfc740438e42d7d1fe261d3d1b08a9`, manifest file `sha256:6c5771ac191929a6cb7d702262e2c6a8004fc04ae9f7488e875186188d690c46`, Vercel `sha256:2e3e0d693bf83f6a8545cdd53e31b69d07a1b249497b30f3fb8c6fd9f534f276`; distinct evidence revision `sha256:5e6ba84d4ca303d02ca69f2b5052ee36c38b25bda131c48e5da944f63429db61` (remediates `sha256:044de4c26f33436e7d481a970293f07d20cd6b78286689e20acb6f64db6faf3b`).
- Browser/server lifecycle: Playwright-owned Chromium and `python3 -m http.server 4173 --directory .output` closed by the runner; post-cleanup process scan is empty. Removed generated reports, `test-results`, app build dirs, `.astro`, `.vercel`, and staging; retained intended `.output` and `.distribution-manifest.json`.
- Rollback: revert the E2E assertion/tests and five Slice 10 checkbox changes; retain prior `.output`/configuration if restoring the last known-good artifact. No deployment, commit, push, PR, review, receipt, or delivery gate was performed. Next recommendation: `parent-lifecycle`.

## Slice 10 bounded remediation — build isolation and deterministic ARC2024 output

### Structured status and boundary

- Consumed authoritative OpenSpec status: `artifactStore: openspec`, `applyState: ready`, `nextRecommended: apply`, `actionContext.mode: repo-local`, workspace `/home/strocs/dev/FestivalARC`, allowed edit root repository, and no blocked reasons.
- Continued the parent-acquired remediation attempt with token `sha256:3fdc4f980b4100f3415bb3230c32b56f2868f68517f74b1433972e440ec301d3`; this actor did not acquire or settle it. Bound failed evidence: `sha256:8f12c01e699a4929b62230bbdf81c653517dccf20d4dd00d8112e8f0e6d3baf7`.
- Workload guard: `Decision needed before apply: No`; `Chained PRs recommended: Yes`; `Chain strategy: feature-branch-chain`; `400-line budget risk: High`. Parent supplied the bounded remediation path; no scope expansion occurred.
- No task checkbox changed: all five Slice 10 implementation rows were already checked and were re-read after remediation. Parent-owned lifecycle rows remain byte-for-byte unchanged.

### TDD Cycle Evidence

| Task | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|
| Build-output isolation | New 2023/2024 config tests failed: both resolved `./dist` instead of the requested isolated output; Turbo race reproduced with missing `apps/festival-2023/.astro/ARC23.png`. | Astro distribution builds now use per-process package-local staging, copy to the requested isolated output, and force production mode; focused isolation tests passed. | `pnpm turbo run build` passed 5/5 tasks despite direct app builds running concurrently; no shared 2023 output failure recurred. | Removed obsolete copy/cleanup paths and retained direct builds on normal `dist`.
| ARC2024 deterministic HTML | A two-build test under `NODE_ENV=development` found `server-render-time` and failed byte equality. | Build scripts force `NODE_ENV=production`; the same two-build test passed with no timing attributes. | Two sequential root `pnpm build` runs produced identical manifest SHA `3ed878973468e4163c4643909a3abfa6f84158e5a88985175bbda7b582b3af64`; ARC2024 timing scan found 0 files. | Kept the correction at the build boundary; no edition content or component behavior changed.

### Completed remediation and files changed

- Corrected `apps/festival-2023/astro.config.mjs` and `apps/festival-2024/astro.config.mjs` to accept isolated distribution output directories.
- Corrected both historical build adapters to stage distribution builds in unique package-local directories, avoid mutating shared `dist`/`.astro` state, clean staging in `finally`, and build with `NODE_ENV=production`.
- Added focused isolation tests for both Astro configs and a two-build ARC2024 determinism test; package test scripts now execute them.
- Source/config/test/package remediation accounting: exactly 170 changed lines (additions plus deletions); task checkbox accounting: 0 changed lines. The progress entry is evidence metadata and is counted separately by the parent if total candidate accounting is required. This is below the 200-line remediation bound.

### Verification evidence

- RED commands: `node --test apps/festival-2023/scripts/build-output.test.mjs apps/festival-2024/scripts/build-output.test.mjs apps/festival-2024/scripts/build-determinism.test.mjs` failed 2 isolation assertions; with `NODE_ENV=development`, determinism failed on `server-render-time`.
- GREEN/focused: the same command passed 4/4 tests; `pnpm --dir apps/festival-2023 test` passed 4 tests; `pnpm --dir apps/festival-2024 test` passed 7 tests.
- `pnpm --dir apps/festival-2023 type` passed with 0 errors/0 warnings/2 existing hints; `pnpm --dir apps/festival-2024 type` passed with 0 errors/0 warnings/1 existing hint; distribution type and 15 tests passed.
- `pnpm turbo run build` passed 5/5 tasks. `pnpm build` passed twice; both manifests were byte-identical, 350 output files, and no ARC2024 `server-render-time` attributes remained.
- `pnpm type` passed for all 7 workspace packages; `CI=1 pnpm test` passed 12 files/76 tests. No Firefox, WebKit, browser, E2E, verify, review, receipt, or delivery operation was run.
- Structural readback passed: manifest sorted/hash-valid, `.output` contains 350 files, and no app output/cache directory remains from this remediation. `git diff --check` passed.

### Cleanup, rollback, and remaining work

- No process remains (`chromium`, Playwright, HTTP server, Astro, Vite, and pnpm process scan: 0). Per-process app staging, `dist`, `.astro`, and `.vercel` directories were removed. The pre-existing root `.distribution-build-vrdCUF/` was preserved; intended `.output` and `.distribution-manifest.json` remain.
- Rollback boundary: revert the two Astro output-directory settings, two historical build adapters, three focused test additions/package test entries, and this progress section. No application content or deployment configuration is included.
- All implementation tasks remain checked; parent-owned lifecycle actions remain deferred. No exact unchecked implementation rows remain.
- `next_recommended: parent-lifecycle`; return bounded evidence to the parent for native settlement. This actor did not settle the supplied attempt and did not run final independent SDD verification.

