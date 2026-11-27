# ARC 2026: Brave Android text reflow
Scope: mobile artist cards and header/filter placement.

## Specs
1. S1 — “Imágenes de referencia de mi mobil, desde brave aumenté a 200% por acccesibilidad, así se ve, no está solucionado el problema”
2. S2 — “haz los cambios, esto sólo en mobile, evitar que en 100% el tamaño de cada card varíe y controlar el tamaño de los textos igual, el nombre del os artistas no debería cambiar, el tamaño ya es grande.”
3. S3 — “Hazlo”
4. S4 — “Sólo haz que se wrappee, si no alcanza en el ancho el logo arriba, abajo fecha y abajo los dos íconos. Obviamente que esto cudeda en menos de 320px cuando se aumetna el %, en anchos normales de mobile se sigue viendo den una sola frnja.”
5. S5 — “Sigue viendose igual... el alto sigue sin crecer”
6. S6 — “el hader quedó bien”
7. S7 — “haz eso”

## Tasks
- T1 — S1–S3, S5, S7 — intrinsic card flow in both mobile modes; implemented and verified in Chromium.
- T2 — S1, S3–S4, S6 — three-row narrow header; accepted by user.
- T3 — S1–S7 — final build and 11 Chromium tests passed; device result accepted by user. No additional verification requested.

## Log
L1: Hazlo
L2: Local ARC 2026 build and all 358 unit tests passed. Chromium reproduced and verified metadata expansion with unchanged computed font size; header reflow passed at 320 and 390 CSS px. Native Brave Android remains unverified.
L3: “Sólo haz que se wrappee, si no alcanza en el ancho el logo arriba, abajo fecha y abajo los dos íconos. Obviamente que esto cudeda en menos de 320px cuando se aumetna el %, en anchos normales de mobile se sigue viendo den una sola frnja.” / “Sigue viendose igual... el alto sigue sin crecer”
L4: Build and 358 tests passed after narrow intrinsic layout. Chromium checked header row order at 280/390 px and card expansion in normal and simple view at 280/320 px.
L5: el hader quedó bien
L6: haz eso
L7: Device evidence supersedes the narrow-only Chromium proof. The card metadata must contribute to the mobile grid's actual height without depending on a viewport-width threshold or font-scale detection. Desktop and the accepted header are outside this change.
L8: Ahora sí, bravo!!
L9: Realiza el commit, haz el build si lo necesitas, no mas verificaciones
L10: Candidate build passed (122 pages); 11 Chromium E2E tests and 10 baseline comparisons passed. Final unit suite was not rerun. The temporary tunnel allowlist is not part of this commit.
