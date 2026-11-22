import { describe, expect, it } from 'vitest'
import { artists as lineup } from '../../artists/artists'

const fixedOrder = [
  'polter', 'lobas', 'nino-cohete', 'yaru', 'shicris',
  'javiera-mena', 'el-humedal', 'dulce-y-agraz', 'freshki', 'gepe',
  'pulsando', 'javier-barria', 'quita-de-bulla',
  'removernos-a-cielo-abierto', 'fernando-milagros', 'yatiri',
  'jazztacuatico', 'rosario-alfonso', 'un-derrotero-nortino-con-marionetas', 'duerme-y-cae',
  'claudio-valenzuela', 'awicha-la-tejedora-de-memorias', 'fernando-ubiergo', 'kalishe',
  'narrando-mundos-en-bicicuentera', 'pedropiedra', 'weinkeys-blackbeat',
  'bendita-agua', 'nunez-briceno', 'las-luciernagas-y-el-origen-del-fuego',
  'stendhal', 'jose-alfredo-fuentes', 'llamada-de-emergencia',
  'last-whisper', 'innundaremos', 'martin-v-s-trampolino-maletines',
  'guaypes-club', 'medinamico', 'trans-humante', 'dejenme-dormir',
  'juan-manotas-y-el-origen-del-carnaval', 'nando-garcia', 'de-papel',
  'laro', 'esteban-y-los-hurtados', 'dj-sepha', 'carpe-diem', 'la-gran-troupe-circo', 'viaje-a-la-luna',
]

describe('fixed editorial lineup order', () => {
  it('uses a fixed mixed order rather than category blocks', () => {
    expect(lineup.map(artist => artist.id)).toEqual(fixedOrder)
    expect(lineup.slice(0, 4).map(artist => artist.category)).toEqual(['music', 'stage', 'music', 'stage'])
  })

  it('places Javiera Mena and Gepe in the upper third but not in the opening positions', () => {
    for (const id of ['javiera-mena', 'gepe']) {
      const index = lineup.findIndex(artist => artist.id === id)
      expect(index).toBeGreaterThanOrEqual(3)
      expect(index).toBeLessThan(Math.floor(lineup.length / 3))
    }
  })

  it('preserves all 49 unique confirmed artists and category/company associations', () => {
    expect(lineup).toHaveLength(49)
    expect(new Set(lineup.map(artist => artist.id)).size).toBe(49)
    expect(lineup.filter(artist => artist.category === 'music' && artist.national)).toHaveLength(18)
    expect(lineup.filter(artist => artist.category === 'music' && !artist.national)).toHaveLength(12)
    expect(lineup.filter(artist => artist.category === 'stage')).toHaveLength(19)
    expect(lineup.filter(artist => artist.company)).toHaveLength(19)
  })
})
