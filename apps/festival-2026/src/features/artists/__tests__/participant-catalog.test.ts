import { describe, expect, it } from 'vitest'
import data from '../../../content/artists.json'
import { artists, participantCatalog, validateParticipantCatalog } from '../artists'

const catalog = data as unknown as Record<string, { name: string, participants: Record<string, unknown>[] }>

describe('2026 participant catalog', () => {
  it('validates the grouped catalog without mutation and rejects invalid category fields', () => {
    expect(participantCatalog).toEqual(data)
    expect(validateParticipantCatalog(structuredClone(data))).toEqual(data)
    const invalidInputs = [
      (input: typeof data) => { Object.assign(input.music.participants[0], { featured: undefined }) },
      (input: typeof data) => { Object.assign(input.music.participants[0], { featured: 'true' }) },
      (input: typeof data) => { Object.assign(input.stage.participants[0], { featured: false }) },
      (input: typeof data) => { Object.assign(input.expo.participants[0], { featured: false }) },
      (input: typeof data) => { Object.assign(input.market.participants[0], { group: 'regional' }) },
      (input: typeof data) => { input.market.participants[0].id = input.music.participants[0].id },
      (input: typeof data) => { input.stage.participants[0].order = input.music.participants[0].order },
    ]
    for (const invalidate of invalidInputs) {
      const input = structuredClone(data)
      invalidate(input)
      const before = structuredClone(input)
      expect(() => validateParticipantCatalog(input)).toThrow()
      expect(input).toEqual(before)
    }
  })

  it('groups participants into four named categories independent of disciplines', () => {
    expect(Object.keys(catalog)).toEqual(['music', 'stage', 'expo', 'market'])
    expect(Object.values(catalog).map(category => category.name)).toEqual([
      'Música', 'Artes Escénicas', 'Expo Arte.Co', 'Mercado Creativo y DAZ',
    ])
    expect(Object.values(catalog).map(category => category.participants.length)).toEqual([30, 16, 8, 39])
  })

  it('removes group and limits featured to music, preserving former national assignments', () => {
    const national = ['nino-cohete', 'javiera-mena', 'dulce-y-agraz', 'gepe', 'javier-barria',
      'fernando-milagros', 'rosario-alfonso', 'claudio-valenzuela', 'fernando-ubiergo',
      'pedro-piedra', 'nunez-briceno', 'jose-alfredo-fuentes', 'innundaremos',
      'guaype-club-infantil', 'dejenme-dormir', 'nando-garcia', 'lero', 'josefa-errazuriz-dj']
    for (const [key, category] of Object.entries(catalog)) {
      for (const participant of category.participants) {
        expect(participant).not.toHaveProperty('group')
        if (key === 'music') expect(participant.featured).toBe(national.includes(String(participant.id)))
        else expect(participant).not.toHaveProperty('featured')
        expect(participant.name).not.toBe(String(participant.name).toLocaleUpperCase('es'))
      }
    }
  })

  it('corrects music names without changing route IDs', () => {
    const names = Object.fromEntries(artists.map(artist => [artist.id, artist.name]))
    expect(names).toMatchObject({
      'pedro-piedra': 'Pedropiedra', 'guaype-club-infantil': 'Guaypes Club',
      lero: 'Laró', 'josefa-errazuriz-dj': 'DJ Sepha', 'weinkeys-blackbeat': 'Weinkeys + Blackbeat',
      'dejenme-dormir': 'Déjenme Dormir', 'javier-barria': 'Javier Barría',
      'nunez-briceno': 'Núñez Briceño', 'jose-alfredo-fuentes': 'José Alfredo Fuentes',
      'nando-garcia': 'Nando García',
    })
  })

  it('preserves stage works while correcting company names', () => {
    const byId = Object.fromEntries(artists.map(artist => [artist.id, artist]))
    expect(byId.lobas).toMatchObject({ name: 'Lobas', company: 'Kaleidoscopio Circo' })
    expect(byId.yaru).toMatchObject({ name: 'Yaru', company: 'La Feroz Compañía' })
    expect(byId['bendita-agua']).toMatchObject({ name: 'Bendita Agua', company: 'Compañía de Títeres La Boda' })
    expect(byId['narrando-mundos-en-bicicleta'].company).toBe('Títeres Ojos de Agua')
    expect(byId['trans-humante'].company).toBe('Espacio La Isla')
    expect(byId['red-lambe-norte'].company).toBe('Red Lambe Norte Chile')
    expect(byId.pulsando).toMatchObject({ name: 'Pulsando', company: 'Agrupación Flamenco Elqui' })
    expect(JSON.stringify(data)).not.toContain('Zapato Rojo')
    expect(artists).toHaveLength(46)
  })

  it('loads the supplied expo and market lists without invented schedules or disciplines', () => {
    expect(catalog.expo.participants.map(entry => entry.name)).toEqual([
      'La Velocidad de la Luz', 'María Piedad Aguirre', 'Iván Jorquera', 'Camila Montoya',
      'Oskar Huerta', 'Andrea Cantillanes', 'Sandy Barrera', 'Daniela Pizarro',
    ])
    expect(catalog.market.participants.map(entry => entry.name)).toEqual([
      'Forjadas', 'Reproducción Arqueológica de la Cerámica Diaguita', 'Pilpintuvellon',
      'Scarlett Christiansen Joyas de Autora', 'Taller Artesanal Jacarandá', 'Artesana Neurótica',
      'Alicate Veloz', 'Ánima Rojas', 'Catana', 'Creavida', 'Alpacosas',
      'Javiiilustrations', 'Ilustravel', 'Futuro Comics', 'Rotten Monkey Inc', 'Daniela Trigo',
      'Colectivo Fugaz', 'Seba Endless', 'Dimensión D', 'Colectivo Voyeartistas', 'Alesol',
      'Infini Art', 'Bosque Marino', 'Intercultural Arte Elementa', 'Ulises López Grabador',
      'La Cartolería Taller', 'Kokó', 'Bordelibre Ediciones', 'Yatiediciones',
      'Taller Editorial Me Pego un Tiro', 'Draco Herrera', 'Mauricio Ramos', 'Astro Glitter',
      'Colectivo Crisol', 'Pierina Basilio', 'Estudiantes de Diseño Digital Inacap',
      'Club Audiovisual Área Diseño Inacap', 'Christel Horn', 'Sofía Rodríguez',
    ])
    for (const entry of [...catalog.expo.participants, ...catalog.market.participants]) {
      expect(Object.keys(entry).sort()).toEqual(['id', 'name'])
      expect(artists.some(artist => artist.id === entry.id)).toBe(false)
    }
  })
})
