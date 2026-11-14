# ARC 2026: category routes, day filters and animated artist modal

**Stage 1 status: T1 category routes/navigation and T2 shared animated modal are implemented; T2 is not visually verified. Stage 2 day filters/recomposition remain planned.**

Implementation authority: [stage-1 ODD task](../../odd/tasks/arc2026-modal-categories.md), authorized by “No hay más preguntas, puedes comenzar”. `PosterGrid.astro` includes one native dialog and escaped inert templates for its page participants. `event-modal.ts` owns focus, scroll, interruption and fallback navigation; `event-modal-motion.ts` owns the reversible GSAP surface/title/details score. Static canonical anchors and direct-load details remain intact. Ticket policy is reused from the existing build/render boundary; no client catalog/schema import or day/filter implementation is introduced. Deterministic mocked tests, lint and build are engineering evidence, not visual or native-browser proof.

The catalog-only authorization language and future-tense route/modal descriptions below are retained planning provenance, superseded for stage 1 by the ODD authorization/status above; they do not reopen accepted D1–D20 requirements. Filter descriptions remain future scope. Planned artist details open in a centered modal, visually growing from the activated artist surface and reversing to that source on close. This replaces planned inline expansion, not the poster's existing static layout. Future category listings and detail fallbacks use `/<public-category-slug>/` and `/<public-category-slug>/<participant-id>/`; D20 confirms the public mapping below, separate from raw category keys and discipline IDs. Listings reuse the same poster grid for category members only. Day filters remain a separate, later feature; details-first delivery is confirmed. No modal, category rendering/navigation or route migration is implemented or authorized by the catalog unit.

Decision tracking and engineering proposals: [implementation decision plan](../plans/arc2026-artist-interactions.md). Confirmed product behavior below is distinct from recommended engineering approaches and pending choices. The catalog unit authorizes its data/schema/tests/docs and focused tests, edition suite, targeted lint and edition build only; no server, browser or visual verification.

## 1. Current decision boundary

| Confirmed behavior / retained constraint | Recommendation or pending choice |
| --- | --- |
| Details first (D1); one modal only (D3). | D12 approved: Astro renders content; one shared TypeScript controller coordinates modal, filters and GSAP on every event-grid page, reusing pure geometry with no React or new dependencies. |
| Activated magenta–rose artist surface visually grows/moves to a central modal, coordinating header, details and opacity with GSAP; close reverses toward its original source. | Inner surface transform/clip choreography; exact timing/easing remains proposed (D6). No new brand tokens. |
| Detail open/close leaves grid geometry, reserved lower tiles and following mobile content unchanged. | Retain the source DOM and existing static reservations; no repacking for details. |
| Close button and deliberate outside/backdrop click close the modal; no other card or filter can be activated while it is active. | Native `<dialog>.showModal()` for top layer, inert background and focus containment; Escape closes accessibly. Keep it modal throughout reverse. |
| Name, discipline/company and schedule at top; description primary; optional image secondary; ticket and close reachable (D7). Centered responsive modal with exterior mobile margins; image beside text on desktop and above it on mobile (D8). | Exact numeric dimensions and image-height limits remain implementation tuning; no full-screen mobile panel. |
| Day options `Todos`, `Sábado`, `Domingo`, initially Todos; bottom-centered floating bar (D2). | Day state is client-local only (D11): no query parameters, path/hash changes or browser-history entries; fresh load starts at Todos. Explicit day-string mapping is a D4 engineering proposal, not a product gate. |
| Preserve ascending artist order, tile visual identity and filter reading context (D10). Excluded artists fade, survivors/decorations slide via GSAP FLIP, entrants fade with overlap. | D5 resolves homepage information-block recomposition with artists/motifs in the same GSAP flow, avoiding fixed-coordinate long empty tracts while preserving content/readability/order and collision-safe geometry; Todos restores the exact original baseline including information positions. Precise anchors, tile matching and filter timing remain engineering proposals. |
| Category pages reuse the same poster grid/layout/components and show only category members, including artists outside the homepage music/stage set (D13/D19). | Four stored category names/memberships and the hero business rule are settled; D20 resolves public category slugs, not discipline IDs. D16 confirms category-name heading and category events only: no homepage-only informational blocks or their reservations/holes; normal decorative filling, shared chrome and artist envelopes remain. |
| Enhanced click opens the modal; no JS/failed enhancement follows a normal anchor to the future canonical public-category-slug/participant-id static detail (D9/D19/D20). | D15 resolves later removal of current `/artistas/[slug]` routes without aliases or redirects: the site is not in production. Migration is not implemented. `/evento/` was not selected. |
| Category navigation changes route; day filtering is a separate client interaction (D11/D20). | D14 confirmed: `baseScope AND activeDay`; show controls only when the unfiltered page scope contains events on both festival days. Single-day or empty scopes omit controls. Day filtering leaves URL/history unchanged (confirmed D11); modal opening/closing also leaves URL/history unchanged (confirmed D11). |

**Superseded:** inline envelope expansion, lower-tile withdrawal, mobile detail push, desktop-inline overflow fallback, simultaneous A-close/B-open, and filter retain/exclude-open-detail logic. Modal UI prevents those concurrent card/filter interactions. This does not approve deleting unrelated features, helpers or static reserved grid space. D15 separately approves legacy-route removal during later authorized migration, not this documentation task.

## 2. Goals, exclusions and source baseline

### Goals

- Reveal real artist details in a centered, reversible modal that preserves the poster's approved magenta–rose identity.
- Keep one active modal, safe interrupted transitions, keyboard access and immediate equivalent reduced-motion endpoints.
- Later shorten lineup traversal with day filters, retaining order, deterministic decoration and reading position.
- Keep details independently deployable without requiring filter UI.

### Non-goals

No interaction-feature implementation, further dataset/schema expansion, dependency changes, fabricated biographies, new visual tokens, route deletion in this catalog unit, grid redesign, mobile grid growth for details, ScrollTrigger or perpetual animation. Later authorized migration must remove legacy routes without aliases or redirects under D15. No automatic delivery of modal, category routes or day filters, new ODD tracker, reopening completed ODD work, commits or publishing. Choosing GSAP does not guarantee performance or eliminate all scrolling: long modal content still needs usable internal scrolling.

### Existing source facts

Paths are relative to `apps/festival-2026/`. These links identify existing responsibilities, not implemented modal behavior.

| Source | Responsibility / boundary |
| --- | --- |
| [`src/content/artists.json`](../../apps/festival-2026/src/content/artists.json) | Four named categories: music 30, stage 16, expo 8, market 39. Hero retains all 46 music/stage works, orders 1–23 `Sábado 28`, 24–46 `Domingo 29`. Expo splits 4/4 and market 20/19 in existing array order; all `23:00`. These are provisional testing assignments, not a confirmed schedule. Descriptions empty, images null; music/stage tickets null, some companies. |
| [`src/content/disciplines.json`](../../apps/festival-2026/src/content/disciplines.json) | Seven discipline IDs/display names, separate from the four categories; music/stage `disciplines` is one ID, not an array. No discipline assignment is inferred for expo/market. |
| [`src/features/artists/artists.ts`](../../apps/festival-2026/src/features/artists/artists.ts) | Build-only Astro/Zod validation, unique IDs/orders, new ascending-order array. Never import into the browser bundle. |
| [`src/pages/index.astro`](../../apps/festival-2026/src/pages/index.astro) | Page-authored information placements, 4/6/10-column layouts, shared motif selection and static markup. Use these placements, not similarly named presets. |
| [`src/features/poster/poster-grid.ts`](../../apps/festival-2026/src/features/poster/poster-grid.ts) | Existing pure `calculatePosterLayout`: validation, protected envelopes, artists/motifs/row count. Reuse its invariants rather than fork packing logic. |
| [`src/features/poster/poster.ts`](../../apps/festival-2026/src/features/poster/poster.ts) | Range/preset types, slot dimensions and canonical motif metadata; mobile starts at row 4; page overrides several information positions. |
| [`src/features/poster/poster-motif-distribution.ts`](../../apps/festival-2026/src/features/poster/poster-motif-distribution.ts) | Deterministic `selectPosterMotifs`, one sequence indexed across all three layouts together. |
| [`src/features/poster/ArtistName.astro`](../../apps/festival-2026/src/features/poster/ArtistName.astro) | Current whole-card button shell, name/meta, fit rules and hover/focus transforms; no detail action yet. |
| [`src/features/poster/artist-name.ts`](../../apps/festival-2026/src/features/poster/artist-name.ts) | Static Poppins 900 metrics and name compositions; reuse fitting. |
| [`src/features/poster/PosterPattern.astro`](../../apps/festival-2026/src/features/poster/PosterPattern.astro) | Canonical SVG definitions; preserve their geometry. |
| [`src/pages/artistas/[slug].astro`](../../apps/festival-2026/src/pages/artistas/[slug].astro) | Current-source prerendered `/artistas/[slug]` routes, not the confirmed future canonical family. D15 requires removal during later authorized migration, without aliases or redirects; retain current source unchanged during this documentation task. |
| [`package.json`](../../apps/festival-2026/package.json) | Declared GSAP `^3.15.1`; existing edition commands; no current 2026 GSAP integration. |

### Current catalog contract — D19

`participantCatalog` validates four category objects with stored `name` and ordered `participants` arrays:

| Raw key | Stored category name | Members | Saturday / Sunday |
| --- | --- | --- | --- |
| `music` | Música | 30 | 15 / 15 |
| `stage` | Artes Escénicas | 16 | 8 / 8 |
| `expo` | Expo Arte.Co | 8 | 4 / 4 |
| `market` | Mercado Creativo y DAZ | 39 | 20 / 19 |

All participants require `id`, `name`, string `description`, `date: { day, time }` with nonempty editable strings (no datetime parsing), and nullable `image: { url, alt }` with nonempty string URL and string alt. Expo/market now supply these detail fields with empty description/null image defaults; their first `ceil(n/2)` members use `Sábado 28`, the remainder `Domingo 29`, all `23:00`. IDs, names, membership and array order are retained. They have no added `order`, `ticketUrl`, category or discipline fields.

Music/stage additionally retain optional `company`, unique ascending performer `order`, one catalog `disciplines` ID and nullable string `ticketUrl`. Music alone requires boolean `national` (18 true, 12 false), explicitly renamed from `featured` with every value preserved. It means national status, never hero selection; old `featured` and `group` keys are rejected. All participant IDs are unique globally.

**Hero business rule:** only music and stage, all 46 works in existing mixed editorial order, irrespective of `national`. This is not a temporary selection heuristic or unresolved schema dependency. The `artists` export and existing artist routes still use this set. Categories and the separate seven-entry discipline catalog must not be conflated. D20 resolves the separate public route mapping; it is not currently stored in the catalog or implemented. Internal category keys and the separate discipline catalog remain unchanged. Detail defaults do not implement or authorize expo/market rendering, modal behavior or route expansion.

**Existing footprint, not a modal target:** visible artist cards occupy one row; the protected envelope is 2 columns × 2 rows on tablet/desktop and 4 × 2 on mobile. Exactly one lower row is reserved. Preserve those reservations and lower decorative cells, including the final envelope's contribution to grid height. The earlier “4x4” inline interpretation is superseded: no modal is packed into that envelope.

## 3. Approved architecture and responsibilities

Keep Astro responsible for validation, initial layout, escaped content and optimized images. Enhance one poster root with a scoped custom element/TypeScript controller and one state owner; no React wrapper or new dependencies under approved D12. D12 architecture is approved by the human (“lo apruebo”); names/file splits and custom-element lifecycle mechanics are engineering choices, not additional product approval gates. This is architectural approval only, not implementation authorization.

| Boundary | Proposed responsibility |
| --- | --- |
| Existing Astro page/card rendering | Stable artist trigger IDs/source nodes; one shared modal shell; content templates per artist or an accessible single renderer. |
| Single controller/state owner | Modal lifecycle, latest valid intent, focus, scroll lock, filter interaction guard, cleanup and transition tokens. Details work without filters. |
| Small GSAP adapter + pure measurement helpers | Source/final surface rects in consistent coordinates, reversible timeline, responsive/reduced-motion settlement. No inline push/scroll/expansion-geometry modules. |
| Later filter adapter | Approved information policy, existing layout/motif selectors, deterministic matching and filter FLIP through the same owner. |

### Route map and reuse scopes

These are approved future route shapes, not links to existing source files. D20 records the human's approval (“sí, usemosla”) of this public mapping:

| Internal category key | Public category listing |
| --- | --- |
| `music` | `/musica/` |
| `stage` | `/artes-escenicas/` |
| `expo` | `/expo-arte-co/` |
| `market` | `/mercado-creativo-y-daz/` |

Canonical final fallback: `/<public-category-slug>/<participant-id>/`, for example `/musica/javiera-mena/`. Internal keys remain unchanged; disciplines remain separate. Current category information lives in `apps/festival-2026/src/content/artists.json`: each group stores `name` and `participants` (see D19 above). The public route mapping is recorded only in these documents, not currently stored as data or implemented. Earlier `/<discipline-id>/` route vocabulary is superseded, not an alternative public mapping. No URL datetime parsing.

| Route / scope | Content and interaction |
| --- | --- |
| `/` | All 46 music/stage works only, in existing mixed editorial order, irrespective of national status (D19). |
| `/<public-category-slug>/` | Category members from the global catalog only, in existing relative order, including artists absent from the homepage. SAME poster grid, layout system, components and visual aesthetic; actual category name replaces the large title (D16), with no homepage-only informational blocks or their reservations/holes. Not a separate generic list design. |
| `/<public-category-slug>/<participant-id>/` | Prerendered standalone detail fallback using the approved D20 mapping, e.g. `/musica/javiera-mena/` or `/artes-escenicas/lobas/`. Direct loads show static detail, not an automatically opened modal. |
| `/artistas/[slug]` | Current-source family only. Later authorized migration targets the confirmed public category family and removes this legacy family without aliases or redirects (resolved D15; site not in production). |

Confirmed D11: activating an event on the homepage or any category grid opens the same client modal, never the final detail route during successful enhancement. Opening/closing changes no URL, query, hash or history. Final public-category-slug/participant-id detail URLs are exclusively resilience fallbacks for unavailable or failing modal enhancement, not an additional normal navigation action. A direct load of a fallback URL remains a usable static page. Reuse the shared modal/controller across all event grids. D16 confirms category composition: the large title becomes the actual category name, followed by only category events in the SAME grid and visual aesthetic. Do not copy homepage intro/discipline/program/place/social information blocks by default, or retain their reservations, blank placeholders or holes. The footprint follows the heading/content actually present; standard available cells receive the same decorative motif filling. Separation/cadence, shared page chrome and existing artist lower static envelopes remain. Empty categories fabricate neither events nor information holes. This approves no arbitrary coordinates, new copy or grid redesign. D5 separately confirms existing homepage information blocks recompose with artists/motifs during day filtering and return to exact original positions on Todos; it does not add those blocks to categories.

Category navigation is route navigation, distinct from the day client filter. Recommend deriving visible artists as `baseScope AND activeDay`, where `baseScope` is homepage selection or current category membership. Days must never broaden a category into other disciplines. **D14 confirmed:** day filtering applies to every event-grid page whose unfiltered base scope includes Saturday and Sunday. Omit day controls on single-day or empty scopes. Compute availability from the full page scope, not its active-day subset; controls must not disappear after selecting a day. D11's confirmed no-URL/history policy concerns day/modal state only, never suppresses confirmed category navigation. A catalog category change can change an artist's canonical URL; D15 settles removal of legacy `/artistas/[slug]` routes without aliases or redirects during migration, not an additional future URL-change policy.

### Rendering and enhancement boundary

- Prerender detail content in inert templates or use one accessible renderer from a minimal projection. Reuse source DOM/data as appropriate; do not serialize the full catalog and duplicate it again in modal data. One accessible title in the open modal; source and modal must not expose duplicate active surface semantics. Any visual proxy is `aria-hidden`, noninteractive and distinct from real content.
- Render descriptions as escaped text, never untrusted `innerHTML`. Locate/reuse existing actionable-URL validation before implementing ticket rendering; if absent, establish an explicit safe build/render-boundary policy. A raw string schema is not sufficient. Null/unsafe tickets produce no action.
- Astro optimizes optional images with intrinsic dimensions, reserved aspect ratio and supplied alt text; no client `astro:assets` or `astro/zod` imports. No invented biography, image frame or link for missing data.
- D9 fallback is accepted: render a normal anchor to the canonical public-category-slug/participant-id detail; successful enhancement opens the modal instead. With no JS, failed setup or failed modal opening, normal fallback navigation remains usable. If failure occurs after preventing navigation or starting modal setup, release any partial blocking/scroll lock and navigate to the same canonical fallback; never leave a trapped or dead interface. `/evento/` was paused/replaced, not selected. Canonical route migration is future implementation work, not a claim that those source routes already exist; keep current `/artistas/` source unchanged now, then remove it without aliases or redirects during later authorized migration under resolved D15. Do not leave dead enhanced controls. Filters appear only after successful setup.
- Scope selectors/listeners to the root. Mount/disconnect is idempotent; cancel callbacks/measurements, remove handlers/observers, kill timelines, revert scoped `matchMedia`, close/release modal resources and restore any owned scroll lock. Clear only enhancement-owned styles; do not remove existing helpers.

## 4. UX and accessible modal semantics

### Day selection (retained)

Use a native single-select radio group labelled `Filtrar artistas por día`, with `Todos`, `Sábado`, `Domingo`, visible focus/selection and native Tab/arrows/Space. No tabs metaphor. Initially Todos. D11 confirmed: changing day updates client state only, with no query parameter, path/hash change, navigation or browser-history entry. A fresh load starts at Todos; no cross-page persistence mechanism is introduced. Render controls only when the unfiltered page scope contains both festival days; otherwise show its events directly without redundant day controls. Base control visibility on page membership before day filtering, never on the selected subset.

Recommended explicit mapping: `all` → no predicate; `saturday` → `date.day === 'Sábado 28'`; `sunday` → `date.day === 'Domingo 29'`. Unexpected strings remain visible in Todos and require an intentional mapping update; do not parse localized dates or treat provisional assignments as schedule approval.

The **confirmed bottom-centered floating bar** must fit narrow viewports/zoom, respect safe-area clearance, and leave bottom padding for the final artist/footer and focus outlines. Announce one settled count politely, derived from the authoritative scoped data/fixture (baseline examples only: `46 artistas`, `23 artistas`), never animation frames; cancel stale announcements. Proposed empty-fixture copy: `No hay artistas para este filtro.` Keep Todos operable; no inference that Sunday has no program.

### Modal open, read and close

- A real artist trigger opens one named modal. Recommended native `<dialog>.showModal()` establishes top-layer/inert behavior and native focus containment; do not reimplement a trap the browser already provides. Move initial focus sensibly inside (for example its heading for long content), keep keyboard focus inside and give the dialog an accessible name.
- Other artists, filters and background controls are unavailable to pointer and keyboard from opening through completed closing. Do not queue card B or filter changes through the inert background. No simultaneous A-close/B-open, retain-open-on-filter or exclude-open-on-filter transaction.
- A reachable close button (`Cerrar detalle`), Escape, and deliberate backdrop click request close. Outside-click intent requires pointer down and up both on the backdrop; a drag starting inside must not dismiss. Intercept native cancellation so Escape reverses the animation rather than immediately removing modality.
- Keep the native dialog open and blocking throughout reverse; call `close()` only once the animation has settled. No click-through as the backdrop fades. Restore focus to the source after completed close, without scrolling it unexpectedly.
- Lock background scrolling while modal is active, preserving/restoring its offset and avoiding viewport jumps or double native scroll anchoring. Background scroll is not description scroll. Retain the source node; on close measure its **current** rect, not a stale opening rect. If missing/disconnected, safely fade closed and focus the nearest valid artist/control instead of flying toward stale coordinates or failing.

### Content and viewport

D7 hierarchy remains confirmed: name, discipline/company and schedule at top; description primary; image secondary when supplied; ticket and close reachable. Proposed empty description copy remains `Descripción próximamente.` No fabricated content or null-image frame. Wrap long names/labels; do not hide essential identity with ellipsis or indefinitely shrink text.

Confirmed D8 presentation: centered responsive modal with limited desktop width and nearly the full available mobile width, retaining exterior margins. Bound its block size by the dynamic viewport and safe-area; long description/body content scrolls internally while header, close and actions stay reachable. When supplied, the secondary image sits beside the description on desktop and above it on mobile with bounded height to preserve reading space. Without an image, render no blank media column or placeholder. Exact numeric dimensions remain tuning; a full-screen mobile panel is not selected. Optional imagery yields reading space first. There is no desktop inline overflow fallback and no mobile detail grid growth; the underlying grid and lower tiles do not move on open/close.

### Homepage category navigation — D17

Confirmed: the former homepage discipline list becomes links to exactly **four categories**, replacing the discipline-label list. Human: “Efectivamente, ellos serán enlaces y ya no mostrará las disciplinas si no que las 4 categorías”. The four stored names and memberships are settled: Música (`music`, 30), Artes Escénicas (`stage`, 16), Expo Arte.Co (`expo`, 8), Mercado Creativo y DAZ (`market`, 39). These are internal category keys, not discipline IDs. D20 resolves their separate public mapping: `music` → `/musica/`, `stage` → `/artes-escenicas/`, `expo` → `/expo-arte-co/`, `market` → `/mercado-creativo-y-daz/`. Earlier discipline-ID route examples are superseded. The links lead to category grids; activating events within those grids still opens the client modal.

### Responsive navbar category links — D18

Confirmed: expanded desktop navbar presents a **centered group of Inicio plus the four category links**. On mobile, the same five destinations appear when the navigation panel is opened. Inicio targets the edition homepage; categories navigate to their category grids. Reuse the authoritative category definitions for navbar and homepage category links; stored labels are settled under D17/D19 and public destinations under D20; the mapping remains documentation-only. Preserve accessible panel keyboard/focus behavior and existing edition navigation, without propagating this edition's content into unrelated festival editions. These are route-navigation links, distinct from the bottom floating client-only day filter. Human: “Además que aparecerán en el navbar, en la versión ampliada desktop parecerán inicio + las 4 categorías como linnks centrados y en mobile aparecerán al abrir el panel”. Recording this requirement implements no navigation UI.

## 5. Filtering layout and decorative identity

**D5 resolved: existing homepage information blocks recompose WITH artists and motifs during day filtering.** Human: “sí, también se reacomodan”. Compact/reposition them rather than retaining fixed old coordinates that cause long empty tracts. Preserve all information content, readability and order with collision-safe geometry; animate their movement in the same GSAP flow as artists/motifs. Todos restores the exact original baseline, including information positions. This approves behavior, not the precise anchor algorithm below: the content-relative policy remains an engineering proposal to validate with deterministic tests, not a human lane/search-algorithm choice.

**Category composition is resolved (D16), not another D5 question:** actual category-name heading and category events use the SAME grid/aesthetic, without homepage-only informational blocks or their reservations/blank holes. Compute the footprint from the heading/content present; retain standard decorative filling in available cells, separation/cadence, shared chrome and existing artist lower static envelopes. Empty categories have no fake events or absent-info obstacles. This does not prescribe new coordinates, copy or a grid redesign.

### Proposed homepage content-relative anchors — engineering validation under resolved D5

For existing homepage informational blocks, derive per-range anchors from the approved full homepage layout: canonical boundary, predecessor artist rank, original dimensions, preferred horizontal lane and stable information ID. Keep hero/title opening constraints fixed. Translate each boundary to retained baseline predecessors, then pack artist segments using existing `calculatePosterLayout` rules and validated anchors. Prototype the adapter before changing shared geometry APIs; never duplicate parity, normalization, uniqueness or collision validation.

Resolve competing information blocks in canonical order: prefer the in-bounds lane, scan forward row-major and advance rows until blocks/envelopes fit. Preserve dimensions/order; never move an earlier boundary backward after resolving a later one. Reject an invalid candidate atomically and retain the previous usable layout. Zero/one-artist fixtures must preserve information without phantom full-lineup gaps under confirmed D5. Validate this proposed algorithm against the approved behavior across ranges and boundary fixtures; adjust engineering mechanics if needed, without reopening the compaction decision.

For Todos restore the approved baseline placements, packing and motifs of the current base scope; Todos does not mean the entire catalog. Homepage baseline behavior remains exact. D16 category composition uses only its actual heading/content footprint, with no absent homepage information obstacles and standard decorative filling; do not copy homepage information coordinates. D5 approves recomposition and exact homepage restoration, not this precise proposed anchor algorithm. Preserve IDs and existing ascending relative artist order within each category/subset.

### Decorative selection and matching

- Recompute filter geometry and `selectPosterMotifs` for **all three layouts together**, preserving shared constraints; never select each range independently or randomize variants.
- Cache by ordered visible IDs plus layout inputs; repeating a subset is deterministic and Todos restores its original selection.
- Endpoint cells `(range, column, row)` and canonical motif IDs are not permanent moving-node identity; today's sequence-index DOM identity needs an adapter.
- Preserve each moving node's canonical SVG; no morphing unrelated array-index artwork. Detail opening/closing never masks, withdraws or regenerates reserved decorative cells.

**Detailed matching proposal (D6 engineering tuning):** retain same-cell/same-motif matches first. Visit remaining old cells in stable coordinate order; match nearest available same-ID destination one-to-one, breaking ties by stable destination order. Bound travel with a configurable threshold; unmatched/surplus/over-limit nodes exit/enter rather than cross the poster. Distance metric, coordinate ordering and threshold remain engineering proposals, not new product gates or a reopening of broad motion. A changed motif in a cell does not morph; match its old/new nodes separately. Reconcile on range change. This adapter cannot alter shared deterministic distribution to manufacture continuity.

### Filter motion and reading context

Confirmed direction: excluded artists fade; surviving artists **and decorative tiles** slide using GSAP FLIP; entrants fade with overlap. D5 includes retained homepage information blocks moving within this same GSAP flow, not a separate abrupt reposition. Keep movement short and simultaneous with minimal local stagger, no bounce, long cascade or forced cross-poster travel. Exact durations/easing remain proposals.

1. Only start while the modal is closed. Capture the viewed artist and its viewport offset; if excluded choose the nearest surviving canonical neighbor, otherwise a valid filter fallback.
2. Reconcile exits and retained nodes, including homepage information blocks, without focusable invisible content. Compute the approved destination once per committed intent, all three layouts for motif selection; batch First reads from current paint, commit final flow once, then Last reads.
3. Invert retained wrappers and animate transforms/`autoAlpha` to identity, overlapping entering fades. No per-frame layout calculation/read-write loops.
4. Preserve the reading anchor's viewport position, clamping at document limits and avoiding double native scroll compensation. Never reset to the top; keep filter focus visible.
5. Rapid filter changes rebase from current paint toward the latest valid intent; release transient styles and announce only the final count. Reduced motion applies the same endpoint immediately.

D10 reading context is confirmed; its former open-detail retention/exclusion logic is superseded by modal interaction blocking.

## 6. GSAP modal score and measurement

Broad source-to-center/reverse choreography is confirmed; the following score is a recommendation, **not approved timings**. Use core `gsap.timeline()` labels/relative overlap and local defaults, with scoped `gsap.matchMedia()` for project breakpoints/reduced motion. Manual First/Last/Invert/Play with core transforms is the baseline; optional Flip requires verified installed export/integration. No new plugin/dependency is assumed.

| Label | Coordinated action |
| --- | --- |
| `capture` | Capture source rect and scroll offset before mutation; establish native modality/scroll lock and measure final centered dialog surface. Batch reads/writes; source stays in the grid. |
| `surface` | Animate an **inner visual surface**, transformed/clipped from captured source rect to final measured rect. Fade backdrop with it; do not translate the native dialog itself inconsistently out of top-layer centering. |
| `header` | Coordinate name/meta repositioning and real final typography using independent wrappers; no stretched text inherited from surface scale. |
| `reveal` | Overlap detail opacity/`autoAlpha` once reading space exists; keep actual accessible content/controls consistent with modal state. |
| `settled` | Commit current endpoint, clear transient presentation/`will-change`; do not release modality at the open endpoint. |
| `reverse` | Reverse current playhead toward the original source's current rect; fade details/backdrop and release modality, scroll lock and focus only at completed close. |

Use consistent viewport coordinates for source `getBoundingClientRect()` and fixed/top-layer surface measurements; account for scroll-lock effects rather than mix document and viewport offsets. Source card layout, lower reservations and mobile followers never change. Keep transforms separate from Tailwind hover/focus and name-fit wrappers, one owner per property. Clip/transform the surface without stretching text, images or controls; an optional nonsemantic visual proxy must be hidden from accessibility and pointer input.

Choose real final typography with existing metrics and stable line composition before playback. Reserve image aspect ratio and wait for relevant fonts for valid measurements; if unavailable, use an immediate usable endpoint, never hide content indefinitely. Read First/Last once per transition batch, not every frame. Coalesce font/image/resize updates; observers must not feed back on their own writes.

Close during opening reverses **from current progress**, never snaps to an endpoint first. A valid internal reopening intent during closing can resume from current paint/playhead; the inert source cannot itself trigger it. Repeated close/outside events are idempotent; latest valid intent wins without orphaned state. If geometry changed, safely settle/rebase to the latest endpoint with fresh measurements; do not reuse stale flying coordinates. Reduced motion uses immediate equivalent states and cleanup, without waiting for animation callbacks.

## 7. State, events and lifecycle invariants

One owner tracks day, active artist/source, desired modal endpoint, phase (`closed`, `opening`, `open`, `closing`; filter/reflow work only when closed), saved scroll and a monotonic transition token. IDs, not DOM indexes, define identity. Validate inputs before effects; rejected intents leave stored state, source arrays, layout and counters unchanged.

| Event | Required endpoint / resolution |
| --- | --- |
| Artist activation while closed | Validate current membership/source, establish one modal and blocking background, then animate from source. |
| Card B/filter input while active | Inert/top-layer UI prevents it; reject synthetic/stale background requests without state/counter changes. Never start another panel or change day. |
| Close button/Escape/deliberate backdrop during opening/open | Reverse current playhead; maintain blocking and focus containment until finished. |
| Repeated close / valid internal reopen during closing | Idempotent close or resume latest valid target from current progress; no stale completion or click-through. |
| Filter changes while closed | Latest day intersects the current base scope to determine layout/count; D14 applies controls only to pages whose unfiltered scope contains both festival days. Never leak other categories. Rebase interrupted filter motion; settle its latest endpoint before measuring a valid artist source. |
| Viewport/breakpoint/font/image change | Invalidate obsolete callbacks; settle/rebase latest endpoint with fresh geometry. No orphan transforms or detail-induced grid reflow. |
| Origin disconnected before close | Safe fade close, restore saved background scroll and nearest valid focus fallback; no stale long flight. |
| Reduced-motion change mid-flight | Cancel/revert motion ownership and apply equivalent latest endpoint immediately, including focus/scroll/modal semantics. |
| Root disconnect/reconnect | Cancel work, release owned modal/scroll resources, listeners/observers/media context; initialize once per connection. |

Guard completions, reverse completions, image/font callbacks and pending measurements with current token/root connection. Presentation `autoAlpha` is not the accessibility model: reconcile actual modal semantics and hidden content. At most one active modal; no leaked pointer/key interaction, stale callback, invisible clickable layer, abandoned scroll lock or duplicate accessible title.

## 8. Reproducible future flows — not executed

All scenarios are future acceptance flows, not executed checks. Browser scenarios require separate authorization. Expected counts must be computed from fixtures/current authoritative data, not fixed at 46/23 for every scope; provisional assignments are not an approved schedule.

| Flow | Actions and expected observable result |
| --- | --- |
| Todos round trip | On homepage selection, Todos → Sábado → Domingo → Todos yields scoped fixture-derived counts and existing order; exact original baseline placements/motifs including homepage information positions restored, data unchanged. Historical snapshot only: 46 → 23 → 23 → 46. |
| Category membership | Navigate to an approved category route: same poster grid/components, only members of that category in existing order. An artist not selected for homepage still appears in its category. D16: actual category-name large title, no copied homepage intro/discipline/program/place/social blocks and no absent-info reservations/blank holes. Footprint follows actual heading/content with normal decorative filling, separation/cadence, shared chrome and artist lower envelopes preserved. Empty category: no fake events or info holes. No generic-list redesign, arbitrary coordinates or new copy. |
| Scoped days and conditional controls — D14 confirmed | On a category containing both days, controls appear; selecting a day preserves those controls and shows category membership AND day. Todos restores the category, never other disciplines. Single-day and empty category fixtures show no day controls and keep all their scoped events available. Apply the same rule to every event-grid page. |
| JS / no-JS canonical navigation | Enhanced category/homepage artist click always opens the shared modal without URL/history changes; absent JS/failed setup or opening follows the normal public-category-slug/participant-id anchor. Direct canonical deep link renders static detail, no modal by default. After authorized migration, legacy `/artistas/` routes are absent with no aliases or redirects (D15); no `/evento/` destination. |
| Filter recomposition | Repeat subsets: exits fade, survivors/decorations/information blocks move in the same GSAP flow, entrants overlap; deterministic same-ID artwork and engineering-validated bounded matching; no random variants. D5: no long empty tracts from fixed old information coordinates; preserve information content/readability/order and collision-safe geometry across ranges, including zero/one/boundary subsets. Exact original information positions return on Todos; precise anchors remain engineering proposals for deterministic validation. |
| Reading anchor | Filter with viewed artist retained/excluded: preserve its viewport offset or nearest surviving neighbor, clamp at limits, no top reset/double compensation. Existing homepage information placement follows resolved D5 recomposition and exact Todos restoration; D16 separately excludes absent-info reservations on categories. |
| Open Polter | Activate source: centered modal grows from it, magenta–rose identity and real content; grid/lower tiles/following content unchanged. |
| Close paths | Close button, deliberate backdrop, Escape each reverse to current source rect; focus and saved background scroll return after settlement. Inside-to-outside drag does not close; no click-through. |
| Block background | While opening/open/closing try B, day bar and keyboard navigation: no other card/filter activation or background key leakage; one modal only. After completed close B is available. |
| Rapid intent | Close during opening; repeat close/outside; exercise valid internal resume: current-playhead continuity, latest valid endpoint, no stale callbacks or locks. |
| Mobile and long body | Centered responsive modal stays within dynamic viewport/safe-area; body scrolls internally, header/close/actions reachable; background locked and grid unchanged. No implied full-screen choice. |
| Reduced motion | Before load and mid-flight: immediate equivalent content, focus, blocking and scroll restoration; no callback-dependent hidden state. |
| Measurement interruptions | Resize/breakpoint changes, delayed image/fonts and zoom: settle/rebase valid endpoints, reserve image aspect, no stretched glyphs, jumps or stale flight. |
| Missing origin | Disconnect source before close: safe fade and nearest valid focus fallback, saved offset restored; no crash or huge stale motion. |
| Content extremes | Long/empty description, long name, missing optional image/company/ticket: hierarchy preserved, no invented biography/link/frame, safe URL boundary, close reachable. |
| Empty/matching fixtures | Isolated zero/one/boundary subsets and matching ties/surplus/over-limit cases: stable selection and approved geometry/matching, honest no-match copy and usable Todos; no mutation or inference about Sunday. |

## 9. Future verification and residual risks

**T2 modal behavior is implemented with deterministic mocked verification, not visual/browser verification. Stage-2 filter scenarios remain unimplemented.** The bounded catalog unit uses deterministic RED/GREEN tests for required detail fields/defaults, validation without input mutation, the `national` rename, category separation and unchanged hero membership/order; edition tests, targeted lint and edition build are its non-browser checks. Documentation-only changes use structural/local-link checks and `git diff --check`, with no meaningful documentation RED. These checks do not prove modal/filter/navigation behavior; no browser/server/visual checks are authorized.

Later authorized implementation should use behavior-level test-first coverage for:

- State/public interaction outcomes: one modal, invalid/background input leaves state/counters unchanged, latest-token reversal/rebase, no stale callbacks, focus/inert/scroll lifecycle and teardown.
- Render boundaries: accessible name, non-nested actions, no duplicate active semantics, escaped text, safe optional URLs, optimized image dimensions, approved fallback and no client Astro/Zod leakage.
- Routes/scopes: D20 public-category-slug canonical listing/detail destinations using participant IDs for details, category-only membership including non-homepage artists, existing relative order, shared grid rendering, JS/failure/no-JS anchors and static direct detail loads. Compute expected counts from authoritative fixtures; test category/day intersection and control visibility for both-day, single-day and empty scopes; choosing a day must not remove controls or change URL/history. Pin D11 modal URL/history invariance and D15 legacy-route removal without aliases or redirects during authorized migration.
- Geometry/motifs: exact scope-specific Todos, requested/zero/one/boundary subsets across ranges, ascending order, envelopes/information collisions, deterministic shared selection and input immutability; D16 category heading/content footprint without homepage-only information blocks or their reservations/holes, preserving normal decoration and artist envelopes; resolved D5 homepage recomposition with artists/motifs, no fixed-coordinate long empty tracts, preserved content/readability/order, collision-safe geometry and exact original Todos information positions. Deterministically validate proposed content-relative anchors and D6 detailed matching as engineering work, not pending product approvals. Detail open/close must not change grid geometry or motif nodes.
- Motion adapter: source/final coordinate consistency, independent text/surface layers, exact-progress reverse, modality held through closing, missing-source fade, immediate reduced motion, batched reads and cleanup. Filter tests cover retained nodes, fades/overlap, reading anchors and latest-intent rebasing without concurrent modal filtering.

Mock tests cannot prove perception, assistive-technology behavior, scroll stability or device performance. Future focused Vitest tests precede broader edition tests/type checks/lint/build, with exact commands authorized for that later scope; no future runner is authorized here. Browser evidence remains deferred.

Primary risks: top-layer/scroll-lock coordinate mismatch; stale source rect or callbacks; text scaling/late assets; long-content accessibility; filter shared geometry/motif identity regressions; validating proposed content-relative anchors against resolved D5 homepage recomposition/restoration, not an unanswered compaction choice or category absence of information reservations (resolved D16). Preserve unrelated day-data/README/test edits. No claim that the new modal removes every scroll concern.

## 10. Delivery dependencies and engineering validation

1. **Details first (confirmed D1):** D8 presentation, D9 fallback, D11 client-only state and D12 architecture are resolved; separately authorize static content + shared modal + reversible GSAP + interruption/focus/scroll safety within that architecture. Canonical fallback delivery must include its route destination and D15 legacy-route removal without aliases/redirects under an explicit scope; current route migration is not implemented. No filter prerequisite or inline displacement work.
2. **Category routes — expanded planning scope (D13):** use the current catalog contract and confirmed music/stage hero rule, use the approved D20 public category mapping, and separately scope canonical listings/details and shared grid/modal reuse. Apply resolved D16 category composition without homepage-only informational blocks/reservations and the resolved D15 removal policy during affected implementation. This is not authorization to change data or implement routes.
3. **Day filters later:** separately scope radios/mapping/counts, apply resolved D5 homepage information-block recomposition and deterministically validate proposed content-relative anchors, reconcile D4 mapping with the current catalog contract and tune D6 tile matching/timing as engineering work. Apply resolved D11/D14, reuse existing selectors and add filter FLIP/reading anchors. Information blocks must recompose with artists/motifs in the same GSAP flow and restore exact original positions on Todos; precise anchor/lane/search mechanics are engineering proposals, not human product gates.
4. **If separately authorized together:** integrate through one owner; filtering is available only after modal closure. Verify blocking, teardown, filter/resize settlement and reading context, not obsolete concurrent panel retention/exclusion.

D8 presentation and D9 fallback are resolved. D14 conditional visibility and scoped day filtering are resolved. D11 client-only day filtering is resolved; modal opening/closing is also confirmed client-only with no URL/history changes; final detail routes are exclusively fallback destinations. D12 architecture is approved. D15 legacy URL transition is resolved: remove `/artistas/[slug]` without aliases or redirects during later authorized migration, because the site is not in production. D16 category composition is resolved: category-name heading and category events, same grid/aesthetic, no homepage-only information blocks or absent-info reservations/holes. D5 is resolved: existing homepage information blocks recompose with artists/motifs in the same GSAP flow, avoiding fixed-coordinate long empty tracts while preserving content/readability/order and collision-safe geometry; Todos restores the exact original baseline including information positions. Recorded interaction behaviors and D20 public category route slugs are resolved. No final anchor implementation is approved: the content-relative policy remains an engineering proposal for deterministic validation, not a request for human lane/search-algorithm selection. Do not reopen category absence of information reservations. D19 settles the catalog contract and homepage membership: all music/stage works only, regardless of national status. D20 resolves the public mapping and participant-ID fallback shape; only the four names and memberships are currently stored, not that route mapping. D4 mapping and D6 exact timing/matching are engineering proposals, not product gates or a reopened broad-motion decision. No automatic follow-up execution, source deletion or implementation authorization follows.

## Appendix A. References

- [Decision plan](../plans/arc2026-artist-interactions.md) — D1–D20 and supersession history.
- [GSAP core](https://gsap.com/docs/v3/GSAP/) — transforms, `autoAlpha`, playback/cleanup.
- [Timeline](https://gsap.com/docs/v3/GSAP/Timeline/) — labels, relative overlaps, reverse/play.
- [matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia/) — responsive/reduced-motion setup and reversion.
- [Flip](https://gsap.com/docs/v3/Plugins/Flip/) — optional verified integration only; manual core FLIP is baseline.
- [Native dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog) — recommended modal semantics; no remote fetch or compatibility test claimed.

## Appendix B. Provenance and explicit supersession

Latest catalog clarification (D19): “es una regla de negocio que sólo musica y artes escenicas se muestran en hero, features en música es sólo para marcar cuales son nacionales”. Human subsequently answered “confirmo” to explicitly approve the `featured` → `national` rename. Only music requires that boolean; it never controls hero presence. Category names and memberships are stored; D20 subsequently resolves the public category slugs. This clarification supersedes older discipline-based URL examples, not the separate discipline catalog or the retained modal/filter decisions below.

Public-route approval (D20): human answered “sí, usemosla” to the four-URL mapping in §3. The final fallback is `/<public-category-slug>/<participant-id>/`, e.g. `/musica/javiera-mena/`. This records a documentation-only decision, not data or route implementation.

Earlier documentation request (verbatim):
> Modifica la documentación que tenemos hasta el momento para bordar el nuevo comportamiento

Retained modal product correction (verbatim; routing confirmation below is newer):
> Vamos a hhacer un cambio grande. Ya no haremos la idea de usar el mismo grid, de hecho vamos a quitar varias features y nos iremos por algo más simple. Al presionar un artista, el espacio crecerá hasta un popover central, seguirá la misma estetica y también será animado, pero esta vez ya no se integra con la grid, si no que el efecto es que desde el botón, este crece hasta el popover o modal ccentral con la inforamción detallada, y al cerrar se revierte y vuelve a su posición. Se entiende? con esto ya no necesitamos el problema de scroll y etc y mejora la UX. Mismas reglas, solo se puede uno abierto a la vez (la misma ui impedirá presioanr otro si ya hay uno abierto), de hecho se podrá cerarar presionando fuera del modal o con el botón.
>
> Para el filtro se sigue manteniendo al feture, filtro por días

Routing confirmation (verbatim; later decisions below also apply):
> sí, cada disciplina tendrá si propia página, esta página usará el mismo grid e itnegrará sólo a los artista de esa categoría. Será una manera de filtrar mediante ruting, no es lo mismo del cambio por días. Le diré a otro agente que actualice la lista de artistas de modo de que tengamos todo ya definido.

Preceding confirmed route proposal (verbatim):
> quizá deberíamos armarlo como <discipline>/<artist-slug>. Esto porque existirán uans rutas para englobar otros artista que no partricipan de la grid inicial pero si aparecen en páginna aparte como una lista

The later confirmation requires the SAME category poster grid, not a new generic list design. Standalone no-JS fallback is accepted; the initially suggested `/evento/javiera-mena` was explicitly paused/replaced by the discipline family. **HISTORICAL / SUPERSEDED:** at this earlier routing stage, legacy URL handling and category day controls were unresolved. D14 now confirms controls only where the unfiltered page scope contains both festival days, persisting after selection; single-day/empty scopes omit them. D15 now confirms legacy-route removal without aliases or redirects during later authorized migration.

Subsequent client-state confirmation (D11, verbatim):
> El filtro del día no debe añádir una params. Es sólo cambio de cliente.
>
> exacto, lo dejamos así, además, clickear sobre un evento dentro de la ruta de disciplina, también abre modal y no la ruta final, la ruta final es exclusivamente para el fallback ante problemas con el modal

D12 architecture is approved (“lo apruebo”): Astro-rendered content, one shared TypeScript controller, installed GSAP and existing pure geometry, without React or new dependencies. These are resolved decisions, not pending permission requests.

Legacy-route confirmation (D15, verbatim):
> no, la págian no esta en producción, es seguro quitar esas rutas sin redirecciones

Remove `/artistas/[slug]` during later authorized migration; do not retain aliases or redirects. Current source remains unchanged now. D11 also confirms no URL/history changes for modal opening/closing on homepage/category grids or for day filtering; canonical details remain fallback-only.

Category-composition confirmation (D16, verbatim), answering whether category pages retain homepage information blocks or use category heading/events:
> Sí, el título grande se reemplaza por el nombre de la categoría. No se añaden vacíos de información

The actual category name replaces the large title in the SAME grid and visual aesthetic; only category events appear. No homepage intro/discipline/program/place/social block copy or absent-info reservations/blank holes; footprint follows actual heading/content, with standard decorative filling, separation/cadence, shared chrome and existing artist lower static envelopes preserved. Empty categories invent no events or info holes. No arbitrary coordinates, new copy or redesign is implied. D5 separately concerns existing homepage informational blocks during day-filter recomposition only.

Latest homepage day-filter confirmation (D5, verbatim), answering whether existing information blocks also compact/reposition during day filtering and Todos restores originals:
> sí, también se reacomodan

D5 is resolved: existing homepage information blocks recompose WITH artists/motifs, avoiding long empty tracts from fixed old coordinates, preserving content/readability/order and collision-safe geometry. Animate their movement in the same GSAP flow and restore the exact original Todos baseline including information positions. This approves behavior, not the precise content-relative anchor algorithm; validate that engineering proposal deterministically rather than asking the human to select lanes/search algorithms.

Interpretation retained: central **modal**, not nonmodal popover. “Quitar varias features” only supersedes mechanics inherently coupled to inline expansion; D15 separately settles legacy-route removal. Unrelated deletions need their own decision.

**HISTORICAL / SUPERSEDED, not current requirements:** the original request rejected popovers and described using lower reserved slots; subsequent inline choices animated lower tiles, pushed mobile followers, allowed desktop natural-flow overflow, simultaneous A-close/B-open and open-detail filter retention/exclusion. The latest modal correction replaces those choices. Their source quotes are no longer active requirements. Retained decisions: details-first, floating day bar, one active detail, content hierarchy and filter reading anchor. **HISTORICAL / SUPERSEDED:** D5 homepage information-block compaction was previously unanswered; the latest “sí, también se reacomodan” now resolves it. D16 resolves category composition and absence of homepage-only information reservations separately. The D5 content-relative anchor algorithm remains an engineering proposal, not approved implementation or a pending product choice.
