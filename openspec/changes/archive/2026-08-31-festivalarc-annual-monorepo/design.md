# FestivalARC Annual Monorepo and Publishing Design

## Decision summary

FestivalARC will use a pnpm workspace containing independently owned Astro applications and one root-only distribution package. Each application builds into an isolated static staging directory with an explicit publication base. A typed compositor then validates and assembles exactly one Vercel artifact: the selected active publication at `/`, final editions at `/ediciones/YYYY`, and distribution-owned global discovery/error files.

The first cutover keeps the existing root application and `pnpm build` path intact while workspace metadata is introduced. The 2025 application is moved only after a compatibility baseline exists; the old root behavior remains the release oracle until the composed artifact passes parity checks. No application code is changed by this design artifact.

## Target repository boundaries

```text
/
├── apps/
│   ├── festival-2023/          # final edition; Astro 1.x boundary
│   ├── festival-2024/          # final edition; Astro 4.x boundary
│   ├── festival-2025/          # final edition; current Astro 5 boundary
│   └── calls-2026/             # temporary lifecycle app; never an archive member
├── packages/
│   ├── editions/               # data and publication-context contracts; no UI
│   ├── seo/                    # URL/metadata primitives only; no edition layout
│   ├── analytics/              # optional neutral instrumentation contract
│   ├── tsconfig/               # shared compiler presets only
│   └── test-config/            # shared test configuration primitives only
├── tooling/
│   └── distribution/           # build selection, normalization, validation, compose
├── editions.config.ts          # checked-in publication selection and archive registry
├── pnpm-workspace.yaml
├── turbo.json
├── vercel.json                 # the only deployment entry point
└── .output/                    # disposable composed artifact, never source-owned
```

The exact package names may be adjusted to repository naming conventions, but these ownership boundaries are normative:

- `apps/festival-*` own their routes, layouts, visual system, navbar, content, framework integrations, Astro version, and application dependencies. An edition may consume `@festivalarc/editions` and neutral infrastructure packages, but it must not import another edition's source.
- `apps/calls-2026` is a separate application with `kind: calls`. It owns only temporary call routes and data and has no valid archive destination.
- `packages/editions` contains typed edition descriptors, publication metadata, and the data needed by each local navbar to render its own edition dropdown. It contains no Astro components, CSS, page layout, or global navbar.
- `packages/seo` contains base-aware URL and metadata primitives that are framework-neutral. Version-specific Astro adapters remain inside each app because Astro 1, 4, and 5 APIs and config behavior must not be coupled.
- `tooling/distribution` is the sole owner of output composition, global `404.html`, `robots.txt`, sitemap generation, manifests, and deployment validation. It is a Node/TypeScript package, not an Astro app.
- The workspace root orchestrates packages and owns the Vercel build. It does not become a fourth edition and does not own edition UI.

### pnpm and Turborepo contract

`pnpm-workspace.yaml` includes `apps/*`, `packages/*`, and `tooling/*`. Each app and tool has a `package.json` with a stable package name and scripts such as `build`, `type`, and `test`. Workspace protocol dependencies are used only for approved shared contracts; edition-to-edition dependencies are forbidden by lint/type policy and by the compositor's package selection checks.

Turborepo owns repeatable package execution, not publication semantics. Its graph has these conceptual tasks:

- `type`, `test`, and `build` run per package.
- `build` depends on approved workspace contract builds and uses each app's own Astro configuration.
- `distribution` depends on the selected app build outputs and runs only after configuration validation. The distribution tool invokes the selected package builds with an explicit `PUBLICATION_BASE` and isolated output directory.
- Cache inputs include `editions.config.ts`, the selected publication descriptor, `PUBLICATION_BASE`, package lockfile, and each app's source/configuration. Root and archive builds cannot share a cache entry when their base differs.

The root scripts preserve the existing command names (`pnpm build`, `pnpm type`, `pnpm test`, and `pnpm run test:e2e`) while delegating to the appropriate workspace commands. `pnpm build` remains the compatibility command for the composed publication once cutover is complete.

## Publication model and configuration

`editions.config.ts` is the single checked-in source of truth. There is no implicit “latest” selection and no environment variable that silently overrides `active`. A command may select an alternate config file only through an explicit CLI option for isolated verification; CI and Vercel use the checked-in file. The loaded configuration is schema-validated before any build or output directory is created.

The contract is equivalent to the following typed shape:

```ts
type EditionId = `festival-${number}`
type PublicationBase = '/' | `/ediciones/${number}`

type FinalPublication = {
  kind: 'final'
  id: EditionId
  year: number
  packageName: string
}

type CallsPublication = {
  kind: 'calls'
  id: `calls-${number}`
  year: number
  packageName: string
  expiresWhenFinalPublished: true
}

type PublicationConfig = {
  schemaVersion: 1
  siteOrigin: `https://${string}`
  active: FinalPublication | CallsPublication
  archives: Array<FinalPublication & { base: `/ediciones/${number}` }>
  global: {
    notFound: 'distribution'
    robots: 'distribution'
    sitemap: 'distribution'
  }
}
```

The implementation may use branded constructors rather than expose these exact aliases, but invalid values must be rejected: malformed years, duplicate IDs, duplicate archive years, unknown workspace packages, non-final archive members, more than one active publication, or a calls app in `archives` all fail before composition. The active publication maps to `/`; an archive entry maps only to `/ediciones/${year}`. The configuration digest is recorded in the distribution evidence.

The lifecycle is explicit:

1. **Call period:** add `calls-2026` and set it as the one `active` publication. Completed final editions remain in `archives`; the calls app is not added there.
2. **Final 2026 publication:** independently build and validate `festival-2026`, add it as the selected active final edition or as the configured archive according to the release decision, remove `calls-2026` from the publication configuration, and delete the temporary workspace at the same cutover. The final artifact must contain no calls routes/data and no calls archive path.
3. **Annual rollover:** move the previously active final edition into its `/ediciones/YYYY` entry, select the new final edition at root, build all selected members, and compose atomically. The previous final app remains independently buildable and its archive base remains stable.
4. **Future edition:** add a new independent app, register its final descriptor, verify it first at its intended base, then select it active or archive it. No unrelated app's UI or dependency boundary changes as a consequence.

A composition that has a calls archive member, a missing active member, or a stale calls package after final publication is invalid. Rollback restores the last known-good configuration and `.output` artifact; it never silently converts calls into an archive.

## Application build and Astro-version strategy

Each app retains its own `astro.config.*`, integrations, Tailwind setup, React version, state management, and lockfile-compatible dependencies. The 2025 app keeps the current Astro 5/React/Tailwind/Zustand behavior during extraction. ARC2023 and ARC2024 are adapted at their boundaries instead of being upgraded as a prerequisite; their older Astro versions remain local until a separate change proves an upgrade safe.

The distribution build supplies two explicit values to each app:

- `PUBLICATION_BASE`, either `/` or `/ediciones/YYYY`;
- an isolated static output directory for that app and publication context.

Each app's version-specific configuration maps `PUBLICATION_BASE` to Astro's `base` setting and maps `site` to the configured public origin. Application code constructs all internal URLs through a local helper backed by `import.meta.env.BASE_URL` (or the equivalent value passed by that app's stable adapter). The helper normalizes one leading/trailing slash and returns absolute public paths; it never returns a naive relative path. Route logic that reads `Astro.url.pathname` strips the configured base before comparing route segments.

The normalized build boundary is deliberately independent of Astro's version-specific `dist` layout. An app build adapter records whether its Astro output already includes the base directory, then emits a base-relative normalized tree. The adapter must either strip the one configured base prefix or prove that it is absent; duplicate prefixes, absolute output paths, symlink escapes, and files outside the app's output root fail normalization. The compositor consumes only this normalized tree, so it never guesses whether `dist` from Astro 1, 4, or 5 is safe to copy. An app may retain its current static-compatible Astro/Vercel integration during migration for behavior parity, but adapter metadata, server functions, and deployment settings are not compositor inputs; the root `vercel.json` publishes only the validated `.output` directory as the single static deployment artifact.

The app contract covers:

- page links, dropdown links, form actions, client navigation, redirects, and generated route paths;
- public assets, imported assets, fonts, favicons, `srcset`, CSS `url()` values, and JavaScript URLs;
- canonical, Open Graph, Twitter, JSON-LD, and sitemap-link metadata;
- trailing-slash behavior and nested dynamic/static routes.

Cross-edition links in an edition dropdown are generated from the typed publication registry and are explicitly allowed to target another configured publication base. Ordinary links and assets must remain in the owning base. This distinction prevents an archived page's accidental `/programacion` reference from being mistaken for an intentional link to the active edition.

## Distribution compositor contract

`tooling/distribution` exposes a typed pipeline with separate validation and mutation stages:

```ts
type NormalizedInput = {
  ownerId: string
  kind: 'final' | 'calls'
  sourceRoot: string
  destination: '/' | `/ediciones/${number}`
  base: PublicationBase
  files: ReadonlyArray<{ relativePath: string; bytes: Uint8Array }>
}

type ComposeRequest = {
  config: PublicationConfig
  inputs: ReadonlyArray<NormalizedInput>
  outputRoot: string
  globalFiles: { notFoundHtml: string }
}

type OutputManifestEntry = {
  path: string
  owner: 'distribution' | string
  bytes: number
  sha256: string
}

type ComposeResult = {
  outputRoot: string
  manifest: ReadonlyArray<OutputManifestEntry>
  manifestSha256: string
  configSha256: string
}
```

The public API uses discriminated unions and branded path/base constructors so a calls input cannot be passed where a final archive is expected. Runtime validation remains mandatory because configuration and filesystem data are external inputs.

### Validation rules

1. Validate the publication configuration and resolve every selected package before reading files.
2. Require exactly one active input, require every configured archive input, and reject unconfigured inputs. A missing build is a hard error.
3. Treat all paths as POSIX relative paths after normalization. Reject absolute paths, drive-qualified paths, NUL bytes, `..` segments, backslash traversal, and symlinks that resolve outside the declared source root.
4. Require every normalized input file to map beneath its assigned destination. An archive input cannot write to root; an active input cannot write to `/ediciones/YYYY`; no input can write to a sibling archive or parent directory.
5. Reserve global paths (`404.html`, `robots.txt`, `sitemap-index.xml`, generated sitemap shards, and the distribution manifest/evidence names). Only the distribution owner may create them. Edition outputs cannot overwrite them.
6. Detect every destination collision before writing, including collisions between two owners, duplicate normalized paths from one input, and collisions between generated globals and application files. Equal bytes do not make two owners equivalent; the collision still fails.
7. Allow only regular files and approved directories in normalized inputs. Reject device files, socket files, broken links, and symlink-based aliasing.
8. Scan generated HTML and CSS references. Same-origin absolute references must target the owner's base, a configured cross-edition base, or an explicitly global path. Relative references and root-relative references that escape an archive base fail. External URLs and fragments are handled separately. The scan reports owner, source file, attribute/property, and offending value.
9. Build a sorted candidate manifest before mutation. Sorting uses normalized UTF-8 POSIX path, then owner ID for diagnostics. Hashes use SHA-256 over exact bytes; timestamps, filesystem enumeration order, and host path separators never enter the manifest.

### Atomic composition

Composition writes to a newly created sibling staging directory on the same filesystem, in deterministic path order. It validates and hashes the complete candidate, generates global files, and writes the manifest outside the public tree (for example under a distribution evidence directory). Only after all validation succeeds does it rename the staging directory to `.output` using the platform's atomic directory replacement procedure. The previous `.output` remains untouched if any build, validation, copy, generation, or manifest operation fails. Staging directories are scoped to this operation and cleaned only when their ownership marker proves they are disposable.

The compositor never uses blind recursive copy as its correctness boundary. A low-level copy loop may transfer already-validated bytes, but the operation succeeds only after ownership, traversal, collision, reference, manifest, and global-file checks pass. Repeating composition with identical bytes and configuration produces identical manifest paths, owners, byte counts, and hashes regardless of input enumeration order.

## Global files and discovery metadata

The distribution layer owns one neutral, self-contained `404.html` with inline CSS and no edition asset, font, script, or stylesheet dependency. It is generated once after edition inputs are validated. The output contains exactly one `404.html`; any app-provided 404 is rejected rather than selected.

The distribution layer also owns `robots.txt` and the sitemap family. Individual Astro sitemap artifacts are treated as app build evidence and are not copied into the composed root. The compositor derives the public route inventory from validated emitted HTML files, excluding `404.html`, internal evidence, and non-page assets. It then:

- converts each page path to an absolute URL using `siteOrigin` plus its actual publication base;
- sorts and de-duplicates URLs deterministically;
- writes a deterministic `sitemap-0.xml` (and additional numbered shards only when a fixed entry limit requires them);
- writes one `sitemap-index.xml` referencing those shards with absolute public URLs; and
- writes `robots.txt` with the configured crawl policy and exactly the composed sitemap URL.

Keeping the public name `sitemap-index.xml` preserves the current 2025 metadata contract while removing per-app root assumptions. The compositor validates that every sitemap URL maps to an emitted page and that every configured active/archive base has the expected representative route. Canonical and social URLs remain authored by each edition through the base-aware metadata helper; the compositor verifies them rather than rewriting an edition's identity.

## Migration and cutover sequence

The migration is staged so the current 2025 root remains deployable at every intermediate point:

1. **Baseline:** capture the current 2025 route inventory, normalized static output manifest, HTML/metadata assertions, asset inventory, sitemap/robots/404 evidence, normal test results, and representative Playwright journeys. Preserve the existing `pnpm build` behavior and source tree.
2. **Workspace shell:** add pnpm workspace and Turbo metadata while the current app remains the root package. Root `pnpm build`, type checking, tests, and local development must remain unchanged. This is scaffolding, not a publication cutover.
3. **2025 boundary:** move the current app into `apps/festival-2025` with file-preserving mechanical changes, keep a root command proxy, and compare its root output and journeys with the baseline. Do not remove legacy wiring yet.
4. **Contracts and shadow composition:** add typed edition/publication contracts and the compositor test harness. Build only 2025 at `/` into a shadow `.output`; do not change Vercel's output until parity and failure behavior are proven.
5. **Base adaptation:** replace 2025 root assumptions with explicit base-aware helpers while preserving rendered root values. Verify root first, then verify the same app under a temporary archive base. Approved differences are recorded against the baseline rather than silently ignored.
6. **Historical editions:** import ARC2023 and ARC2024 as independent apps, normalize their build outputs, and validate representative routes at `/ediciones/2023` and `/ediciones/2024`. Their migration is isolated from the 2025 compatibility boundary.
7. **Calls lifecycle:** add the temporary calls app and configuration validation for root selection. Add replacement tests that prove calls cannot enter archives and disappear when the final edition is selected.
8. **Deployment cutover:** configure the single root Vercel project to run the distribution build and publish `.output`. Only after the composed artifact passes all checks is legacy single-app Vercel wiring removed. A failed composition is a failed build, never a partial deployment.
9. **Operational handoff:** document the annual configuration/build/verification/rollback procedure and retain the 2025 baseline as the compatibility oracle.

Rollback at any stage is a revert to the last known-good root package or composed `.output`; no stage requires rewriting edition content. The final Vercel cutover can be reverted independently of application extraction.

## Verification and compatibility oracle

Strict TDD is disabled for this change. Verification uses the repository's standard mode and does not add a RED/GREEN/TRIANGULATE/REFACTOR gate. The normal evidence plan is:

- `pnpm type` for root and workspace TypeScript checks;
- `pnpm test` for Vitest and Testing Library suites, with edition-specific test projects run independently where present;
- `pnpm build` for the compatibility command and `pnpm turbo run build` for independent package builds;
- distribution unit/integration tests for schema validation, traversal, ownership, collisions, deterministic manifests, atomic failure behavior, route/reference scanning, sitemap/robots/404 generation, and calls replacement;
- `pnpm run test:e2e` against the composed static artifact (or its preview server) for `/`, one nested route per configured edition, archive navigation, the edition dropdown, representative interactions, assets, 404, canonical/social metadata, sitemap, and robots behavior.

The 2025 oracle compares the pre-migration and post-cutover root using four layers:

1. route/status and emitted-path inventory;
2. normalized HTML assertions for content, metadata, links, and asset references;
3. byte/hash comparison for stable static assets and a documented normalization of known build-generated nondeterminism; and
4. screenshots plus Playwright interaction journeys for the homepage, navigation, schedule behavior, and other existing representative flows.

A difference is either a failure or an explicitly recorded product-approved exception. The oracle does not accept a visual-only match when routes, metadata, or assets changed. Archive checks additionally assert that all internal references stay under the archive base except typed cross-edition navigation, and that no generated output contains a calls route after final replacement.

## Reviewable delivery boundaries

These are architectural review boundaries, not implementation tasks. Each boundary is intended to stay within the 400 changed-line review budget; large historical content/assets or a boundary that forecasts over budget must be split and surfaced through the configured `ask-on-risk` strategy before implementation:

1. workspace shell and root command preservation;
2. compatibility baseline and 2025 package boundary;
3. publication contracts and configuration validation;
4. compositor normalization, ownership, and deterministic manifest core;
5. global files, sitemap/robots, and reference validation;
6. 2025 base-aware adaptation and shadow composition;
7. ARC2023 independent application/import;
8. ARC2024 independent application/import;
9. temporary calls package and replacement/removal lifecycle;
10. one-artifact Vercel cutover and operational documentation.

No boundary may mix broad UI redesign with workspace/compositor semantics. If an import or migration exceeds the budget because of source volume, it remains a separately reviewable edition boundary rather than being hidden inside the compositor or 2025 cutover.

## Tradeoffs and rejected alternatives

| Decision | Tradeoff | Rejected alternative and reason |
|---|---|---|
| Independent app per final edition | More package/build configuration and repeated local fixes | One shared app with a year switch would couple visual identity, dependencies, and route behavior and would violate edition ownership |
| Shared data/configuration, no shared UI | Some duplicated navigation/layout code remains | A global navbar/design system would make historical identity and independent evolution harder |
| Checked-in explicit active selection | Annual rollover requires a deliberate config change | “Latest year wins” or environment-only selection is ambiguous and not reproducible |
| Distribution-owned globals | Sitemap/404 generation is centralized and must understand all outputs | Copying each app's globals creates collisions and order-dependent behavior |
| Compositor-generated merged sitemap | Per-app sitemap conventions do not need to match across Astro 1/4/5 | Relocating opaque sitemap files risks wrong bases, stale routes, and inconsistent index names |
| Per-app Astro version boundaries | Older editions can be migrated without speculative upgrades | A repository-wide Astro upgrade expands scope and can change historical rendering |
| Explicit base helper plus Astro `base` | All URL authors must use the helper; static scanning is required | Naive relative links fail from nested routes, and literal `href`/`src` values are not reliably rewritten by Astro |
| Atomic staged directory replacement | Requires temporary disk space and platform-specific replacement code | In-place recursive copying can leave a partially published artifact after any failure |
| Root Vercel static artifact | One deployment has a single reliable output contract | Deploying each edition separately violates the single-deployment requirement; using an app adapter's output directly lets source-specific assumptions leak into delivery |
| Bounded migration slices | The complete migration takes more reviews and coordination | One large monorepo PR exceeds the 400-line review budget and makes parity failures difficult to isolate |

## Operational recovery

A maintainer diagnoses failures from the typed validation error and manifest evidence, fixes the configuration or app build, and reruns the full composition. The previous artifact remains deployable while staging fails. If a final-publication replacement fails, retain the prior active/archive configuration and do not delete the calls app until the final app has independently built and the replacement validation has passed; once the final cutover succeeds, remove the calls package/config entry as one reviewed lifecycle boundary. No manual copying into `.output` is part of the supported workflow.
