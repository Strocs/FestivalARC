# ARC 2026 — layout comparison

**Proposal phase only.** Compare spatial rhythm before choosing an app revision.
Source of authority: `odd/tasks/arc2026-prototype.md`, T6, S31–S36 and current Log.
No direction is approved for implementation. Parent owns canvas opening, task Log,
selection, app integration and commits.

## Shared approved constraints

- Discover the festival and artists using supplied demonstration artwork (S3).
- Image-only hero: full combined `LOGO_HERO.png`, no crop, recreated heading or
  visible hero description. Its image supplies the accessible h1 name (S31).
- Fluid, uncapped page with four-sided padding: desktop >=1200px 48px;
  tablet 768–1199px 32px; mobile <768px 16px (S32/S34).
- Square artists are 2×2 small modules, each form 1×1: twice the side, four times
  the area. No fixed artist/decorative columns. On mobile each artist fills the
  single artist column; forms occupy compact two-across groups between them.
- No gaps or radii within continuous fields, no arbitrary packing fillers.
  No animation, transitions, morphing or smooth scrolling (S33/S35).
- Same six repeated Javiera Mena references in all directions, not six bookings.
  Only CSS cover in the square; unchanged source and no new card layers,
  names/times/counters or badges (S13/S17). Demo warning is in footer and detail,
  not a new hero paragraph.
- Named native buttons open an immediate, explicitly limited reference dialog.
  Escape/visible close and exact-trigger focus return work without a fabricated
  routing/backend stack. This is not the app's link/history/no-JS implementation.
- Source colors use only the six sampled poster tokens in `design/system.md`.
  Paper/ink UI contrast is 19.422:1; paired paper/ink focus marks remain visible
  over artwork. Raster typography is not certified as accessible text (S12).
- App code, indexation (S11), source assets and approved Anton/Poppins delivery
  (S24) remain unchanged. Selection and implementation require human approval (S2).

## Proposed differences — not production tokens

| Artboard | Spatial strategy | Tradeoff |
| --- | --- | --- |
| `01-offset-mosaic.html` — Mosaico desplazado | Recommended balanced continuous eight-module field. Three artists per band; starts shift from 1/3/5 to 2/4/6. Four small forms per band occupy edge intervals. Full-width hero directly meets the field. | Strong continuity and discovery; smaller portraits than the other proposals. |
| `02-editorial-clusters.html` — Grupos editoriales | Six-module field; two artists per band with a four-form seam that moves right, left, then center. Hero uses three quarters of the frame on desktop/tablet and sits apart from the field. | Clearer grouping and larger portraits, but less spontaneous discovery; more vertical scrolling. |
| `03-open-rhythm.html` — Ritmo abierto | Eight-module field, two portraits per band, six individual small accents total. Portrait starts shift 1/5 → 3/7 → 1/5. Hero is full width with a separate pause before portraits. | Deliberate **proposed** negative space creates quieter portrait emphasis but sacrifices the continuous mosaic; not user-approved spacing. |

Desktop strategies remain fluid on tablet; mobile resets all explicit placements
into DOM order with one full-width artist column. Visual and keyboard artist
order both remain reference 1–6; no dense packing, CSS order or hidden artists.
Hero separation, column density, header dimensions and footer fitting values are
comparison choices, not observed app metrics or a finalized brand scale.

## Assets and rendering boundary

All imagery is embedded as data URIs directly from these unchanged local files:

- `apps/festival-2026/src/assets/LOGO_HERO.png`: supplied combined hero,
  1920×520, full original aspect ratio. Not the taller JPG variant.
- `apps/festival-2026/src/assets/arc2026/javiera-mena-demo.jpeg`: 397×349,
  original composited reference, repeated only for comparison. Square CSS cover
  on cards; full image in the reference dialog. Enlargement cannot recover detail.
- `apps/festival-2026/src/assets/arc2026/arc26-logo.png`: 1961×802 local brand context.
- Inline arrows, bolt, star and spark paths reuse the exact reconstructed geometry
  in `apps/festival-2026/src/features/arc2026/components/PatternTile.astro`.
  These are reconstructions from the poster, not supplied original vectors.

Self-contained canvas constraint: only the generic **sans-serif** fallback already
present in the observed app font stack renders small interface copy. It is **not
Poppins**, and no remote or embedded font is fetched. Critical hero/card lettering
is supplied by the raster images. Real app typography stays Anton 400 / Poppins.
There are no external or relative resource URLs, imports, CDNs or fonts.

## Verification and handoff

No meaningful behavioral RED applies to passive visual proposals. Use ordinary
source/manifest and Chromium geometry, keyboard, motion and resource verification.
The reproducible generator and browser evidence live only under
`output/playwright/arc2026-layout-proposals/`; no app runner/config changes.

Observed Chromium verification: all three artboards pass at 1440, 1920, 1199,
768, 390 and 320px (18 checks). Checks cover four-sided padding, uncapped width,
2:1 side / 4:1 area ratios, square geometry, no overlapping tiles or unfilled
cells in contiguous layouts/mobile, varied desktop band starts, mobile single
artist column, DOM/visual artist order, named controls, visible keyboard focus,
native dialog close/Escape and trigger restoration, no motion/page errors and
only file/data requests. Source/manifest references, six palette colors and the
sans-serif font boundary pass. All opened contexts/browser were closed; no server
was started or pre-existing preview touched.

Twelve full-page screenshots are named `{artboard-stem}-{width}.png` in that
output directory, for each of the three exact manifest stems at widths 1440,
1920, 390 and 320. `verification.json` records exact paths and measured geometry.
Visual inspection caught an initial mobile half-row gap; grouping the existing
motifs after each band's artists removed it without adding fillers or changing
artist order. Final screenshots and continuity checks reflect the correction.

Parent opens `arc2026-layout-proposals` in Gentle Design and records paths in the
feature Log. Open choice: select a direction or request a bounded refinement;
no proposal automatically authorizes app implementation.
