# Annual Publishing Specification

## Purpose

Define a repeatable annual publishing model for independent FestivalARC editions, temporary calls applications, and one validated static Vercel deployment while preserving the Festival ARC 2025 root experience.

## Requirements

### Requirement: Independent workspace and edition boundaries

The repository MUST provide a workspace boundary in which each supported final edition is an independently buildable Astro application. Each final edition MUST retain its own visual identity, navigation, routes, dependencies, framework choices, and edition-specific behavior. Shared packages MAY expose edition data, configuration, typed contracts, or genuinely cross-edition infrastructure, but MUST NOT own a global navbar or global edition presentation.

#### Scenario: Build an edition without another edition

- GIVEN a supported final edition and its declared workspace dependencies
- WHEN that edition is built in isolation
- THEN its static output is produced without requiring another edition application at runtime or build time

#### Scenario: Preserve edition ownership

- GIVEN two final editions with different navigation or visual behavior
- WHEN shared contracts are consumed
- THEN each edition retains its own UI and navbar and no shared presentation layer replaces either one

### Requirement: Active and archived publication boundaries

The publishing configuration MUST explicitly select one active publication for `/`. A completed final edition MUST be publishable under `/ediciones/YYYY`, using the definitive `/ediciones/{year}` path. The composed deployment MUST contain only configured active and archive destinations.

#### Scenario: Publish active and historical editions

- GIVEN an explicitly selected active final edition and configured completed editions for 2023 and 2024
- WHEN the distribution is composed
- THEN the selected edition is served at `/`, the completed editions are served at `/ediciones/2023` and `/ediciones/2024`, and each destination is independently navigable

#### Scenario: Reject ambiguous active selection

- GIVEN a publication configuration with no active edition or more than one active edition
- WHEN composition is requested
- THEN composition fails before producing a deployable artifact

### Requirement: Temporary calls lifecycle

A calls application MUST be modeled as temporary and distinct from a final edition. During its lifecycle it MAY be selected for the root publication. When its final festival edition is published, the calls application MUST be removed or replaced and MUST NOT be copied into any permanent `/ediciones/YYYY` destination.

#### Scenario: Replace 2026 calls with the final edition

- GIVEN a root publication using the temporary 2026 calls application
- WHEN the final 2026 edition is published
- THEN the final edition occupies the configured active or archive destination, calls routes and data are absent from the composed artifact, and no permanent calls archive path exists

#### Scenario: Calls are not treated as a final archive

- GIVEN a calls application and an archive configuration
- WHEN archive destinations are validated
- THEN the calls application is rejected as an archive member

### Requirement: Base-aware publication URLs

Every edition MUST construct internal links, navigation links, generated routes, assets, canonical URLs, and social metadata using its publication base. The root publication MUST use `/`; an archived edition MUST use `/ediciones/YYYY`. Implementations MUST NOT rely on naive relative links or on Astro rewriting literal `href` and `src` values.

#### Scenario: Navigate an archived nested route

- GIVEN an edition published at `/ediciones/2024`
- WHEN a visitor opens a representative nested route and follows its navigation and asset references
- THEN links, assets, and route transitions resolve beneath `/ediciones/2024` rather than the deployment root

#### Scenario: Generate publication metadata

- GIVEN the same edition published at root and under an archive prefix
- WHEN its HTML is generated
- THEN canonical, Open Graph, and other absolute publication URLs identify the correct base and never claim an unrelated root or edition URL

### Requirement: Sitemap and robots publication behavior

The composed artifact MUST expose sitemap and robots behavior consistent with the selected publication and configured archives. Sitemap entries MUST use the correct public base for each edition, and robots output MUST belong to the composed deployment rather than being nondeterministically selected from an edition output.

#### Scenario: Validate generated discovery files

- GIVEN an active edition and one or more archived editions
- WHEN the final static artifact is inspected
- THEN sitemap references point to valid published URLs under `/` or `/ediciones/YYYY`, robots references the composed deployment policy, and no source-app root assumptions remain

### Requirement: Typed deterministic composition and ownership

Distribution composition MUST use a typed, validated contract that identifies each input, destination, ownership, and output manifest. It MUST produce the same manifest and equivalent output for the same inputs regardless of build or input enumeration order. It MUST detect missing inputs, writes outside assigned destinations, path traversal, destination collisions, and unauthorized ownership of global files. Blind recursive directory copying MUST NOT be sufficient for a successful composition.

#### Scenario: Compose reproducibly

- GIVEN identical validated edition outputs and publication configuration
- WHEN composition is run twice with different input enumeration order
- THEN both runs produce the same validated output manifest and equivalent file contents and paths

#### Scenario: Fail on invalid input or collision

- GIVEN a missing edition build, an output path outside its assigned destination, or two owners claiming the same destination
- WHEN composition is validated
- THEN it fails with a diagnostic identifying the invalid input or ownership conflict and does not publish a partial artifact

### Requirement: Global deployment file ownership

The distribution layer MUST own exactly one neutral, self-contained `404.html` for the composed deployment. Edition outputs MUST NOT overwrite it. Global robots, sitemap, and other root-level deployment artifacts MUST have explicit ownership and validation.

#### Scenario: Produce the global fallback

- GIVEN any valid set of active and archived edition outputs
- WHEN the distribution artifact is finalized
- THEN exactly one `404.html` exists, it is neutral and self-contained, and it does not depend on an edition stylesheet or UI

### Requirement: 2025 compatibility baseline

The migrated 2025 application MUST remain behaviorally equivalent at `/` to the approved pre-migration baseline unless an explicitly approved product change documents the difference. Compatibility MUST cover routes, rendered content and visual behavior, interactions, metadata, assets, static output behavior, and existing normal test expectations.

#### Scenario: Verify the migrated 2025 root

- GIVEN the captured pre-migration 2025 route/output and representative journey baseline
- WHEN the composed deployment serves 2025 at `/`
- THEN the existing normal tests pass and route, output, metadata, asset, visual, and representative interaction comparisons show no unapproved difference

### Requirement: Independent builds and one static deployment

Each supported final edition MUST have an independently verifiable static build. The deployment process MUST compose exactly one static artifact for one Vercel deployment, and the deployment MUST consume only the validated composed artifact. Source application adapter assumptions MUST NOT create additional deployments or leak into the final distribution contract.

#### Scenario: Build and deploy the composed artifact

- GIVEN independently successful builds for the selected active edition and configured archives
- WHEN the deployment artifact is assembled
- THEN one complete static output is produced for Vercel, with root and archive destinations present and no partial output accepted

### Requirement: Annual operational repeatability

Documentation MUST describe the repeatable lifecycle for creating a temporary calls application, selecting an active edition, replacing calls with its final edition, retaining prior final editions, adding a future final edition, validating publication bases, and recovering from a failed composition. The documented workflow MUST identify required inputs, validation evidence, and the non-archival calls rule without relying on undocumented manual steps.

#### Scenario: Add a future edition

- GIVEN a maintainer following the annual workflow for a new final edition
- WHEN the maintainer adds, independently builds, configures, and validates the edition
- THEN the edition can be published actively or under `/ediciones/YYYY` without changing unrelated edition UI ownership or inventing undocumented steps

### Requirement: Standard verification evidence

Verification MUST use the repository's standard testing and validation capabilities, including normal type checking, unit/integration tests, static builds, and applicable Playwright journeys. Strict TDD is disabled for this change and MUST NOT be treated as an additional workflow requirement. Verification MUST cover independent builds, root and archive route smoke checks, base-aware links and assets, dropdown edition navigation, canonical and social metadata, sitemap and robots behavior, collision and ownership failures, global 404 uniqueness, lifecycle replacement, and 2025 compatibility.

#### Scenario: Complete publication verification

- GIVEN a candidate workspace and distribution configuration
- WHEN standard verification is run
- THEN type checking, normal tests, applicable builds, and representative browser checks report results for every configured edition and publication context, and any failed validation prevents deployment
