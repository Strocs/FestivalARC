# ARC 2026 — configurable poster grid
Objective: closed — the human visually accepted the current content-only poster design as-is. Production implementation is not authorized by this closure.
Branch: dev (unchanged). Design only; no app implementation, commits or publication. Checks: Chromium through playwright-cli; structural checks.

## Specs
- S1: “La nueva propuesta considera una grid de 10 columnas, con espacios de 160px de ancho por 152px de alto aproximadamente (configurable) donde se pondrán los diseños de la identidad gráfica siguiendo la misma lógica del afiche (ver imágen de refs).”
- S2: “Dentro de esta grid, se utilizarán espacios donde aparecerá el nombre de los artistas y también información relevante (links, información contextual, etc) que será fácilmente posicionable y configurable n slots de altura y n de ancho.”
- S3: “La cantidad de rows será variable, dependiendo de la cantidad de inforamción que exista, la posición de los artistas tendrá reglas específicas y posicion específica configurable y deberá reaccionar a los slots de información (no overlaps).”
- S4: “1 slot de altura 2 de ancho.” “Siempre deben haber 2 slots debajo libres.” “Se posicionarán de forma escalonada según la imágen.” “Al hacer click sobre un nombre, este se expande utilizando ahora un espacio de 2x2 slots. Donde aparecerá imágen e información adicional.”
- S5: “Se creará un componente base para los nombres de los artistas que encapsule la lógica de apertura, información, estilos, hover, etc.”
- S6: “La grid debe adaptarse dinámicamente a la cantidad de artistas, se añadira un filtro por días en el futuro, por lo que se debe adaptar el layout de forma natural.”
- S7: “Se considerarán animaciones de movimiento de los slots al aplicar filtros, no ocurrirá un cambio de un momento a otro si no que los slots se adaptarán y ajustarán con movimientos de los cuadrados de forma de darle efecto wow.”
- S8: “Las imágenes representan fielmente lo que se quiere buscar pero se debe considerar que implementa un catalogo acotado y que la información de los slots de info pueden cambiar. El orden de los diseños de la identidad tampoco es definitiva y no se debe seguir como guía.” “Nota: En la última referencia, el contenido de la ficha expandida no es esa, es sólo ilustrativo.”
- S9: “Artistas confirmados hasta el momento:” — preserve all 46 exact names and the 16 company associations in L1; do not substitute the previous repeated demo roster.
- S10: Selected answer: “Reserva para expandir (recomendado)” — “Dos celdas contiguas justo debajo, sin artistas ni información; pueden mostrar motivos. Al abrir, la ficha ocupa esa reserva y queda en 2×2.”
- S11: “Ojo que según el afiche los motivos son más de seis, si faltan hay que crearlos”
- S12 (current-pass override):

Rompe demasiado la propuesta original.
- No añadas los filtros aún, No implementes el nav bar
- La regla está pésimamente implementada, No sigue la lógica que mencioné, ni la lógica que tienen las imágenes.
- Respetar tamaños de textos según la imágen. 
- El nombre debe respetar tamaño, (intentar descubrir tipografía para intentar recrear lo más fiel posible: [Image#4]
- Para el orden de los componentes de nombre, siempre se sigue el mismo orden: una fila con 3 elementos separados por dos esapcios cada uno, la de abajo tiene 2 elementos comenzando por dos espacios y separados por dos espacios. Esto construye la estructura escalonada que mencioné.
- No inventes el footer, céntrémonos en el conteido primero. El componentes de artistas, por el momento, deja solo el nombre del artista y no le añadas la interactividad aún.

S12 supersedes the previously demonstrated expansion, filtering, controls, navigation, footer and motion for the current design pass. S4/S5/S7 retain future requirements only; no present interaction is authorized. S10 still reserves the cells beneath the static name. The precise stagger is an absolute row cadence: even rows start at columns0/4/8, odd rows at2/6; blocked positions are skipped, not shifted to arbitrary columns.

- S13 (motif-only correction; current static layout accepted):

Mucho mejor. Los patrnes no están correctos, necesitamos más fiabilidad:
- [Image#5] marque en rojo los que estan mal implementados, dejaré las versiones correctas:
[Image#6] [Image#7] [Image#8] [Image#9] [Image#10]

The red-marked variants are chevrons-right, chevrons-left, lightning, orbits-rose, orbits-cyan and rings. Image#6 supplies the two right-pointing half-tile triangles; #7 the asymmetric repeated lightning; #8 the orbital contours (reuse geometry for cyan variant); #9 the opposing concentric semicircles; #10 the two left-pointing half-tile triangles. Preserve all unmarked motifs and the content-only3/2 layout, title, names and static behavior from S12.

- S14 (final design acceptance): “Están bien, no te preocupes, podemos cerrar el diseño.” This explicitly closes the design as-is; further motif refinement, source-image acquisition and quantitative closure are no longer requested. Preserve the failed ring comparison as historical evidence, not a pass. No app implementation or publication follows from this acceptance.

## Tasks
- T1 [S11/S13/S14] dropped | Route: parent inline | Commit: none (design-only) | Remaining precision refinement/source-file request discontinued by explicit S14 acceptance. Existing six-symbol design retained; the ring metric is still a recorded failure, not a successful verification.
- T2 [S1–S12] done | Route: parent inline; one coupled prototype behavior, no writer trigger | Commit: none (design-only) | S12 correction written to the existing artboard/brief/manifest only. RED6/11 -> GREEN11/11 public Chromium groups. Original title isolated without changing source artwork; Poppins900 outlined for names. Motif board/export and app preserved.
- T3 [S1–S14] dropped | Route: parent inline | Commit: none (design-only) | Remaining quantitative closure discontinued by S14; retain all observed checks/failures and the visually accepted artboard. No retry or source-file request remains.

- T4 [S14] done | Route: parent bookkeeping only | Commit: none | Acceptance recorded in brief/task file and Engram; unfinished precision/verification tasks dropped per explicit human closure. No source/visual changes or new checks.

## Log
- L1 — Original user request, verbatim:

vamos a trabajar en el diseño del festival activo de este proyecto, actualmente hay una propuesta que he rediseñado por completo, aunque hay elementos que pueden ser relevantes conservar. Como criterio gneral, no me importa eliminar trabajo hecho que ya no necesitamos para la nueva propuesta.

De las cosas a conservar pueden ser los diseños de las formas de la identidad gráfica realizadas en svg (confirmar).

La nueva propuesta considera una grid de 10 columnas, con espacios de 160px de ancho por 152px de alto aproximadamente (configurable) donde se pondrán los diseños de la identidad gráfica siguiendo la misma lógica del afiche (ver imágen de refs).

Dentro de esta grid, se utilizarán espacios donde aparecerá el nombre de los artistas y también información relevante (links, información contextual, etc) que será fácilmente posicionable y configurable n slots de altura y n de ancho.

La cantidad de rows será variable, dependiendo de la cantidad de inforamción que exista, la posición de los artistas tendrá reglas específicas y posicion específica configurable y deberá reaccionar a los slots de información (no overlaps).

Las reglas para la posición de los nombres de los artistas son:
- 1 slot de altura 2 de ancho.
- Siempre deben haber 2 slots debajo libres.
- Se posicionarán de forma escalonada según la imágen.
- Al hacer click sobre un nombre, este se expande utilizando ahora un espacio de 2x2 slots. Donde aparecerá imágen e información adicional.

## Componentes
Se creará un componente base para los nombres de los artistas que encapsule la lógica de apertura, información, estilos, hover, etc.

La grid debe adaptarse dinámicamente a la cantidad de artistas, se añadira un filtro por días en el futuro, por lo que se debe adaptar el layout de forma natural.

Se considerarán animaciones de movimiento de los slots al aplicar filtros, no ocurrirá un cambio de un momento a otro si no que los slots se adaptarán y ajustarán con movimientos de los cuadrados de forma de darle efecto wow.

## Referencias imágenes

Las imágenes representan fielmente lo que se quiere buscar pero se debe considerar que implementa un catalogo acotado y que la información de los slots de info pueden cambiar. El orden de los diseños de la identidad tampoco es definitiva y no se debe seguir como guía.

**Referencia base sin artistas**
[Image#1]

**Referencia con artistas y slots de info**
[Image#2]

**Referencia con un artista expandido**
[Image#3]

Nota: En la última referencia, el contenido de la ficha expandida no es esa, es sólo ilustrativo.

## Artistas confirmados hasta el momento:

1. Artistas nacionales (18)
1. Niño Cohete
2. Dulce y Agraz
3. Javiera Mena
4. Gepe
5. Javier Barría
6. Fernando Milagros
7. Rosario Alfonso
8. Claudio Valenzuela
9. Fernando Ubiergo
10. Pedro Piedra
11. Núñez Briceño
12. José Alfredo Fuentes
13. Innundaremos
14. Guaype Club (Infantil)
15. Dejenme Dormir
16. Nando García
17. Leró
18. Josefa Errazuriz (DJ)
2. Música artistas regionales (12)
1. Polter (Ovalle)
2. Quitá de Bulla (Salamanca)
3. Shicris
4. Esteban y los Hurtados
5. Freshki
6. Jazztacuatico
7. Duerme y Cae!
8. Kalishe
9. Weinkeys + blackbeat
10. Stendhal
11. Last Whisper
12. Medinamico
3. Artes escénicas regionales (16)
Nº    Artista / Obra    Compañía
1    Lobas    Circo Kaleidoscopio
2    Yaru    Compañía La Feroz
3    El Humedal    Compañía Los Mil Nombres
4    Pulsando    Escuela Zapato Rojo y Compañía
5    Removernos a Cielo Abierto    Colectivo Zona de Obras
6    Yatiri    Fundación Sociedad Bach La Serena
7    Red Lambe Norte    Red Lambe Norte Chile
8    Awicha    Laboratorio Creativo Remolino
9    Narrando Mundos en Bicicleta    Títeres Ojos de Agua (Ovalle)
10    Bendita Agua    Compañía La Boda (Vicuña)
11    Las Luciérnagas y el Origen del Fuego    Compañía Cuenta Cuentos Tricahue
12    Llamada de Emergencia    Compañía Noche de Payasas
13    Martín V/S Trampolino Maletines    Compañía de Teatro Viento Norte
14    Trans-Humante    Espacio La Isla (Ovalle)
15    Juan Manotas y el Origen del Carnaval    Compañía de Teatro Pucará
16    Absurdo    Circo Kalendero

- L2 — User selection: “Reserva para expandir (recomendado)”.
- L3 — User correction, verbatim: “Ojo que según el afiche los motivos son más de seis, si faltan hay que crearlos”.
- L4 — Scope: new design/arc2026-slot-grid/ only, plus this feature document. Preserve existing modified/untracked app, archive, test, design-system and previous-proposal files. Previous square portrait, fixed alternation and no-motion proposals are historical, not constraints on this new brief. Production implementation remains unselected.
- L5 — Poster inventory: seven geometry families (directional chevrons, lightning, rosette, concave sparks, pointed star, organic orbits, opposing concentric semicircles), with directional and palette variants. Existing six-family component omits the concentric semicircles and several variants. New SVG reconstructions are approximations of the raster, not original vectors.
- L6 — Prototype assumptions, not approved production rules: responsive column reduction, sample information-block coordinates, editing controls and category-based motion demonstration. No assigned festival days, confirmed schedule, biographies or artist portraits have been supplied. Missing content must be labeled honestly. One faithful direction with interactive base/catalog/expanded states and a separate motif inventory is more useful than unrelated aesthetic alternatives.
- L7 — Passive visual work has no meaningful test-first RED for appearance; functional geometry/interaction checks will run on the prototype. No existing app behavior is changed. The shell gentle-ai executable is unavailable (exit127); no native authority was started.
- L8 — Created one interactive direction (base/catalog/expanded states) and a separate motif inventory: seven families, eleven variants, including missing opposing rings. Existing system/app/previous designs remain untouched. Browser checks pending.
- L9 — First Chromium functional run failed (job-2, exit1): 960px kept ten columns and five long-name buttons overflowed vertically. Earlier checks reached roster, reservations, expansion/focus, company associations, filtering, configuration validation and desktop widths. Corrected proposed breakpoints to 10 columns at >=1200px, 6 at 768–1199px, 2 below 768px; no text clipping or font shrink workaround. The failed log is retained at /tmp/gpZEjvoj/gentle-jobs-CPdU1D/job-2.log. Corrected functional run pending.
- L10 — T3 verification complete: corrected Chromium run job-3 exit0, 17/17 functional groups. All 46 exact names, 16 company associations, 2×1/2×2 spans, collision-free lower reservations, expansion without moving other artists, keyboard/focus, category reflow, exact anchors, rejected-input layout/counter preservation, copy fallback, motion/reduced motion, and 320/390/600/768/960/1440/1920px pass. Initial 960px failure remains recorded at L9. No page/console errors or external resource requests in the corrected suite.
- L11 — Visual follow-up retained the original lightning path rather than a poorer approximation, compacted the proposed mobile hero, and allowed 1×1 information spans including column9. Focused final probes pass at 320/390/768px and for the 1×1 block; SVG export/inline parity, six-color palette, XML/manifest and whitespace checks pass. Ink/paper contrast19.422:1, ink/cyan15.509:1, ink/pink5.203:1. Desktop/mobile/expanded and motif screenshots inspected; not a full WCAG or cross-browser certification.
- L12 — Native ASSESS: medium fallback, nativeRisk unassessable because existing untracked workspace files require explicit scope; candidate null, unknown review outcome. Returned plan: writerSelfVerification=true, independentVerifier=false, so no independent verifier or native review was started. This is not a native approval. No application build/tests run, since no app source changed. Existing source, old proposals, design/system.md and historical task files preserved; no commits/push/PR.
- L13 — Deliverables: design/arc2026-slot-grid/02-poster-grid.html (interactive base/catalog/expanded states), 01-motif-library.html (seven families/eleven variants), motifs.svg, brief.md and design.json. Results/screenshots: output/playwright/arc2026-slot-grid/. Canvas opened/refreshed with slug arc2026-slot-grid; browser arc-slot-grid and owned temporary static server job-1 closed. Generated CLI artifacts moved to the ignored output folder. Risk: none (isolated design, no shared application contract changed). Next: human visual feedback/selection; production implementation is not authorized by this completed design unit.
- L14 — User correction, verbatim:

Rompe demasiado la propuesta original.
- No añadas los filtros aún, No implementes el nav bar
- La regla está pésimamente implementada, No sigue la lógica que mencioné, ni la lógica que tienen las imágenes.
- Respetar tamaños de textos según la imágen. 
- El nombre debe respetar tamaño, (intentar descubrir tipografía para intentar recrear lo más fiel posible: [Image#4]
- Para el orden de los componentes de nombre, siempre se sigue el mismo orden: una fila con 3 elementos separados por dos esapcios cada uno, la de abajo tiene 2 elementos comenzando por dos espacios y separados por dos espacios. Esto construye la estructura escalonada que mencioné.
- No inventes el footer, céntrémonos en el conteido primero. El componentes de artistas, por el momento, deja solo el nombre del artista y no le añadas la interactividad aún.

- L15 — Reconciled the full mirror with the actual task file (terminal whitespace only), preserved dev and all pre-existing edits. Current authoring scope is the existing main artboard and its metadata/brief; no alternative redesign, production source, navbar/footer, category/day filters, controls, artist interaction or animation. T2/T3 reopened; original motif inventory remains valid.
- L16 — Reproduced the human-reported mismatch in the existing artboard before deciding/fixing: Chromium RED exit1, 11 groups/6 failures. Extra nav/footer/controls, interactive metadata-bearing artist cards, wrong absolute stagger starts, 43 unfilled valid stagger positions, title only2.79 cells wide and click expansion were observed. Existing no-overlap and roster checks passed, but did not prove reference fidelity. The public check now compares uppercase labels case-insensitively to unchanged stored spellings, because CSS uppercase is intended. No app edits.
- L17 — Read-only typography map found existing combined title artwork, not an exact font identification. Spot-check confirmed LOGO_HERO.png1920×520 is transparent and contains the exact requested four-line lettering. Main h1 uses an inline copy with SVG viewBox1068/28/725/465 excluding ARC logo. Names/date/secondary type use outlined Poppins Black900 from official Google Fonts metadata/TTF (OFL), no external resources or changes to production fonts. No archive font was copied. Generator preflight initially rejected a four-line name before any main-artboard write; baseline pitch24 instead of26 preserves26px font size and fits the existing strip.
- L18 — Current content-only artboard GREEN:11/11 public Chromium groups, exit0. Exact row parity and starts, no arbitrary valid-slot holes,24 rows for46 names, full lower reservations, title4 cells wide, name-size ratio0.171, no extra UI or artist interaction, no runtime errors/external requests. Visual inspection and final structural readback still pending; previous17 groups remain historical.
- L19 — Final public strip-containment check found one remaining issue: the unspaced name Trans-Humante exceeds the reference capsule width at1920px. All46 use the same font size and the full3/2 cadence is correct; no scripts, animation, extra UI or page overflow. Reopened T2 for a natural hyphen line break without changing spelling or type size; T3 remains pending. Failed final-static-checks.log retained.
- L20 — Corrected Trans-Humante by wrapping at its existing hyphen, preserving the exact accessible spelling and shared26px font size. Final public containment run4/4 PASS (1920/1440/750px plus JavaScript-disabled rendering): all46 names fit their strips, full unobstructed rows follow3/2 exactly, font-size/cell-width ratio0.1625 is identical for every name, no scripts/animation/extraUI/page overflow. Initial containment failure retained, corrected log final-static-corrected.log. Final visual/structural closure in progress.
- L21 — Final visual readback inspected the full corrected sheet and a750px reference-scale crop. Title/date/name/secondary-text proportions now follow the supplied composition; the original title lettering is reused rather than falsely identified. All11 existing motif symbols remain unchanged and the original PNG bytes are preserved. No open canvas comments; no comment IDs resolved.
- L22 — Closed correction scope: only02-poster-grid.html, brief.md, design.json and this feature record changed; no app/archive/system/other-artboard edits, no commits/publishing. Agent browser arc-static-correction closed (session list empty), temporary static server job-4 stopped; requested canvas refreshed and left open. Evidence: correction-verification.json and corrected-content-{1920,1440,750}.png under output/playwright/arc2026-slot-grid/. Native ASSESS for this version remains medium fallback/unassessable for existing untracked scope, self-verification stands; no outside verdict/approval. Risk: none (isolated static artboard, no shared application contract). Next: human visual feedback, no automatic interactivity or app implementation.
- L23 — User feedback, verbatim:

Mucho mejor. Los patrnes no están correctos, necesitamos más fiabilidad:
- [Image#5] marque en rojo los que estan mal implementados, dejaré las versiones correctas:
[Image#6] [Image#7] [Image#8] [Image#9] [Image#10]

- L24 — Reconciled current task file and full mirror. Human accepts the improved composition but rejects six existing motif variants. Corrections are limited to geometry/palette for those symbols in motifs.svg,01-motif-library.html and02-poster-grid.html plus provenance/manifest bookkeeping. Do not touch the five unmarked variants, title/font/name/card styles, artists/order/coordinates, nav/footer/filter/interactivity restrictions, app or original raster. New image attachments are visible in conversation but have no repository-local files in refs; compare against corresponding original-poster regions rather than inventing new geometry. T1/T3 reopened; T2 remains valid.
- L25 — Explorer mapped original-poster regions; parent spot-checked a five-tile contact sheet against the supplied crops. Exact local extraction uses213×203 source pixels: right(640,0), lightning(853,0), orbit(1067,407), rings(853,407), left(1067,1219). New attachments remain conversation-only, so numeric comparisons are explicitly against these matching original-poster regions, not unprovided files. Initial screenshot preparation failed before comparisons because fractional SVG positioning produced213×204; integer-position capture repaired the setup without changing tolerance (capture-setup.json, zero probes). Meaningful RED then reproduced all6 defects with mask IoU0.246–0.611 versus the corresponding raster, threshold0.97 unchanged. Baseline files/screenshots/red.json preserved under output/playwright/arc2026-slot-grid/pattern-correction/.
- L26 — Prepared SVG-only filled contours from the verified source mask (no embedded raster):4 lightning regions,5 orbital contours,16 clipped ring regions; right/left use two independent half-tile triangles. Curve paths retain raster-derived nonuniform contours rather than inventing concentric circles. Prepared symbols are not yet applied or verified. Scope preflight will require byte-identical snapshots and preserve all bytes outside the six selected symbol blocks across export/library/main.
- L27 — Applied only the six selected symbols after validating all three files against snapshots. Scope check passes: eleven canonical symbols are identical across export/library/main; five unmarked variants and every byte outside selected symbols are unchanged. First browser post-apply navigation served cached baseline symbols despite HTTP serving the new bytes; green-first.json is retained as stale-capture evidence, not a current verdict. Cache-busted URL plus exact new arrow-path assertion now verifies the displayed version before capture.
- L28 — First version-bound raster comparison:5/6 PASS at unchanged0.97 silhouette-IoU minimum. Right0.988424,left0.992149,lightning0.999683,rose-orbits1.0,cyan-orbits0.995064; rings0.968853 FAIL. Do not lower the threshold or mark complete. Refine only the ring contour's pixel-boundary simplification while preserving accepted variants and all outside bytes. Native/app reviews/builds are not substitutes for this specific visual proof.
- L29 — Ring-only refinement: lowering subpixel simplification tolerance was a verified no-op, so it was not recaptured as a new fix. Residual error was293 false-negative edge pixels/zero false positives. Added a0.1 normalized-unit same-color boundary stroke to retain antialiased thin-band coverage; no threshold relaxation. A malformed literal\\n scratch-JSON suffix from the no-op refinement blocked the next preparation before design mutation; preserved prepared-symbols-malformed.json, repaired only that verified suffix and corrected the helper newline. Current6/6 GREEN, unchanged0.97 minimum: right0.988424,left0.992149,lightning0.999683,rose-orbits1.0,cyan-orbits0.995064,rings0.97066. These compare thresholded geometry masks with matching original-poster crops; they are not pixel-perfect color or original-vector certification. Final visual/scope/canvas checks pending.
- L30 — Visual review invalidated L29's binary GREEN: faint inner ring strokes had been omitted by the intensity cutoff, and pixel-boundary tracing retained staircase edges. Reopened T1/T3, never treated that pass as sufficient. Replaced pixel trace with four source-derived lightning polygons,68 smooth orbital Bézier segments and16 measured circle bands with varying centers/radii/widths, including low-contrast inner lines. Current source-generated vectors are approximate reconstructions, not original supplied vectors.
- L31 — Corrected a genuine palette-dependent measurement bug: the same45% foreground threshold on rose ground G100 maps to cyan ground G255×0.55, not rawG55. The unchanged0.97 IoU minimum is retained; old reports preserved. Current smooth comparison5/6 PASS: right0.988424,left0.992149,lightning0.993470,rose-orbits0.982157,cyan-orbits0.978299; rings0.920696 FAIL. No delivery/completion claim. No native lifecycle/budget was started or reset.
- L32 — External input required to complete the remaining rings reliably: supplied corrected images are conversation-only; refs/ contains only the original lossy poster/PDF/logo/demo artwork. Need the actual corrected PNG/SVG files placed in refs/, especially rings, to trace and compare against the requested source rather than another approximation from the poster. Original vectors are preferred if available. T1 blocked waiting for that observable input; T3 pending, not done. This does not relabel the failed comparison as unavailable or passed; it remains failed and recorded.
- L33 — Preserved current provisional artboards/export, refreshed existing canvas, and closed owned browser arc-pattern-correction plus temporary static server job-5 (session list empty). Public current render:46 names,16 ring arcs,0 runtime scripts/extraUI. Final scope/XML pass:11 canonical symbols shared across3 files, all bytes outside six marked symbols and all five unmarked motifs byte-identical to snapshots. Composition/title/names/layout/app/ref originals unchanged; no commits/publishing. Current evidence under pattern-correction/:smooth-calibrated.json,final-scope.json,smooth-proof.png,current-library.png,current-main.png. Risk: none (isolated design geometry; completion remains blocked on ring proof).
- L34 — User acceptance, verbatim: “Están bien, no te preocupes, podemos cerrar el diseño.” Final disposition: design visually accepted as-is. This resolves the request for more original files and ends further motif adjustment; no more tests/retries are requested. Drop the unfinished precision/verification continuations, not the retained artwork. The recorded ring comparison0.920696 versus0.97 remains a failed diagnostic, never a PASS or native approval. S12 static composition, current SVGs and all existing app edits remain untouched. No new implementation, commit, publishing, native review or consent operation is authorized by this closure.













