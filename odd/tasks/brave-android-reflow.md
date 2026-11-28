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
8. S8 — “el nombre NUNCA va a pasar a dos líneas por cambio de pantalla. porque el tamaño y disposición del nombr SE MANTIENE.”
9. S9 — “Exaaaacto, finalmente!, ok aplica ese fix”
10. S10 — “No es posible que en mobil, el texto se corte horizontalmente. Debe manter el tamaño que tiene cuando está en 100% en mobil a eso me refería”
11. S11 — “PERO HERMANO MIOOOO, si el usuario aumenta o disminuye el ancho del dispositivo el texto se adapta, PERO si cambia el porcentaje de zoom, el texto no debería verse afectado, los demás textos crecen, pero el title mantiene el mismo tamaño VISUALMENTE”
12. S12 — “Revierte al comportamiento anterior, que es el correcto”
13. S13 — “pero cuidado, no hagas rollback, porque hay cambios que sí quiero mantener, solo revierte lo que te mencioné para el name y su cálculo”
14. S14 — “sí, ancho vw es mejor, intentemos eso”
15. S15 — “no pero el alto? debería ser el ancho”
16. S16 — “si el texto no se achica ya que el ancho del dispositivo será siempre el mismo, entonces el alto tampoco va a cambiar”
17. S17 — “exaacto, comienza”
18. S18 — “es que el anco sigue estando limitado, eso no entiendo :/” / “hay que asignar algo que sea más consistente, con un clamp o algo así que permita que se aproveche mejor el ancho porque proporcionalmente está mal” / “ademas de que los altos tambien estan raros”

## Tasks
- T1 — S1–S3, S5, S7 — intrinsic card flow in both mobile modes; implemented and verified in Chromium.
- T2 — S1, S3–S4, S6 — three-row narrow header; accepted by user.
- T3 — S1–S7 — final build and 11 Chromium tests passed; device result accepted by user. No additional verification requested.

- T4 — S10–S11 — dropped at user request; restored the tracked title implementation and tests from `5200fda`.

- T5 — S12–S13 — restore only the previous artist-name sizing and composition; preserve current metadata reflow and other layout changes.

- T6 — dropped: the user clarified that the input should be width, not an arbitrary minimum height.
- T7 — S13, S15–S17 — derive original mobile name fitting from width, not remaining height after metadata; preserve text-only scale and the rest of the card.

- T8 — S18 — use live mobile name width and bound short-title size by a responsive ceiling; reserve a consistent gap before metadata.

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
L11: Es que eso es justamente loq ue no entiendes, el nombre NUNCA va a pasar a dos líneas por cambio de pantalla. porque el tamaño y disposición del nombr SE MANTIENE. Entiendes?
L12: Exaaaacto, finalmente!, ok aplica ese fix
L13: Production Chromium at 230 CSS px measured 0px name font for Polter and Lobas. At 390px both were about 42px. Keep the original composition, including font size, line breaks and name block height, independent of narrower width or enlarged metadata.
L14: No es posible que en mobil, el texto se corte horizontalmente. Debe manter el tamaño que tiene cuando está en 100% en mobil a eso me refería
L15: PERO HERMANO MIOOOO, si el usuario aumenta o disminuye el ancho del dispositivo el texto se adapta, PERO si cambia el porcentaje de zoom, el texto no debería verse afectado, los demás textos crecen, pero el title mantiene el mismo tamaño VISUALMENTE
L16: L15 supersedes L13 on viewport-width independence: reflow for width, preserve title at fixed width during text-only scale. Remove horizontal title scrolling/cropping.
L17: por favor detenlo y revierte el cambio
L18: Ahora esta mostrando todos los nombres del mismo tamaño
L19: Cancelled the worker and reverted only the uncommitted title-fit implementation and its test edits. The committed ARC 2026 layout remains unchanged.
L20: Revierte al comportamiento anterior, que es el correcto
L21: pero cuidado, no hagas rollback, porque hay cambios que sí quiero mantener, solo revierte lo que te mencioné para el name y su cálculo
L22: Compare against `2abe6f7` (before `e878640`) using the existing per-artist fit algorithm at 100%; preserve the current intrinsic card flow, header, and filters.
L23: Reconstructed 2abe6f7 title fit matched current Chromium at eight widths between 230 and 412 CSS px in both poster modes. The first strict comparison differed by 1/64 px in placement only. Both versions produced 0px titles at 230 CSS px in poster view. Build and 11 existing Chromium tests passed; no source change. Native Brave reproduction requires a concrete affected artist and matching 100%/enlarged captures.
L24: sí, ancho vw es mejor, intentemos eso
L25: no pero el alto? debería ser el ancho
L26: si el texto no se achica ya que el ancho del dispositivo será siempre el mismo, entonces el alto tampoco va a cambiar
L27: exaacto, comienza
L28: Mobile names now use width-only fit with intrinsic title height. Build and 17 Chromium tests passed; Yaru's widest line used 99.6% of the available width at 360 CSS px. Independent source review passed; native Brave Android was not tested, and native review consent was declined.
L29: es que el anco sigue estando limitado, eso no entiendo :/, entiendo que pueda ser por el vw. Pero es que hay que asignar algo que sea más consistente, con un clamp o algo así que permita que se aproveche mejor el ancho porque proporcionalmente está mal, mira este otro ejemplo (ademas de que los altos tambien estan raros)
