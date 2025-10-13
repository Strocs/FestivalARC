import teatro from './teatro.json'
import danzaCirco from './danza-circo.json'
import musica from './musica.json'
import titeres from './titeres.json'
import literatura from './literatura.json'
import talleresCharlas from './talleres-charlas.json'
import estelar from './estelar.json'
import cecrea from './cecrea.json'
import instalaciones from './instalaciones.json'
import type { Arc2025Event } from '../../../types'

export const events: Arc2025Event[] = [
  ...teatro,
  ...danzaCirco,
  ...musica,
  ...titeres,
  ...literatura,
  ...talleresCharlas,
  ...estelar,
  ...cecrea,
  ...instalaciones,
]
