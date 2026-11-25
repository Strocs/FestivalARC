# ARC 2026 lineup controls
Branch: `feat/arc2026-lineup-controls` (base `30a7e16`); delivery: ask-on-risk.
Checks: focused Vitest and browser tests, compressed output comparison, repository build.

## Specs

- S1: “Ordenar por horario. No tenemos una manera de ordenar por, sugiero añadir un ordenar por debajo, al lado del filtro dentro de la barra flotante, ordenar por horario y escenario, ambas opciones.”
- S2: “Quiero que añadamos una opción de vista simple. donde desaparecen todos os tiles y sólo quedan las cards. Esta va al lado del ordenar por.”
- S3: “para vista simple la card es la misma, esa card no iene sede. No añadas cosas extras, la funcionalidad de abrir el modal sigue siendo la misma, no crees nuevos componentes si no es necesario, no modifiques los existentes en su diseño.”
- S4: “Se pueden aplicar filtros sobre la vista simple.”
- S5: “hay que evitar lo más posibles relecturas intensivas en el sitio. el rendimiennto es importante. Actualmente precalculamos en build varias cosas, quizá pueda ser beneficioso en algunos casos sin aumentar demasiado el bundle size”
- S6: “trabajarás en otro workspace nno en esta rama dev”

## Tasks

- T1 — S1–S6 — inline, in progress — Chromium, app and final distribution build passed; work-unit commit and native review pending.
- T2 — acceptance check — blocked — the full suite cannot be marked green until the existing artist-detail/catalog failures on base `30a7e16` are resolved independently; leave the main worktree's artist edits alone.

## Log

- L1 (original request):
  ```text
  Necesitamos trabajar sobre algunos aspectos del sitio. Actualmente la UX tiene algunos problemas que quiero que resolvamos:
  1. Ordenar por horario. No tenemos una manera de ordenar por, sugiero añadir un ordenar por debajo, al lado del filtro dentro de la barra flotante, ordenar por horario y escenario, ambas opciones.
  2. Los detalles de los tiles a veces molestan en vez de sumar, en su totalidad no se ve mal, pero funcionalmente no ayudan. Quiero que añadamos una opción de vista simple. donde desaparecen todos os tiles y sólo quedan las cards. Esta va al lado del ordenar por.

  Primero analiza la situación
  ```
- L2:
  ```text
  para vista simple la card es la misma, esa card no iene sede. No añadas cosas extras, la funcionalidad de abrir el modal sigue siendo la misma, no crees nuevos componentes si no es necesario, no modifiques los existentes en su diseño.

  Se pueden aplicar filtros sobre la vista simple.

  Comienza con en aanálisis. trabajarás en otro workspace nno en esta rama dev
  ```
- L3:
  ```text
  hay que evitar lo más posibles relecturas intensivas en el sitio. el rendimiennto es importante. Actualmente precalculamos en build varias cosas, quizá pueda ser beneficioso en algunos casos sin aumentar demasiado el bundle size
  ```
- L4: “comieza”
- L5: Created and registered `.worktrees/arc2026-lineup-controls` from committed `dev`, with no transfer of the main worktree's local edits. Offline frozen installation passed. Agreed approach: keep the default poster and modal, keep day/view/order independent, reuse nodes and existing day membership, consider build-time index permutations, benchmark the isolated base and the candidate.
- L6: Observed RED for the missing sort/simple controls and sort-reset after changing the day in simple view; then four focused cases passed. Independent verifier was unavailable for commit-bound checks (process cleanup unconfirmed) but identified the single-digit hour issue (reproduced RED) and hidden heading. Fixed both and removed repeated sorting of row-major slot arrays.
- L7: Full distribution build passed before the final heading/hour adjustments. Full repository tests reported 16 failures (9 timeouts and 7 content assertions); clean-base differential is needed before attributing them. Baseline edition build initially failed across filesystems (`EXDEV`); building to an ignored same-filesystem location succeeded. Baseline offline install under `/tmp` could not use the cached tarballs; differential moved to the worktree filesystem.
- L8: Final edition type/build and Chromium checks passed at 320, 768, and 1440 px (default poster/day output identical, visual order matches DOM, simple grid excludes tiles, headings preserved, modal Escape restores focus, and filter survives switching). Browser session was closed. Gzip deltas on `/musica/`: HTML +569 B, initial JS +611 B, CSS +34 B. At 320 px with Chromium 4× CPU throttle (10 changes per view), simple median synchronous handler 1.85 ms versus 195.45 ms for the baseline poster; median elapsed across two frames 107.2 ms versus 248.9 ms. These are local synthetic timings, not real-user latency.
- L9: Serial Vitest differential passed the comparison: exactly the same seven existing artist-detail and catalog failures on clean `30a7e16` and candidate (base: 132 passed; candidate: 137 passed). The nine earlier timeouts did not recur in either serial run. The full suite run was not green and is not claimed as such.
- L10: Final `pnpm build` exited 0 and composed 594 files.
