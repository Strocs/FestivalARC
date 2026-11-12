import { describe, expect, it } from 'vitest'
import { lineup } from '../lineup'

const fixedOrder = [
  'polter-ovalle', 'lobas', 'nino-cohete', 'yaru', 'shicris',
  'javiera-mena', 'el-humedal', 'dulce-y-agraz', 'freshki', 'gepe',
  'pulsando', 'javier-barria', 'quita-de-bulla-salamanca',
  'removernos-a-cielo-abierto', 'fernando-milagros', 'yatiri',
  'jazztacuatico', 'rosario-alfonso', 'red-lambe-norte', 'duerme-y-cae',
  'claudio-valenzuela', 'awicha', 'fernando-ubiergo', 'kalishe',
  'narrando-mundos-en-bicicleta', 'pedro-piedra', 'weinkeys-blackbeat',
  'bendita-agua', 'nunez-briceno', 'las-luciernagas-y-el-origen-del-fuego',
  'stendhal', 'jose-alfredo-fuentes', 'llamada-de-emergencia',
  'last-whisper', 'innundaremos', 'martin-v-s-trampolino-maletines',
  'guaype-club-infantil', 'medinamico', 'trans-humante', 'dejenme-dormir',
  'juan-manotas-y-el-origen-del-carnaval', 'nando-garcia', 'absurdo',
  'lero', 'esteban-y-los-hurtados', 'josefa-errazuriz-dj',
]

describe('fixed editorial lineup order', () => {
  it('uses a fixed mixed order rather than category blocks', () => {
    expect(lineup.map(artist => artist.id)).toEqual(fixedOrder)
    for (let index = 1; index < lineup.length; index++) {
      expect(lineup[index].group).not.toBe(lineup[index - 1].group)
    }
  })

  it('places Javiera Mena and Gepe in the upper third but not in the opening positions', () => {
    for (const id of ['javiera-mena', 'gepe']) {
      const index = lineup.findIndex(artist => artist.id === id)
      expect(index).toBeGreaterThanOrEqual(3)
      expect(index).toBeLessThan(Math.floor(lineup.length / 3))
    }
  })

  it('preserves all 46 unique confirmed artists and category/company associations', () => {
    expect(lineup).toHaveLength(46)
    expect(new Set(lineup.map(artist => artist.id)).size).toBe(46)
    expect(lineup.filter(artist => artist.group === 'national')).toHaveLength(18)
    expect(lineup.filter(artist => artist.group === 'regional')).toHaveLength(12)
    expect(lineup.filter(artist => artist.group === 'stage')).toHaveLength(16)
    expect(lineup.filter(artist => artist.company)).toHaveLength(16)
  })
})
