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
- S11: “Primero quiero que lo movamos a la parte superior, debajo del header. Eso implica añádir una separación unn poco mayor a la parte superior del área del grid.” “el panel debe quedar fijo. y quedar mas cerca del header.”
- S12: “En desktop debe estar en linnea, el filtro de fecha conn el ordenar por y el botón de vista simple.”
- S13: “El botón de vista simple debe tener un ícono, no tener el esapcio de check, si no que el botón dar a entender que estamos en vista simple o no, Puedes ser sin ícono, pero en apado esta levemente opacity y en prendida con color y solido.”
- S14: “El ordenar por, cambiar el diseñño del dropdown a lago más acorde al aestética del sitio y añádirle animación de apertaura y cierre.” “además hay que refinar el diseñno también, mejorar los roundeds, el input del dropdown, etc.”

- S15: “Al scrollear hacia abajo este floating panel se oculta, al scrollear hacia arriba vuelve a aparecer. Se oculta por detrás del header y con un leve fade out. Y aparece de la misma manera inversa.”
- S16: “Haz todo rounnded full, añáde más separación entre los filtros y el ordenar por, prefiero que pongas le ordenar por ecima del iput y hagas el iput más agosto, no es necesario que sea tan largo igual.” “quita el bg gris de los filetros tambine” “pero el alto del input del dropdown y su texto debe ser el mismo de todo el resto po hermano” “sí, debe quedar arriba, pero la altura del label + input debe quedar alineado, enntiendnes esa mierda o no? no es tan complehjo, es evidente que ahora está desalineado y queda ese espacio horrible sobre los botones. Afhicaste en "afiche" pero no el input completo, eres tonto?”

- S17: “Necesito que en mobile siempre haya una barra de tiles arriba y abajo de cada slot de info. Y evitar que existen dos o tres barras de tiles entre cada item. Eso pasa a veces, verificalo y dime porq ué pasa y cóµo corregirlo sin afectar las demas layouts”. “[Image#12] hay un problema, quizá fue mi culpa, pero el title no debe tener el tile arriba. Y abajo debía conservar los tiles que tenian, que creo que eran 4x2”. “era solo para los info slots interiores excepto el titulo”.

## Tasks

- T1 — S1–S10 — done, functionally and independently verified; native review declined for this committed candidate — commits `b986975` and `1850852`.
- T2 — acceptance check — blocked — the full suite cannot be marked green until the existing artist-detail/catalog failures on base `30a7e16` are resolved independently; leave the main worktree's artist edits alone.
- T3 — S11–S16 — functionally verified — final pill toolbar and motion passed; commit `25d1ab6`; independent verification unavailable (scratch preparer rejects linked worktrees), native review declined for this candidate.

- T4 — S17 — verified — mobile-only interior separator projection and tests — work unit `fix(arc2026): normalize mobile interior tile strips`.

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
- L23 (new UI request):
  ```text
  Debemos trabajar sobnre la UI del panel ahora. No me gusta. Primero quiero que lo movamos a la parte superior, debajo del header. Eso implica añádir una separación unn poco mayor a la parte superior del área del grid.

  En desktop debe estar en linnea, el filtro de fecha conn el ordenar por y el botón de vista simple. El botón de vista simple debe tener un ícono, no tener el esapcio de check, si no que el botón dar a entender que estamos en vista simple o no, Puedes ser sin ícono, pero en apado esta levemente opacity y en prendida con color y solido.

  El ordenar por, cambiar el diseñño del dropdown a lago más acorde al aestética del sitio y añádirle animación de apertaura y cierre.
  ```
- L24: Initial panel build and Chromium checks passed (320/390/768/1280/1440 px, both picker transitions, keyboard and reduced motion), but desktop screenshot showed the undesired 80 px gap. User correction:
  ```text
  el panel debe quedar fijo. y quedar mas cerca del header. /tmp/gpcQgkQy/pi-clipboard-fbfdba66-f991-4635-8e37-98823849312a.png

  además hay que refinar el diseñno también, mejorar los roundeds, el input del dropdown, etc.
  ```
- L25 (scroll behavior):
  ```text
  Además haremos lo siguiente:

  - Al scrollear hacia abajo este floating panel se oculta, al scrollear hacia arriba vuelve a aparecer. Se oculta por detrás del header y con un leve fade out. Y aparece de la misma manera inversa.
  ```
- L26: The independent verifier passed T1 on committed `1850852` (87 focused tests, 12 Chromium cases, app type and both edition builds). Confirmed dense packing, motion and preserved dimensions and reservations; original poster behavior matched the baseline. T3 sticky/scroll changes are separate.
- L27: `pnpm build` passed (594 files); 96 targeted tests passed. Chromium passed at 320/390/768/1280/1440 px: 12 px from header, desktop controls aligned, sticky hides and returns with intermediate opacity samples and no grid shift, and picker opens/closes with motion and honors reduced motion.
- L28 (visual refinement, with screenshot): “Haz todo rounnded full, añáde más separación entre los filtros y el ordenar por, prefiero que pongas le ordenar por ecima del iput y hagas el iput más agosto, no es necesario que sea tan largo igual.” Next message: “quita el bg gris de los filetros tambine”. Then: “pero el alto del input del dropdown y su texto debe ser el mismo de todo el resto po hermano”.
- L29: The final distribution contains the shared sizing classes. `pnpm build` and 96 focused tests passed. Chromium at 320/390/768/1280/1440 passed equal computed control height (44 px), font family, size (14 px), weight (700) and line-height (20 px), and verified the label above, selector width, transparent day group, pill radii, and unchanged scroll/picker transitions. Desktop screenshot inspected.
- L30: T3 independent verifier inspected the exact commit diff, but the scratch preparer rejected the linked worktree (`unsupported repository: ordinary single-root Git directory required`); it ran zero tests. Independent browser verification is therefore unavailable, not a failure of the previously passed parent Chromium probes. Unsupported-browser picker fallback was not runtime-tested.
- L31 (alignment correction; screenshot showed an extra row above the other buttons): “sí, debe quedar arriba, pero la altura del label + input debe quedar alineado, enntiendnes esa mierda o no? no es tan complehjo, es evidente que ahora está desalineado y queda ese espacio horrible sobre los botones. Afhicaste en "afiche" pero no el input completo, eres tonto?” Measure the full label wrapper and the panel's top/bottom spacing, not just the select.
- L32 (supersedes the integrated-label proposal): “Ah no es que eres pelotudo, el texto queda afuera, pero la píldora es más angosta, es tan dificl? porque propones cosas que no te he pedido”. The label stays outside and above the pill; reduce the pill height so the complete stack fits the same 44 px as adjacent controls.
- L33: The integrated-label build failed the clarified external-label browser checks. The corrected `30 px` select plus `12 px` label and `2 px` gap passed `pnpm build`, the render suite, and Chromium at 320/390/768/1280/1440 px. The complete sort group measured 44 px, had zero vertical misalignment on desktop, and preserved native picker and toolbar transitions. Inspected the final 1440 px screenshot.
- L34: “al finl, ahora quiero que el dropdown use la dimensión igual a como quedó la pildora, además el hover de las fichas no seleccionadas deben tener el gris que tienen los botones del día. El botón de vista simple sácale el border y ha lo mismo el hover lo pone gris y en activo quedac on el color”. Chromium RED confirmed the menu was already 112 px wide like its trigger, but options were taller and the option/toggle hover and border did not match. The scoped CSS change preserves the width and keyboard focus while matching the 30 px pill height and date hover color. Chromium GREEN at 390/1440 px verified option dimensions, identical hover backgrounds and selected colors, and the borderless toggle. The build and render tests passed.
- L35 (panel screenshot): “Bien, necesito que reduzcas el padding X para que coincida con el y dentro. Además cuando estamos navegando y hacemos aparecer la barra, debe conservar el gap entre el hader y el panel. Además pon el border del panel del mismo color del borde bottom del header. Igual que el borde de la pildora del ordernar por.” Chromium verified uniform padding, matching borders, and the same 12 px gap at the top and after reappearance.
- L36: “reduce el borde radius del dorpdown, añáde un gap entre los itemes de la lista”; “haz ese cambio”. The option utilities moved to Tailwind, preserving the native-picker feature detection. Chromium verified a 12 px menu radius and 4 px gaps at 390/1440 px. The broader panel probe failed to observe the opening animation at 390 px.
- L37: “Necesito que este panel de filtros y order se renderice como hyml estático, actualmente se nota mucho el layout shhift porque se carga en cliente. Puedes rvisar primero?”; “aplica ese fix”. The old built HTML failed the static visible/disabled assertion; the first render-suite invocation timed out. The corrected HTML emits a visible disabled presentation fieldset; the client only enables it, and teardown disables it again. Legacy controls retain their hidden lifecycle. Build and 90 focused tests passed. In Chromium, disabling JS or enabling all five controls gave identical grid offsets on home at 390 px (231 px) and música at 1440 px (259 px). Sorting and simple view still work.
- L38: “Bien, ahora necesito que trabajemos la versiónn mobile, es demasiado grade y está mal estilizada”. Chosen layout: one row with a native day picker, sort picker and simple-view toggle. “Hay que refinnar el estilo, esos espacios a los latereals son demasiado, quizá sí alcanza para poner el votón de vista simple con texto”. Chromium verified a 62 px row at 320/375/390 px, the label from 375 px, desktop day radios at 1440 px, and selected-day synchronization across the breakpoint.
- L39: “no entienndo, las cards siguen siendo dispares [Image#5] entiendes que hablo del alto cierto?” Chromium RED observed 10–34 resized cards per mobile case; the corrected compact grid reuses the original track heights under each card without individual geometry reads. GREEN found zero resized cards across five mobile cases (320–767 px, including both sort modes and both day filters) and one unchanged desktop case (1440 px). `pnpm build` and 98 focused tests passed. The follow-up work unit includes the responsive toolbar and this card-height correction (`5201a93`).
- L40: “Necesito que en mobile siempre haya una barra de tiles arriba y abajo de cada slot de info. Y evitar que existen dos o tres barras de tiles entre cada item. Eso pasa a veces, verificalo y dime porq ué pasa y cóµo corregirlo sin afectar las demas layouts”. “Qué pasó con el tema de las doble o triple tiles en mobile?” “procede con el fix”. Built Todos output showed Plaza de Armas had two full rows above and zero below, while Redes had three above and two below.
- L41: “[Image#12] hay un problema, quizá fue mi culpa, pero el title no debe tener el tile arriba. Y abajo debía conservar los tiles que tenian, que creo que eran 4x2”. “era solo para los info slots interiores excepto el titulo”. Preserve all title openings and the homepage’s original 4×2 band; scope separator changes to interior information only.
- L42: T4 focused RED: 3 failed against the wider, superseded projection; GREEN: 122 tests passed. Build and Chromium passed across 16 day/order/viewport combinations. A differential of generated plans matched the old homepage opening (including artwork), category mobile layouts, tablet and desktop, and simple-view placement plans exactly.
