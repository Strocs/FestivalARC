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

- [ ] Relocate the existing 2025 Astro routes, features, assets, integrations, React islands, Zustand usage, tests, and configuration into `apps/festival-2025/**` with file-preserving ownership and no cross-edition imports. <!-- sdd-owner: implementation -->
- [ ] Add the 2025 package scripts and approved workspace dependencies, retaining its Astro 5, React, Tailwind, state, and static/Vercel behavior. <!-- sdd-owner: implementation -->
- [ ] Keep root scripts as explicit proxies and retain legacy wiring until composed parity is proven; verify isolated 2025 build/type/test behavior and root route behavior against Slice 1 evidence. <!-- sdd-owner: implementation -->
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
