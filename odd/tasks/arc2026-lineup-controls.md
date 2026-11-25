# ARC 2026 lineup controls
Branch: `feat/arc2026-lineup-controls` (base `30a7e16`); delivery: ask-on-risk.
Checks: focused Vitest and browser tests, compressed output comparison, repository build.

## Specs

- S1: “Ordenar por horario. No tenemos una manera de ordenar por, sugiero añadir un ordenar por debajo, al lado del filtro dentro de la barra flotante, ordenar por horario y escenario, ambas opciones.”
- S2: “La vista simple debe mantener el slot del título, los links interiores, solo desaparecen los tiles, lo dije explícitamente.” “Hay 10 columans end esktop, cada card utiliza 2 columnas x1 row, entonnces caben 5 artistas por row” “O sea, sí se adaptan los slot reservados. Igual que cuando cambiamos por día”
- S3: “para vista simple la card es la misma, esa card no iene sede. No añadas cosas extras, la funcionalidad de abrir el modal sigue siendo la misma, no crees nuevos componentes si no es necesario, no modifiques los existentes en su diseño.”
- S4: “Se pueden aplicar filtros sobre la vista simple.”
- S5: “hay que evitar lo más posibles relecturas intensivas en el sitio. el rendimiennto es importante. Actualmente precalculamos en build varias cosas, quizá pueda ser beneficioso en algunos casos sin aumentar demasiado el bundle size”
- S6: “trabajarás en otro workspace nno en esta rama dev”
- S7: “Rompiste las animaciones, eres conciente de eso?”
- S8: “[Image#1] Te parece eso una UI correcta?”
- S9: “Creo que estás cambiando las dimensiones del os rows y columns? al usar vista simple no debería moverse una card que está bien puesta pero se mueve hacia arriba, como si cambiara algun padding o algo así”
- S10: “ademas de que los slots de informació no se posicionann correctamennte en su espacio reservado”

## Tasks

- T1 — S1–S10 — functionally verified; final work-unit commit, independent verifier and native review pending — initial commit `b986975`; correction preserves responsive track sizes and packs simple cards around adaptive information reservations.
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
- L11 (user correction; message includes a screenshot of the two-row floating bar):
  ```text
  Uf a ver, varias cositas:
  1. Rompiste las animaciones, eres conciente de eso?
  2. [Image#1] Te parece eso una UI correcta?
  3. La vista simple debe mantener el slot del título, los links interiores, solo desaparecen los tiles, lo dije explícitamente.
  ```
- L12: Chromium reproduced the rounded-bar crowding/wrapping and missing title/interior links at 320/390/768/1440 px. Two integration tests reproduced missing filter motion with venue sort in both views. Corrected the toolbar spacing, kept only motif visibility conditional, and made motion reuse the same cached ranked slots as CSS. Four focused tests passed.
- L13: Production-style Chromium check at 320/390/768/1440 px passed; visible information slots and their links matched both views, no motif remained visible in simple view, and real card transform animations ran in both modes with venue sort. Screenshot visually inspected at 390 px. Full targeted suite detected a changed accessible fieldset label (103/104 passed); restored the original label and both render tests passed. The final build and checks are being repeated against that exact correction.
- L14 (user clarification): “'pero quedaron todos los vacíos en la vista simple xd. La idea es que se orden uno al lado del otro, con la posición de los vacíos de links entre el nuevo orden. Entiendes?” Keep genuine information amongst the cards in reading order, not the decorative grid's empty tracks. This supersedes any previous check that expected the information's literal grid coordinates to be identical in both views.
- L15: Previous correction (before compaction) passed the six targeted test files, `pnpm build`, and Chromium at all four widths. Retain its toolbar and motion work. Compact layout implementation started in the same feature worktree; previous coordinate-equality check is not sufficient for the clarified spec.
- L16 (user clarification; supersedes L14's inferred placement rule):
  ```text
  Es que de verdad no entiendo qué haces, el alyuout es una grilla cierto? hay slots reservados.

  El orden de vista simple, lo que hace es desaparecer los tiles, PERO las dimensiones de la grid se mantienen, solo se adapta la cantidad de rows, los colums es lo mismo. Luego,  cada card, se ordenna a partir de la nueva layout. Hay 10 columans end esktop, cada card utiliza 2 columnas x1 row, entonnces caben 5 artistas por row, si hay slots reservados e esa row, entonces se posicionan nonrmalmente pero considerando que el slot reservado no se toca, si sobra espacio, se deja vacío solamente.
  ```
- L17 (user correction; supersedes the fixed-reservation interpretation of L16): “O sea, sí se adaptan los slot reservados. Igual que cuando cambiamos por día”. Reuse existing fixed/movable rules; preserve blocks, footprints and links, but do not freeze the position of movable reservations.
- L18 (user observation): “Creo que estás cambiando las dimensiones del os rows y columns? al usar vista simple no debería moverse una card que está bien puesta pero se mueve hacia arriba, como si cambiara algun padding o algo así”. Distinguish logical cell movement from drift caused by row sizing; measure the same card's physical position where its logical cell is unchanged.
- L19: Chromium reproduced drift with no padding change on the visibility-only build. At 390 px, rows 5–8 lost 185.25 px total and Polter rose by precisely that amount while remaining in row 9. At 1440 px, Niño Cohete stayed in row 2 and rose 7 px as the first track shrank. Keep a separate geometric check for stationary logical placements.
- L20: “fixealo”. Dense track candidate passed 86 focused tests and browser packing/footprints/reservation checks, but its analytical CSS floors changed 48 shared mobile tracks at both 320 and 390 px; tablet and desktop were within 1 px. The failed TypeScript strategy assignment was corrected by making the dense information argument optional, matching the established strategy; app type and build then passed. Need exact bounded grid-track capture, not another CSS floor approximation.
- L21: “o sea no sé, yo sigo viendo que las rows y columns no mantienen las dimensiones en desktop”. Expand final CSSOM checks to 1280/1366/1440/1600/1920, not just 1440. “ademas de que los slots de informació no se posicionann correctamennte en su espacio reservado”. Check rendered information placement as well as compiled footprints. User next reported “Ahora sí”; keep current visuals and finish verification rather than introducing unrelated layout changes.
- L22: Exact sizing uses one computed-grid-style read per uncached day and viewport; no per-card geometry reads. Targeted Vitest passed 96 tests. `pnpm build` composed 594 files. Chromium passed actual shared track sizes at 320/390/768/1280/1366/1440/1600/1920 px, dense placements and card wrappers, reservation positions and links, and live filter animation in both views. All temporary browser sessions closed. Home initial JS delta against `30a7e16`: +1363 gzip bytes; Home HTML: +1025; CSS: +148. No full suite green claim because of T2.
