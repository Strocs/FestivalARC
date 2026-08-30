# FestivalARC Annual Monorepo and Publishing — Implementation Tasks

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 1,880–3,660 authored lines across the ten slices; historical file moves/imported assets are additional and measured separately |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 → PR 4 → PR 5 → PR 6 → PR 7 → PR 8 → PR 9 → PR 10 |
| Delivery strategy | chained PRs selected through ask-on-risk |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No — resolved as chained PRs
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High, contained through per-slice PR boundaries

Maintainer-approved Slice 2 size exception: `size:exception`. File-preserving moves/assets measured 14,908 changed lines; this recovery is authorized within the parent-held 20,000-line runtime bound. The exception applies only to the existing Slice 2 extraction candidate and does not expand scope or authorize Slice 3 work.

The forecast exceeds the review budget because the work includes a compatibility baseline, workspace extraction, three historical/temporary applications, typed distribution tooling, URL adaptation, deployment wiring, tests, and operations documentation. The range is the arithmetic sum of the ten per-slice authored-line estimates; historical file moves and imported assets are excluded from that authored-line total and must be measured separately. Apply must implement only the next dependency-ready slice and follow the selected feature-branch chain.

## Execution rules

- Keep each slice independently reviewable and rollback-safe; include causal tests and documentation in the same slice.
- Do not edit `.gitignore`, `refs/`, `.pi/`, or unrelated application behavior.
- Preserve the existing root 2025 build until composed output and parity evidence pass.
- Use the exact repository commands from `openspec/config.yaml`: `pnpm type`, `pnpm test`, `pnpm build`, `pnpm run test:e2e`.
- Every slice must report changed-line count, verification evidence, and rollback boundary before it is considered complete.

## Slice 1 — Compatibility baseline and workspace shell

**Allowed edit surfaces:** baseline evidence under the change or designated test/evidence directory; root `package.json`, `pnpm-workspace.yaml`, `turbo.json`, shared root TypeScript/configuration files only. Do not move application source yet.

**Start:** current single Astro application and passing existing root commands. **Finish:** reproducible 2025 baseline exists and workspace metadata is present without changing root behavior. **Rollback:** revert only baseline/workspace metadata; the original root app remains deployable. **Estimate:** 80–160 changed lines, excluding captured binary/screenshot artifacts.

- [x] Capture route/status inventory, emitted static paths, assets, metadata, sitemap, robots, 404, normal test/build results, and representative Playwright journeys for the current 2025 root; store machine-readable evidence and identify approved normalization rules. <!-- sdd-owner: implementation -->
- [x] Add pnpm workspace discovery for `apps/*`, `packages/*`, and `tooling/*`, plus conceptual Turbo task configuration and root command proxies while preserving `pnpm build`, `pnpm type`, `pnpm test`, and `pnpm run test:e2e`. <!-- sdd-owner: implementation -->
- [x] Verify the unchanged root application with `pnpm type`, `pnpm test`, `pnpm build`, and applicable Playwright journeys; record the baseline and rollback evidence. <!-- sdd-owner: implementation -->

## Slice 2 — 2025 application boundary

**Allowed edit surfaces:** `apps/festival-2025/**`, root command/config proxies, and compatibility tests/evidence. Do not remove legacy wiring or change visual/product behavior.

**Depends on:** Slice 1. **Start:** baseline and root workspace shell. **Finish:** 2025 is independently buildable as an app and root commands still use the compatibility path. **Rollback:** restore the pre-move root source tree and proxies. **Estimate:** 150–300 changed lines plus file moves; split if the measured diff approaches 400 lines.

- [x] Relocate the existing 2025 Astro routes, features, assets, integrations, React islands, Zustand usage, tests, and configuration into `apps/festival-2025/**` with file-preserving ownership and no cross-edition imports. <!-- sdd-owner: implementation -->
- [x] Add the 2025 package scripts and approved workspace dependencies, retaining its Astro 5, React, Tailwind, state, and static/Vercel behavior. <!-- sdd-owner: implementation -->
- [x] Keep root scripts as explicit proxies and retain legacy wiring until composed parity is proven; verify isolated 2025 build/type/test behavior and root route behavior against Slice 1 evidence. <!-- sdd-owner: implementation -->

## Slice 3 — Shared contracts and publication configuration

**Allowed edit surfaces:** `packages/editions/**`, `packages/seo/**` (URL/metadata primitives only), `editions.config.ts`, contract/configuration tests, package metadata. No Astro components or global navbar.

**Depends on:** Slice 2. **Start:** workspace can build 2025. **Finish:** typed descriptors and schema validation reject invalid publication selections before output creation. **Rollback:** remove shared packages/config and retain the Slice 2 root app. **Estimate:** 180–300 changed lines.

- [ ] Define branded publication bases, final/calls descriptors, publication configuration, configuration digest inputs, and distribution-facing discriminated unions without exposing edition UI. <!-- sdd-owner: implementation -->
- [ ] Implement schema validation for exactly one active member, valid years/IDs, unique IDs/archive years, known workspace packages, final-only archives, explicit global ownership, and calls exclusion from archives. <!-- sdd-owner: implementation -->
- [ ] Implement framework-neutral base-aware URL and metadata primitives for canonical, Open Graph, Twitter, JSON-LD, and sitemap-link values; test root and `/ediciones/YYYY` results and intentional cross-edition links. <!-- sdd-owner: implementation -->
- [ ] Add contract/configuration tests covering valid active/archive/calls lifecycle configurations and every specified invalid configuration diagnostic. <!-- sdd-owner: implementation -->

## Slice 4 — Normalized build boundary and compositor core

**Allowed edit surfaces:** `tooling/distribution/**`, compositor fixtures/tests, package scripts required to invoke the tool. Do not change Vercel deployment yet.

**Depends on:** Slice 3. **Start:** typed config and contracts. **Finish:** validated normalized inputs can be composed atomically with deterministic manifests. **Rollback:** remove the shadow compositor; no deployed output changes. **Estimate:** 250–400 changed lines; split normalization and composition if needed.

- [ ] Implement app build adapters that pass `PUBLICATION_BASE` and isolated output directories, normalize Astro-version-specific output into base-relative regular files, and reject duplicate prefixes, absolute paths, symlink escapes, and files outside source roots. <!-- sdd-owner: implementation -->
- [ ] Implement typed input loading that requires exactly one active input and every configured archive, rejects missing/unconfigured inputs, and prevents calls inputs from archive destinations. <!-- sdd-owner: implementation -->
- [ ] Implement traversal/path validation for POSIX normalization, absolute/drive/NUL/backslash/`..` rejection, approved regular files, and symlink/device/socket/broken-link rejection. <!-- sdd-owner: implementation -->
- [ ] Implement destination ownership and collision validation, sorted SHA-256 output manifests, config digest recording, and deterministic results independent of input enumeration order. <!-- sdd-owner: implementation -->
- [ ] Implement sibling staging and atomic replacement so any validation, copy, generation, or manifest failure leaves the prior `.output` untouched; test partial-output prevention and disposable staging cleanup. <!-- sdd-owner: implementation -->
- [ ] Add unit/integration fixtures for valid root/archive composition, missing builds, traversal, out-of-destination writes, duplicate paths, collisions, nondeterministic input order, and atomic failure behavior. <!-- sdd-owner: implementation -->

## Slice 5 — Global files, references, and discovery metadata

**Allowed edit surfaces:** `tooling/distribution/**`, global-file fixtures/tests, generated evidence schema. Keep global ownership in distribution only.

**Depends on:** Slice 4. **Start:** compositor core validates candidate files. **Finish:** globals and emitted references are validated and generated deterministically. **Rollback:** revert the discovery/global stage while retaining normalized app builds. **Estimate:** 220–350 changed lines.

- [ ] Generate exactly one neutral self-contained distribution-owned `404.html` with inline CSS and reject every app-provided 404 or global overwrite. <!-- sdd-owner: implementation -->
- [ ] Build the public route inventory from validated emitted HTML, exclude 404/evidence/non-page assets, generate sorted de-duplicated `sitemap-0.xml` shards and `sitemap-index.xml` with absolute URLs, and generate distribution-owned `robots.txt` with exactly the composed sitemap URL. <!-- sdd-owner: implementation -->
- [ ] Implement HTML/CSS reference scanning for archive-base escapes, invalid root-relative/relative references, allowed configured cross-edition bases, explicit global paths, external URLs, and fragments; report owner, source, attribute/property, and value. <!-- sdd-owner: implementation -->
- [ ] Add tests for global-file uniqueness/ownership, sitemap and robots URL correctness, route inventory validation, reference failures, deterministic manifests, and representative root/archive bases. <!-- sdd-owner: implementation -->

## Slice 6 — 2025 base adaptation and shadow composition

**Allowed edit surfaces:** `apps/festival-2025/**`, `packages/seo/**` adapters if required, 2025 tests/evidence, shadow distribution configuration. Do not cut over Vercel.

**Depends on:** Slices 4–5. **Start:** 2025 package and shadow compositor. **Finish:** 2025 works at `/` and a temporary archive base with no unapproved compatibility difference. **Rollback:** restore 2025 URL/configuration code and keep legacy root deployment path. **Estimate:** 180–350 changed lines.

- [ ] Replace hard-coded root links/assets, route comparisons, form actions, redirects, generated routes, metadata, social URLs, and sitemap assumptions with the app-local base helper and Astro-version adapter. <!-- sdd-owner: implementation -->
- [ ] Preserve edition-local navbar and interactions while generating typed cross-edition dropdown targets from the publication registry; verify trailing-slash and nested-route behavior. <!-- sdd-owner: implementation -->
- [ ] Build 2025 at `/` and a temporary `/ediciones/2025` context, then compare routes, normalized HTML, stable assets, metadata, screenshots, and Playwright interactions against the captured baseline; document only approved differences. <!-- sdd-owner: implementation -->
- [ ] Run `pnpm type`, `pnpm test`, `pnpm build`, distribution checks, and applicable Playwright evidence for both publication contexts. <!-- sdd-owner: implementation -->

## Slice 7 — Independent ARC2023 application

**Allowed edit surfaces:** `apps/festival-2023/**`, its package/configuration/tests/assets, registry entry, and import evidence. Do not modify 2024/2025 UI ownership.

**Depends on:** Slice 4 and the normalized base contract. **Start:** confirmed ARC2023 source available. **Finish:** independently buildable final app at `/ediciones/2023`. **Rollback:** remove only the 2023 package and registry entry. **Estimate:** 250–600 changed lines/assets; split source import from base adaptation if over budget.

- [ ] Import ARC2023 as an independently owned Astro application, preserving its Astro/version/dependency/framework boundary, routes, visual identity, navbar, content, and behavior without importing another edition source. <!-- sdd-owner: implementation -->
- [ ] Add its build adapter and base-aware route, asset, navigation, canonical/social metadata, sitemap-link, and trailing-slash handling for `/ediciones/2023`. <!-- sdd-owner: implementation -->
- [ ] Register and independently build the app, validate representative nested routes/assets/metadata, and add the normal type/test/build/browser evidence required by the repository. <!-- sdd-owner: implementation -->

## Slice 8 — Independent ARC2024 application

**Allowed edit surfaces:** `apps/festival-2024/**`, its package/configuration/tests/assets, registry entry, and import evidence. Do not modify 2023/2025 UI ownership.

**Depends on:** Slice 4 and the normalized base contract. **Start:** confirmed ARC2024 source at `origin/2024`. **Finish:** independently buildable final app at `/ediciones/2024`. **Rollback:** remove only the 2024 package and registry entry. **Estimate:** 250–600 changed lines/assets; split source import from base adaptation if over budget.

- [ ] Import ARC2024 as an independently owned Astro application, retaining its local Astro/dependency/framework choices, routes, visual identity, navbar, content, and behavior. <!-- sdd-owner: implementation -->
- [ ] Add its build adapter and base-aware links, assets, generated routes, metadata, social URLs, sitemap-link, and trailing-slash behavior for `/ediciones/2024`. <!-- sdd-owner: implementation -->
- [ ] Register and independently build the app, validate representative nested routes/assets/metadata, and add normal type/test/build/browser evidence without coupling it to another edition. <!-- sdd-owner: implementation -->

## Slice 9 — Temporary 2026 calls lifecycle

**Allowed edit surfaces:** `apps/calls-2026/**`, publication configuration/schema tests, lifecycle fixtures and documentation adjacent to this behavior. Do not create a permanent calls archive.

**Depends on:** Slice 3 and Slice 4. **Start:** validated calls descriptor support. **Finish:** calls can publish at root temporarily, are rejected from archives, and disappear during final replacement. **Rollback:** restore the prior configuration and retain calls only as a temporary active app; never archive it. **Estimate:** 140–280 changed lines.

- [ ] Add `apps/calls-2026` as a separate `kind: calls` application owning only temporary call routes/data and no final-edition archive contract. <!-- sdd-owner: implementation -->
- [ ] Add lifecycle configuration and validation for calls-root selection, final-edition replacement, calls package/config removal, and rejection of stale calls inputs or calls archive members. <!-- sdd-owner: implementation -->
- [ ] Add composition tests proving calls routes/data are absent after final replacement, no calls archive path exists, and failed replacement retains the prior valid configuration/artifact without silent conversion. <!-- sdd-owner: implementation -->
- [ ] Independently verify calls root publication, base-aware links/assets, and normal type/test/build evidence while keeping the final-publication path reversible. <!-- sdd-owner: implementation -->

## Slice 10 — Single static deployment, cutover, and operations

**Allowed edit surfaces:** root `vercel.json`, root/package build scripts, deployment configuration, operational documentation, end-to-end tests/evidence, and removal of superseded deployment wiring only after parity. Do not modify protected files.

**Depends on:** Slices 5–9 and passing 2025 parity. **Start:** all selected apps build and composition is validated. **Finish:** one Vercel static deployment consumes only validated `.output`, and maintainers have a repeatable annual procedure. **Rollback:** restore prior root Vercel wiring and last known-good 2025 artifact/configuration; leave failed staged composition unpublished. **Estimate:** 180–320 changed lines.

- [ ] Wire the root build to validate configuration, build selected active/archive members, compose atomically, and publish only `.output`; ensure source-app adapters/server settings cannot create additional deployments or enter the distribution contract. <!-- sdd-owner: implementation -->
- [ ] Configure the single root `vercel.json` entry point and remove legacy single-app deployment wiring only after composed artifact validation and 2025 parity evidence pass. <!-- sdd-owner: implementation -->
- [ ] Add Playwright coverage for root and archive smoke routes, nested navigation, edition dropdown, representative interactions, assets, 404, canonical/social metadata, sitemap, robots, calls replacement, and failure-prevents-deployment behavior. <!-- sdd-owner: implementation -->
- [ ] Run final `pnpm type`, `pnpm test`, independent `pnpm turbo run build`, `pnpm build`, distribution tests, and `pnpm run test:e2e`; retain route/output/manifest and compatibility evidence. <!-- sdd-owner: implementation -->
- [ ] Document the annual workflow for creating calls, selecting active publication, archiving prior finals, adding a future edition, validating bases, replacing/removing calls, required evidence, and rollback after failed composition. <!-- sdd-owner: implementation -->

## Parent-owned lifecycle gates

**Before delivery:** Follow the selected PR strategy and ordinary repository policy. Receipt-driven review is opt-in and is not inherently required; start or reuse a bounded receipt-driven review only if the user explicitly enables it, then record its outcome before delivery.
**Before apply:** The maintainer selected chained PRs with `feature-branch-chain`. Apply only the next dependency-ready slice; the PR boundaries and 400-line review budget remain binding.
