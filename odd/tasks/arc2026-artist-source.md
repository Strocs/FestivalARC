# ARC 2026 artist source of truth
Objective: unify the 46 grid artists as editable general data. Branch: feat/arc2026-artist-source.
Delivery: single-pr (human selected); forecast ~1000 authored lines, one coherent migration. Runner: lint, Vitest and Astro check/build only; no browser or servers (S8).

## Specs
S1. "disciplina debe ser un string no un array, solo una disciplina es permitida por entrada." "quita el atributo demo." "añade un atributo description de tipo string."
S2. "añade un astributo ticketUrl que sea string o null y dejalos todos null."
S3. "aññade un atributo date de tipo objeto obligatorio con los parametros day y time, añáde Sábado 28 en day y 23:00 a todos. (lo hago así para que se fácil de editar, por eso no uso un datetime u otra cosa)"
S4. "añade un atributo image de tipo objeto o null, el objeto con las propiedades de url y alt, en este caso, la idea es usar astro Images el componnentne nativo que optimiza imagenes, pero requiere que importemos la imágen por lo que necesito que busques la documentacción para determinar si existe una manera de resolverlo, algun import masivo y luego asignarle la imagen a cada uno o algo así. Revisa qué recomienda astro para estos casos."
S5. "quitale el (ejemplo) obviamente" "o mejor crea un objeto con las disciplinas disponibles y una id, y en disciplines definimos la id de la disciplina solamente"
S6. "movamos el contrato original a este, mueve la data fuera de poster, esta data es general. Ordenalos segun el orden actual pero con el atribuo order. Asigna como disciplina musica para los regionales y nacionales, los escenicas ponle Artes escénicas."
S7. "esta es data real, no de prueba, se irá complementando pero es la fuente de la verdad. No matengas data antigua o mock de pruebas"
Assumptions: keep stable IDs, names, groups and companies. Empty descriptions and null images until real content is supplied; remove old demo artwork, activities and venues. Isolated test fixtures are not runtime content. No new navigation interaction. Preserve current grid geometry.

S8. "no hagas verifiaccionnes visuales, no levantes dev server ni nada, máximo lints tests y builds"

## Tasks
T1 | S1-S7 | parent inline | done | RED missing new module (exit 1, zero tests); GREEN 8 contract tests. 46 artists migrated with explicit order; commit 7d11f4fe9fc6c43b05f94aaf3a16e025e4a74286.
T2 | S3-S7 | parent inline | done | Grid/collection/46 detail routes share real data; removed demo sources and artwork. 17 focused tests pass (incl glob image and null rendering); commit 7d11f4fe9fc6c43b05f94aaf3a16e025e4a74286.
T3 | S1-S8 | parent inline | done | pnpm lint PASS; 91 edition tests PASS; pnpm build PASS (485 files composed). Browser/server/visual checks excluded by S8. Source commit 7d11f4fe9fc6c43b05f94aaf3a16e025e4a74286.

## Log
L1. Original request: "Quiero que me muestres el contrato de la lista de artistas, dónde se encuentra la data y muestrame el ejemplo de un item del objeto"
L2. Subsequent exact requirements and corrections are preserved in S1-S7. Initial lookup was wrong: real grid has 46 entries in poster/lineup.ts; demo JSON has only one.
L3. Human selected: "Conservar la primera (recomendado)" then superseded with catalog IDs and explicit group mapping (S5-S6). Human selected "Una sola PR — menos recomendado"; no push or PR creation authorized.
L4. Astro primary documentation: https://docs.astro.build/en/recipes/dynamically-importing-images/ recommends import.meta.glob and Image; https://docs.astro.build/en/guides/images/ recommends local images in src/, not public/, for optimization.
L5. Baseline 07796d72b14f6ef8168d55985445da23ee547216; initial worktree clean. gentle-ai shell executable unavailable (exit 127). Existing unrelated historical verifier unavailability is not retried by this task.
L6. RED: missing new artist module (exit 1, zero tests), then 8 contract tests GREEN. Schedule RED reproduced ignored editable day/time (1 failure/1 pass), then 17 focused tests GREEN. Final edition suite: 14 files/91 tests PASS; root lint PASS; root build PASS (485 files). No browsers or servers started; E2E files migrated but not run per S8.
L7. Native assessment after staging: medium, 33 paths/1430 changed lines, reviewDue false, independentVerifier false. Model review not run under the human maximum-check restriction S8; no native approval claimed. Committed-range assessment encountered the untracked tracker and returned unassessable/medium; functional proof remains green.
L8. Source slice: baseline 07796d72b14f6ef8168d55985445da23ee547216 through 7d11f4fe9fc6c43b05f94aaf3a16e025e4a74286; 32 paths, 967 additions/436 deletions (46 expanded editable JSON entries explain most additions). Human chose single-pr; inherited commits since origin/main are outside this feature. No push/PR/merge.
L9. Risk: none. Requested contract migration has no unnamed consumers left; existing group/company/order/layout behavior pinned by tests. No shared parser or helper changes affect an unrequested sibling command, so differential CLI check is not applicable.
