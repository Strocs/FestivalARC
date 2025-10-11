import teatro from './teatro.json'
import danza from './danza.json'
import musica from './musica.json'
import titeres from './titeres.json'
import literatura from './literatura.json'
import talleres from './talleres.json'
import charlas from './charlas.json'
import imrec from './imrec.json'
import cecrea from './cecrea.json'
import instalaciones from './instalaciones.json'
import type { Arc2025Event } from '../../../types'

export const events: Arc2025Event[] = [
  ...teatro,
  ...danza,
  ...musica,
  ...titeres,
  ...literatura,
  ...talleres,
  ...charlas,
  ...imrec,
  ...cecrea,
  ...instalaciones,
]
