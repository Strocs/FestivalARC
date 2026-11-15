import { describe, expect, it } from 'vitest'
import data from '../../../content/artists.json'
import { artists, disciplines, participantCatalog, validateParticipantCatalog } from '../artists'

const catalog = data as unknown as Record<string, { name: string, participants: Record<string, unknown>[] }>

describe('2026 participant catalog', () => {
  it('validates the grouped catalog without mutation and rejects invalid category fields', () => {
    expect(participantCatalog).toEqual(data)
    expect(validateParticipantCatalog(structuredClone(data))).toEqual(data)
    const invalidInputs = [
      (input: typeof data) => { Object.assign(input.music.participants[0], { national: undefined }) },
      (input: typeof data) => { Object.assign(input.music.participants[0], { national: 'true' }) },
      (input: typeof data) => { Object.assign(input.stage.participants[0], { national: false }) },
      (input: typeof data) => { Object.assign(input.expo.participants[0], { national: false }) },
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

  it('requires national only on music and rejects the former featured key without mutation', () => {
    const input = structuredClone(data)
    const participant = input.music.participants[0] as Record<string, unknown>
    delete participant.featured
    for (const national of [false, true]) {
      participant.national = national
      const before = structuredClone(input)
      expect(validateParticipantCatalog(input).music.participants[0]).toEqual(participant)
      expect(input).toEqual(before)
    }
    for (const fields of [
      { national: undefined }, { national: 'true' },
      { national: true, featured: true }, { national: undefined, featured: false },
    ]) {
      const invalid = structuredClone(input)
      Object.assign(invalid.music.participants[0], fields)
      const before = structuredClone(invalid)
      expect(() => validateParticipantCatalog(invalid)).toThrow()
      expect(invalid).toEqual(before)
    }
    for (const category of ['stage', 'expo', 'market'] as const) {
      const invalid = structuredClone(input)
      Object.assign(invalid[category].participants[0], { national: false })
      const before = structuredClone(invalid)
      expect(() => validateParticipantCatalog(invalid)).toThrow()
      expect(invalid).toEqual(before)
    }
  })

  it('groups participants into four named categories independent of disciplines', () => {
    expect(Object.keys(catalog)).toEqual(['music', 'stage', 'expo', 'market'])
    expect(Object.values(catalog).map(category => category.name)).toEqual([
      'Música', 'Artes Escénicas', 'Expo Arte.Co', 'Mercado Creativo y DAZ',
    ])
    expect(Object.values(catalog).map(category => category.participants.length)).toEqual([30, 16, 8, 39])
  })

  it('matches authoritative catalog IDs to current participant names in every category', () => {
    for (const category of Object.values(data)) {
      const expectedIds = category.participants.map(participant => participant.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''))
      expect(category.participants.map(participant => participant.id)).toEqual(expectedIds)
    }
  })

  it('removes group and limits national to music, preserving former national assignments', () => {
    const national = ['nino-cohete', 'javiera-mena', 'dulce-y-agraz', 'gepe', 'javier-barria',
      'fernando-milagros', 'rosario-alfonso', 'claudio-valenzuela', 'fernando-ubiergo',
      'pedropiedra', 'nunez-briceno', 'jose-alfredo-fuentes', 'innundaremos',
      'guaypes-club', 'dejenme-dormir', 'nando-garcia', 'laro', 'dj-sepha']
    for (const [key, category] of Object.entries(catalog)) {
      for (const participant of category.participants) {
        expect(participant).not.toHaveProperty('group')
        expect(participant).not.toHaveProperty('featured')
        if (key === 'music') expect(participant.national).toBe(national.includes(String(participant.id)))
        else expect(participant).not.toHaveProperty('national')
        expect(participant.name).not.toBe(String(participant.name).toLocaleUpperCase('es'))
      }
    }
  })

  it('requires editable details for expo and market without mutating accepted or rejected input', () => {
    for (const category of ['expo', 'market'] as const) {
      const input = structuredClone(data)
      const participant = input[category].participants[0] as Record<string, unknown>
      Object.assign(participant, {
        date: { day: 'Sábado 28', time: '23:00' }, description: '', image: null,
      })
      for (const image of [null, { url: '/src/assets/artists/participant.jpg', alt: 'Participant' }]) {
        Object.assign(participant, { image, description: 'Supplied description' })
        const before = structuredClone(input)
        expect(validateParticipantCatalog(input)[category].participants[0]).toEqual(participant)
        expect(input).toEqual(before)
      }
      const invalidFields = [
        { date: undefined }, { date: null }, { date: '2026-11-28T23:00:00' },
        { date: { day: 'Sábado 28' } }, { date: { time: '23:00' } },
        { date: { day: 28, time: '23:00' } }, { date: { day: 'Sábado 28', time: 23 } },
        { date: { day: '', time: '23:00' } }, { date: { day: 'Sábado 28', time: '' } },
        { description: undefined }, { description: null }, { description: 3 },
        { image: undefined }, { image: 'image.jpg' }, { image: {} },
        { image: { url: 'image.jpg' } }, { image: { alt: 'Participant' } },
        { image: { url: 3, alt: '' } }, { image: { url: 'image.jpg', alt: 3 } },
        { image: { url: '', alt: '' } },
      ]
      for (const fields of invalidFields) {
        const invalid = structuredClone(input)
        Object.assign(invalid[category].participants[0], fields)
        const before = structuredClone(invalid)
        expect(() => validateParticipantCatalog(invalid)).toThrow()
        expect(invalid).toEqual(before)
      }
    }
  })

  it('supplies empty descriptions, null images and the exact provisional day split in array order', () => {
    for (const [category, saturdayCount] of [['expo', 4], ['market', 20]] as const) {
      const participants = participantCatalog[category].participants
      participants.forEach((participant, index) => {
        expect(participant).toMatchObject({
          description: '', image: null,
          date: { day: index < saturdayCount ? 'Sábado 28' : 'Domingo 29', time: '23:00' },
        })
      })
      expect(participants.filter(entry => entry.date.day === 'Sábado 28')).toHaveLength(saturdayCount)
      expect(participants.filter(entry => entry.date.day === 'Domingo 29')).toHaveLength(participants.length - saturdayCount)
    }
  })

  it('keeps every music and stage work in hero order regardless of national status', () => {
    const performers = [
      ...participantCatalog.music.participants.map(entry => ({ ...entry, category: 'music' })),
      ...participantCatalog.stage.participants.map(entry => ({ ...entry, category: 'stage' })),
    ].sort((left, right) => left.order - right.order)
    expect(artists).toEqual(performers)
    expect(artists).toHaveLength(46)
    expect(artists.filter(entry => entry.category === 'music')).toHaveLength(30)
    expect(artists.filter(entry => entry.category === 'stage')).toHaveLength(16)
    expect(artists.filter(entry => entry.category === 'music' && !entry.national)).toHaveLength(12)
    expect(disciplines).toHaveLength(7)
  })

  it('keeps corrected music names paired with their current route IDs', () => {
    const names = Object.fromEntries(artists.map(artist => [artist.id, artist.name]))
    expect(names).toMatchObject({
      pedropiedra: 'Pedropiedra', 'guaypes-club': 'Guaypes Club',
      laro: 'Laró', 'dj-sepha': 'DJ Sepha', 'weinkeys-blackbeat': 'Weinkeys + Blackbeat',
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

  it('loads the supplied expo and market lists with provisional details, not invented disciplines', () => {
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
      expect(Object.keys(entry).sort()).toEqual(['date', 'description', 'id', 'image', 'name'])
      expect(artists.some(artist => artist.id === entry.id)).toBe(false)
    }
  })
})
