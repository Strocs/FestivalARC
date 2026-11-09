# ARC 2026 — static responsive poster implementation
Objective: implement the visually accepted content-only poster in the active Astro edition, with46 confirmed names and10/6/2 logical columns.
Branch: dev (origin/main is default); delivery_strategy=single-pr, explicitly selected; forecast~1100 authored lines across reviewable units, generated/copied SVG excluded. Runner: Vitest, Astro check/root build, Playwright Chromium.

## Specs
- S1 — Authorization: “ya podemos comenzar con la implementación?”
- S2 — Current content scope: “No añadas los filtros aún, No implementes el nav bar” and “No inventes el footer, céntrémonos en el conteido primero. El componentes de artistas, por el momento, deja solo el nombre del artista y no le añadas la interactividad aún.”
- S3 — Exact desktop cadence: “Para el orden de los componentes de nombre, siempre se sigue el mismo orden: una fila con 3 elementos separados por dos esapcios cada uno, la de abajo tiene 2 elementos comenzando por dos espacios y separados por dos espacios. Esto construye la estructura escalonada que mencioné.”
- S4 — Artist geometry: “1 slot de altura 2 de ancho.” and “Siempre deben haber 2 slots debajo libres.” Selected clarification: “Reserva para expandir (recomendado)”. Expansion is a future requirement, not implemented in this static pass.
- S5 — Layout/data: “La cantidad de rows será variable, dependiendo de la cantidad de inforamción que exista, la posición de los artistas tendrá reglas específicas y posicion específica configurable y deberá reaccionar a los slots de información (no overlaps).”
- S6 — Module sizing: “La nueva propuesta considera una grid de 10 columnas, con espacios de 160px de ancho por 152px de alto aproximadamente (configurable)”.
- S7 — Preserve accepted identity: “Respetar tamaños de textos según la imágen.” “Están bien, no te preocupes, podemos cerrar el diseño.” Source: design/arc2026-slot-grid/{02-poster-grid.html,motifs.svg}; no motif adjustments or renewed precision tests.
- S8 — Phone decision: “Artistas a ancho completo — recomendado”. Two motif columns below768px; names span both, with lower decorative reservation. Desktop3/2 does not apply to phones.
- S9 — Tablet decision: “6 columnas, alternancia 2/1 — recomendado”. Accepted range768–1199px uses starts0/4 then2; desktop>=1200px uses10 columns starts0/4/8 then2/6.
- S10 — “Artistas confirmados hasta el momento:” — retain all46 names and16 company associations in L2 exactly, with stable IDs; do not use repeated demo Javiera cards or invent activities/schedules.
- S11 — Delivery decision: “Una sola PR grande — menos recomendado”. One future PR scope, no chain strategy; this does not authorize push/PR/merge. Work-unit commits on dev are allowed by large ODD implementation policy.

## Tasks
- T1 [S3–S6/S8–S10] in_progress | Route: parent inline, one dependent behavior/no writer trigger | Commit: pending | Add confirmed roster, slot-position engine and layout configuration using Vitest RED/GREEN; preserve demo program contracts. Risk: none.
- T2 [S2/S7] pending | Route: parent inline | Commit: pending, separate work unit | Extract reusable document shell while preserving existing Layout defaults/metadata/fonts/header/footer for other routes; root can use content-only document. Risk: item3 (shared document contract consumed by existing routes); independent verifier once at feature end.
- T3 [S2–S10] pending | Route: parent inline, depends on T1/T2 | Commit: pending | Build static Astro grid, artist-name and information components; copy accepted SVG verbatim; wire root and adapt obsolete root-only browser assertions without dropping direct-route protection.
- T4 [S1–S11] pending | Route: parent functional integration plus one gentle-ai-verify for item3 | Commit: pending | Run unit/type/lint/root build/browser checks, visual readback, independent verification and native ASSESS/review only per current offered route; close with all evidence.

## Log
- L1 — Current request, verbatim: “ya podemos comenzar con la implementación?”
- L2 — Original user request and confirmed roster, verbatim:

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


- L3 — Latest visual acceptance, verbatim: “Están bien, no te preocupes, podemos cerrar el diseño.” The historical ring metric remains a recorded failure in the closed design record, never a PASS or implementation blocker to revive. Do not re-run motif comparisons or ask for more originals.
- L4 — Implementation-definition user messages, verbatim: “ahroa definamos la implementación” and “perfecto, continuemos”. Human then explicitly selected phone full-width artists and tablet6-column2/1 in the768–1199 range. Source of full decision history: Engram5316, design specification odd/tasks/arc2026-slot-grid.md.
- L5 — Current delivery selection: “Una sola PR grande — menos recomendado”. Forecast~1100 authored additions/deletions excluding the approved generated SVG copy. Reviewable units are engine/data, shared-document-only risk unit, UI, integration. The400-line heuristic is not a hard cap and will not be achieved by minifying or omitting checks. No chain menu repeats; no publishing.
- L6 — Baseline: dev HEAD92b1ab01db44da7667d141d962a8ce0050b1a1c6; origin/HEAD is origin/main. Existing tracked edits in2024 types, ArtistDetail, homepage, shared design record, old tasks and browser fixtures; existing untracked overlay/scripts/store/tests and design artifacts. Preserve changes outside this feature and do not stage them. Root's old mosaic/overlay behavior and its assertions are intentionally superseded; keep direct artist routes and archive behavior. Save baseline evidence before relevant rewrites; no blanket restore/reset/clean.
- L7 — Technical plan: pure TypeScript uses slots, not browser pixels; information footprints are reserved first (including desktop L-shaped title), blocked starts are skipped without changing row parity, name envelopes reserve2×2 and show only2×1. Unoccupied/reserved cells render decorative motifs. Responsive logical layouts are computed at build time, one semantic artist DOM, CSS selects positions for10/6/2; no React/client store/GSAP needed. Native text uses existing Poppins900; unchanged title artwork supplies the exact four-line lettering. No new dependencies or global-token changes. Tablet/mobile info coordinates and type-fit values are implementation defaults within the selected responsive behavior, not new editorial content.
- L8 — Functional checks: one Vitest RED per requested rule, GREEN focused+existing app suite; regression protection for shared document defaults and static direct artist page; browser geometry at1920/1440/1200/1199/768/767/390/320, no overlap or hidden/truncated names, no root artist interactions/nav/footer/filter/motion, local resources and no-JS content. Full root build is required before each commit. Old motif-precision tests are intentionally not part of this new implementation.
- L9 — Independent verification preparation must be bounded and preflighted: no active/uncertain child, isolated payload and dependencies/scratch capacity confirmed before setup. Do not repeat the historical oversized-copy/setup failure or revive its retired verification; this is a new candidate with shared-document risk. Use the exact runnable browser/unit commands on isolated state; failures/missing proof remain explicit, never automatic retry/escalation of an unavailable verifier.
- L10 — T1 source implementation observed RED/GREEN. Initial missing-module runs executed0 cases; after declaring empty contracts,18 rule/roster tests failed as expected. Initial engine+46-name data GREEN18+8 existing. Added explicit-anchor and responsive-configuration coverage; observed5 anchor failures/19 passes before anchor support. Final focused24/24, edition suite32/32, scoped ESLint and diff whitespace PASS. No program/demo contract, dependencies, app shell, homepage or old artwork changed in this unit. Current data includes18 national/12 regional/16 stage, exact companies, explicit stable IDs and no fabricated booking fields. Layout is pure; presets10/6/2 and optional anchors validate before mutation. Full root build pending before T1 completion/commit.
- L11 — T1 root build job-6 passed, exit0 (1m55s); composed440 files. Functional checks32/32, focused24/24, scoped lint/diff and complete build observed before the first commit. T1 is one coherent data/layout work unit; its exact staging will exclude pre-existing archive/UI/fixture/design edits. No original motif diagnostics were rerun.
