# FestivalARC annual monorepo and edition publishing

## Intent

Turn FestivalARC from a single-edition Astro site into a repeatable annual publishing system without sacrificing the current Festival ARC 2025 experience. The change will establish one repository and one static Vercel deployment that can publish one active edition at `/`, preserve completed editions at `/ediciones/YYYY`, and support a temporary call-for-submissions application that is replaced rather than archived when its final festival edition is published.

The proposal addresses the operational cost and technical risk of repeating a large manual migration every year: historical editions need to remain navigable, each edition needs to preserve its own identity and framework boundaries, and the final deployment must be assembled predictably instead of depending on whichever application happens to be copied last.

## Problem statement

FestivalARC currently behaves as one Astro application centered on the 2025 edition. Its routes, metadata, navigation, assets, and generated files contain root-path and edition assumptions. That makes it difficult to add annual editions independently, serve archived editions below a path prefix, or replace a temporary call application safely. A naive workspace conversion or recursive copy could introduce broken nested routes, incorrect canonical and social URLs, asset collisions, leaked temporary routes, or regressions in the 2025 site.

The repository needs a durable product and publishing model, not merely a new folder layout:

- final editions must be independently owned and buildable;
- the active edition must be selected explicitly for the deployment root;
- archived editions must work under their assigned year prefixes;
- shared information must not force shared visual identity or global UI;
- the composed static artifact must have deterministic ownership and validation;
- the annual lifecycle must distinguish temporary calls from permanent festival archives.

## Goals

1. Establish a pnpm workspace/Turborepo-oriented structure that can host independent Astro applications for final editions and future years.
2. Preserve Festival ARC 2025 behavior exactly at the root during migration, including its visual output, content, routes, interactions, metadata, assets, static build behavior, and existing test expectations.
3. Publish one explicitly selected active edition at `/` and final historical editions at `/ediciones/YYYY` in a single static Vercel deployment.
4. Make edition routes, assets, canonical URLs, metadata, sitemaps, and navigation base-aware when an edition is published under an archive prefix.
5. Share edition data and configuration contracts where useful, while keeping each edition's UI, navbar, visual identity, dependency choices, and framework boundaries independent.
6. Provide a deterministic, typed distribution composition boundary that validates inputs, destination ownership, collisions, output manifests, and global deployment files rather than blindly copying directories.
7. Support a temporary 2026 calls application with an explicit replacement/removal lifecycle; calls must not become permanent archived editions.
8. Make the migration and future annual work reviewable as bounded slices, respecting the 400 changed-line review budget and the ask-on-risk delivery strategy.

## Non-goals

- Redesigning FestivalARC's visual language, content, interaction model, or edition-specific navbar behavior.
- Introducing a global UI library, global navbar, or shared presentation layer across editions.
- Replacing an edition's Astro, React, Tailwind, state-management, or other dependency choices solely for monorepo consistency.
- Requiring redirects from historical edition URLs that previously lived at the root.
- Archiving the 2026 calls application or treating call routes/data as a permanent annual edition.
- Implementing the final 2026 festival application as part of the temporary calls slice.
- Adding optional web research or changing the accepted Vercel Hobby deployment plan.
- Solving unrelated application refactors, content redesigns, or broad cleanup while migrating.

## Scope boundaries

### In scope

- Repository/workspace boundaries for independent final-edition applications, the temporary calls application, shared data/configuration contracts, and distribution tooling.
- Migration seams needed to move the current 2025 application while preserving its root behavior.
- Import and adaptation of the confirmed 2023 and 2024 edition sources as independently buildable applications, plus a repeatable boundary for future final editions.
- Publication configuration for the active edition, archived edition prefixes, and the temporary-call lifecycle.
- Base-aware URL and asset behavior for root and archived publication contexts.
- A single neutral, self-contained global `404.html` owned by the composed distribution rather than by an arbitrary edition.
- Deterministic static output composition and its validation/reporting contract.
- Compatibility, route, asset, metadata, sitemap, interaction, and deployment verification needed to prove the publishing model.
- Documentation of the annual operational lifecycle: creating calls, replacing calls with the final edition, retaining prior final editions, and adding future editions.

### Out of scope for this proposal

- Exact package names, directory names beyond the confirmed public URL contract, dependency-version policy, or Turborepo task graph details.
- The final collision-resolution algorithm, sitemap merge/relocation mechanics, or the precise distribution manifest schema; these require specification and design follow-up.
- A decision to extract or standardize shared UI. Shared contracts are limited to data/configuration and genuinely cross-edition infrastructure unless later evidence justifies more.
- Any change to protected files or user-owned repository state, including `.gitignore`, `refs/`, and `.pi/`.

## Confirmed business and product rules

| Rule | Required behavior |
|---|---|
| Deployment topology | Use one repository and one static Vercel deployment. |
| Final-edition ownership | Each final edition is an independent Astro application with its own identity, navbar, dependencies, and framework boundaries. |
| Active publication | Publish the explicitly selected active final edition at `/`. During the temporary call period, the call application may be selected for the root publication according to the lifecycle configuration. |
| Archive publication | Publish completed final editions under `/ediciones/YYYY`. The definitive archive path is `/ediciones/{year}`, not `/festivales/{year}`. |
| 2026 calls lifecycle | The 2026 calls application is temporary. When the final 2026 festival publishes, remove/replace the calls application with the final 2026 edition; never permanently archive calls. |
| Shared architecture | Share edition data/configuration and stable contracts, not a global UI or global navbar. |
| URL construction | URLs must be base-aware. Use an equivalent of `import.meta.env.BASE_URL` or a helper; do not rely on naive relative links or assume Astro rewrites literal `href`/`src` values. |
| Legacy URLs | No legacy-root redirects are required; historical root URLs may stop resolving. |
| Error fallback | The composed deployment owns one global neutral, self-contained `404.html` that does not inherit an edition's styles. |
| Current behavior | Festival ARC 2025 at `/` remains behaviorally equivalent during migration unless a separately approved product change says otherwise. |
| Composition | Distribution is deterministic and typed, with explicit validation and ownership rules; blind `cp -r` composition is not acceptable. |
| Delivery | Work is split into reviewable slices. The 400-line review budget and ask-on-risk delivery strategy apply to planning and execution. |
| Verification | Strict TDD is disabled for this change; normal repository tests, builds, and verification remain required. |

## Expected outcomes

After the change is delivered, maintainers should be able to:

1. Build an individual final-edition app without requiring another edition at runtime.
2. Select an active edition and produce one static deployment artifact with that edition at the root.
3. Publish prior final editions beneath `/ediciones/YYYY` with working internal navigation, assets, metadata, and representative routes.
4. Add a future final-edition app without copying another edition's UI ownership or changing unrelated editions.
5. Introduce a temporary calls app, publish it for its active lifecycle, and replace it with the final edition without creating a calls archive path.
6. Detect missing builds, invalid output destinations, path-prefix mistakes, collisions, root-relative references, and global-file ownership violations before deployment.
7. Compare the migrated 2025 root against its pre-migration compatibility baseline and explain any approved difference.

## Affected areas

- **Workspace and build orchestration:** pnpm workspace, task orchestration, package boundaries, and static build coordination.
- **Edition applications:** 2023, 2024, 2025, future final-edition boundaries, and temporary 2026 calls lifecycle.
- **Shared contracts:** edition data/configuration and stable distribution-facing types; no shared global presentation contract is implied.
- **Routing and publication context:** Astro base configuration, internal links, assets, route generation, trailing-slash behavior, canonical URLs, Open Graph metadata, sitemap artifacts, and related static files.
- **Distribution tooling:** typed selection and composition of application outputs into one deployment artifact, including collision and manifest validation.
- **Deployment:** one static Vercel output and ownership of global `404.html`, robots, sitemap, and other root-level artifacts.
- **Quality and operations:** route/output inventory, compatibility baselines, Playwright journeys, normal tests/builds, and annual lifecycle documentation.

## Risks and mitigations

| Risk | Consequence | Mitigation direction |
|---|---|---|
| 2025 behavior changes during extraction | Existing users see regressions at `/`. | Capture a pre-migration route/output and representative journey baseline; migrate in small slices and compare root output before cutover. |
| Root-relative URLs survive migration | Archived pages lose links, assets, or correct metadata. | Treat root and archived prefixes as first-class publication contexts and test generated HTML, assets, navigation, canonicals, and sitemaps under both. |
| Historical apps differ in Astro/build conventions | One compositor contract cannot safely assume identical outputs. | Validate each app independently and define an explicit normalized distribution boundary before composition. |
| Output collisions or nondeterministic overwrite order | The deployment artifact changes based on build order or hides an edition's files. | Use typed ownership, deterministic ordering, collision detection, and reproducible output manifests; never blind recursive copying. |
| Temporary 2026 calls leak into archives | Call content becomes an unintended permanent public edition. | Model calls as a distinct temporary lifecycle and verify replacement/removal behavior at final-publication time. |
| Shared abstractions absorb edition-specific behavior | Editions lose identity or become coupled for future changes. | Share only data/configuration and proven infrastructure; keep UI, navbars, dependencies, and behavior local. |
| Active-edition selection is ambiguous | The wrong edition is published at `/`. | Require explicit, validated selection and record the selected publication context in build/distribution evidence. |
| Legacy source quality varies, especially 2023 | Migration effort expands or hidden runtime assumptions remain. | Keep editions independently reviewable, inventory assumptions early, and isolate compatibility work from compositor and UI refactors. |
| Large mixed pull requests exceed review capacity | Defects become difficult to isolate and rollback. | Plan bounded slices, honor the 400-line review budget, and use ask-on-risk before proceeding when workload grows. |

## Rollback and recovery

Rollback must preserve the currently deployable 2025 experience while the migration is proven. The delivery plan should therefore:

- keep the pre-migration 2025 build and compatibility evidence available as the release baseline;
- introduce workspace, edition, and distribution changes behind reviewable boundaries so an incomplete slice can be reverted without rewriting edition content;
- delay removal of legacy single-app wiring until composed output and 2025 parity are verified;
- allow the deployment to return to the last known-good static 2025 artifact if composition, routing, metadata, or lifecycle validation fails;
- treat a failed composition as a build failure, not as permission to publish a partial artifact;
- make replacement of temporary calls explicit and reversible before final publication, while ensuring rollback does not silently turn calls into a permanent archive.

Detailed rollback commands, data migration mechanics, and cutover sequencing belong in later design and task artifacts rather than this proposal.

## Measurable success criteria

The change is successful when all of the following are demonstrated:

1. **2025 compatibility:** the migrated 2025 app builds and serves at `/`; its existing normal test suite passes, and representative visual/functional journeys and route/output comparisons show no unapproved behavior change.
2. **Independent builds:** each supported final-edition app builds independently, with no runtime dependency on another edition's app.
3. **Publication correctness:** one composed static artifact serves exactly one selected active edition at `/` and final archives at `/ediciones/YYYY` for every configured historical edition.
4. **Prefix correctness:** automated checks cover at least one representative internal route per edition and confirm that its links, assets, canonical metadata, sitemap references, and navigation resolve correctly under its assigned base.
5. **Deterministic composition:** repeated composition from the same inputs produces the same validated output manifest and fails on missing inputs, out-of-destination writes, unowned global files, or collisions according to the later-approved contract.
6. **Global fallback ownership:** the final artifact contains exactly one neutral self-contained `404.html`, and no edition output can overwrite it.
7. **Lifecycle correctness:** the temporary 2026 calls app can be selected during its lifecycle, is absent from permanent archive destinations after replacement, and the final 2026 edition occupies the intended active/archive location when published.
8. **Edition independence:** each edition retains its own visual identity, navbar, framework/dependency boundary, and edition-specific behavior; shared code is limited to approved data/configuration or stable infrastructure.
9. **Deployment readiness:** the single static Vercel deployment consumes only the validated composed artifact, with no source app adapter assumption leaking into the final output.
10. **Operational repeatability:** the documented annual workflow is sufficient for a maintainer to add a future edition, publish it actively, archive a prior final edition, and retire a temporary calls app without inventing undocumented steps.

## Follow-up decision points

The proposal intentionally leaves implementation-level choices for the dependent specification and design phases. Those phases must define, with evidence from the repository and confirmed product rules:

- the exact workspace/package boundaries and dependency ownership policy;
- the publication configuration shape and precedence rules;
- the normalized output and collision/ownership contract;
- sitemap, robots, canonical, and other root-level artifact composition;
- the compatibility oracle and the smallest reviewable migration slices;
- the operational guardrails for the 2026 calls-to-final replacement.

These are design decisions, not unresolved product intent. The confirmed URL model, edition ownership model, deployment topology, calls lifecycle, and 2025 compatibility requirement must not be reopened without an explicit product change.
