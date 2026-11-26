# ARC 2026 filter URLs

Static first-render filter variants with client-side filter interaction. Work is based on the verified Music pilot, implemented directly on `dev`.

## Specs

- S1: “Necesito que agreguemos params a los filtros. Estos params se aplicarán idealmente en servidor aunque probablemennte nno se pueda alojando en vercel, si es en cliente, intentar disminuír lo más posible el layout shift siempre priorizando una carga rápido del primer contenido.”
- S2: “los dos params que me interesan sol día y orden. vista no. El punto es que estas rutas estáticas tendrían que aplicarse también a las rutas de /musica y artes escenicas. Y no me gusta que la url sea /dia/sabado, quiero query params.”
- S3: “Aplicar el filtro al url mientras el usuario filtra, solo lo agrega en cliente. Realizar la request con params aplicados sí debería realizar al request con esa condición.”
- S4: “Ahora sí, podemos hacer la versión definitiva, implementala sobre dev directamente”

## Tasks

- T1 — S1–S3 — Prerender poster variants and sync the interactive filters with browser history — worker — verified locally — `706cdd0`.
- T2 — S1–S2, S4 — Package the static variants and route the public query URLs on Vercel without altering the local preview or archive routes — worker — local artifact verified; hosted edge not tested — this commit (`build(vercel): route static poster variants by query`).
- T3 — S1–S4 — Verify the integrated work and record the outcome on `dev` — parent — local verification passed; native assessment unavailable (untracked-scope validation) — evidence in this commit.

## Log

- L1: Ahora sí, podemos hacer la versión definitiva, implementala sobre dev directamente
- L2: Pilot commit `32644dc` on `feat/arc2026-static-filter-pilot` is evidence, not the final implementation; the real Vercel Preview returned the filtered Music HTML without a navigation during filter edits. Plain rewrites lose to the matching static file; moving the normal document behind the fallback rewrite worked. Keep production unchanged; the user authorized work on local `dev`, not a push.
- L3: Implementation interface: public paths `/`, `/musica`, `/artes-escenicas`; query keys `dia` (non-default values `sabado`, `domingo`) and `orden` (non-default values `horario`, `escenario`), preserving unrelated keys/fragments. Absent, explicit default or unrecognized value uses the default for that key. Server/client key contract: render non-default variants at `/poster-variants/<scope>/<day>-<order>/` before Vercel packaging, with scope `home`, `music`, `stage`, day `all`, `saturday`, `sunday`, and order `original`, `time`, `location`. Vercel serving filenames can differ from build paths. The canonical and user-visible path is the existing public path (no variant path as a canonical). Variant output must not become an independent sitemap entry. Correct state must be visible before JS and unchanged when it starts. Use History API rather than document navigations during interaction, including Back/Forward restoration; keep view out of the URL. Root local build/preview retains ordinary paths as before.
- L4: Local `pnpm build`, 4 Chromium checks, 338 edition tests, 18 distribution tests, and 2 root contract checks passed. `pnpm build:vercel` produced all 27 expected files without public-path file collisions, with public canonicals and a public-only sitemap. Two independent read-only inspections found no blocker. No hosted Preview for this final candidate was deployed; edge rewrite behavior for the expanded routes remains unverified.
- L5: Final implementation and its verified source changes are in the primary worktree on `dev`, based on `cec92f9`. The pilot review note was preserved separately.
- L6: Release slices on `dev`: `cec92f9..706cdd0` for poster UI/prerender/history, and the following build commit for Vercel routing. The user will test the published `dev` Preview directly; no separate deployment was created.
