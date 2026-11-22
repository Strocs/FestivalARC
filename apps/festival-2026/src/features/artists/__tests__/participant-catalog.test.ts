import { describe, expect, it } from 'vitest'
import data from '../../../content/artists.json'
import { artists, disciplines, participantCatalog, validateParticipantCatalog } from '../artists'

const catalog = data as unknown as Record<string, { name: string, location?: string, participants: Record<string, unknown>[] }>

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
    expect(Object.values(catalog).map(category => category.participants.length)).toEqual([30, 19, 8, 39])
  })

  it('matches authoritative catalog IDs to current participant names in every category', () => {
    for (const category of Object.values(data)) {
      const expectedIds = category.participants.map(participant => participant.id === 'el-humedal'
        ? 'el-humedal'
        : participant.name
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

  it('stores visual arts location at category level without participant schedules', () => {
    const input = structuredClone(data)
    input.expo.location = 'Estacionamiento subterráneo'
    for (const participant of input.expo.participants) delete (participant as { date?: unknown }).date
    expect(validateParticipantCatalog(input).expo).toMatchObject({ location: 'Estacionamiento subterráneo' })
    expect(validateParticipantCatalog(input).expo.participants.every(participant => !('date' in participant))).toBe(true)
    const invalid = structuredClone(input)
    delete (invalid.expo as { location?: string }).location
    expect(() => validateParticipantCatalog(invalid)).toThrow()
    const timed = structuredClone(input) as unknown as { expo: { participants: Record<string, unknown>[] } }
    timed.expo.participants[0].date = { day: 'Sábado 28', time: '12:00' }
    expect(() => validateParticipantCatalog(timed)).toThrow()
  })

  it('requires editable details for expo and market without mutating accepted or rejected input', () => {
    for (const category of ['market'] as const) {
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

  it('assigns the supplied WebP photos to the matching music and stage participants', () => {
    const photographedIds = [
      'awicha-la-tejedora-de-memorias', 'bendita-agua', 'dejenme-dormir', 'dj-sepha',
      'duerme-y-cae', 'dulce-y-agraz', 'el-humedal', 'esteban-y-los-hurtados',
      'fernando-milagros', 'fernando-ubiergo', 'freshki', 'gepe', 'guaypes-club',
      'innundaremos', 'jazztacuatico', 'kalishe', 'laro', 'last-whisper', 'llamada-de-emergencia',
      'lobas', 'medinamico', 'nando-garcia', 'narrando-mundos-en-bicicuentera', 'nino-cohete',
      'nunez-briceno', 'pedropiedra', 'polter', 'quita-de-bulla', 'removernos-a-cielo-abierto',
      'rosario-alfonso', 'shicris', 'stendhal', 'trans-humante', 'weinkeys-blackbeat', 'yaru', 'yatiri',
    ]
    const photographed = artists.filter(artist => artist.image)
    expect(photographed.map(artist => artist.id).sort()).toEqual(photographedIds)
    for (const artist of photographed) {
      expect(artist.image).toEqual({ url: `/src/assets/artists/${artist.id}.webp`, alt: artist.name })
    }
  })

  it.each([
    ['music', 16], ['stage', 9], ['expo', 4], ['market', 20],
  ] as const)('preserves provisional defaults for %s except supplied Niño Cohete details', (category, saturdayCount) => {
    const participants = participantCatalog[category].participants
    participants.forEach((participant, index) => {
      if (participant.id === 'nino-cohete') {
        expect(participant.description).toContain('«pop silvestre»')
        expect(participant.image?.url).toBe('/src/assets/artists/nino-cohete.webp')
        expect(participant.date).toEqual({ day: 'Domingo 29', time: '17:00', month: 'noviembre' })
        return
      }
      if (participant.id === 'dejenme-dormir') expect(participant.description).toContain('primer semestre de 2027.')
      else expect(participant.description).toBe('')
      if (category === 'expo' || category === 'market') expect(participant.image).toBeNull()
      if (category === 'music') {
        expect((participant as { location?: string }).location).toBeTypeOf('string')
      } else if (category !== 'stage' && category !== 'expo') {
        expect(participant.date).toEqual({
          day: index % 2 === 0 ? 'Sábado 28' : 'Domingo 29', time: '23:00',
        })
      }
    })
    if (category === 'expo') {
      expect(participants.every(entry => !('date' in entry))).toBe(true)
    } else {
      expect(participants.filter(entry => entry.date?.day === 'Sábado 28')).toHaveLength(saturdayCount)
      expect(participants.filter(entry => entry.date?.day === 'Domingo 29')).toHaveLength(category === 'stage' ? 10 : participants.length - saturdayCount)
    }
  })

  it('uses CSV schedule assignments for matched stage works and the confirmed Humedal name', () => {
    const byId = Object.fromEntries(participantCatalog.stage.participants.map(entry => [entry.id, entry]))
    const assignments = {
      lobas: ['Domingo 29', '21:00', 'Interior de la Plaza de Armas (Sector Los Carreras)'],
      yaru: ['Domingo 29', '19:00', 'Teatro Vive Centenario'],
      'el-humedal': ['Sábado 28', '16:00', 'Teatro Vive Centenario'],
      'un-derrotero-nortino-con-marionetas': ['Domingo 29', '18:00', 'Interior de la Plaza de Armas (Sector Cordovez)'],
      pulsando: ['Domingo 29', '19:00', 'Interior de la Plaza de Armas (Sector Cordovez)'],
      'removernos-a-cielo-abierto': ['Sábado 28', '20:00', 'Interior de la Plaza de Armas (Sector Los Carreras)'],
      yatiri: ['Domingo 29', '16:00', 'Teatro Vive Centenario'],
      'awicha-la-tejedora-de-memorias': ['Sábado 28', '18:00', 'Interior de la Plaza de Armas (Sector Los Carreras)'],
      'narrando-mundos-en-bicicuentera': ['Domingo 29', '18:00', 'Interior de la Plaza de Armas (Sector Los Carreras)'],
      'bendita-agua': ['Domingo 29', '16:00', 'Interior de la Plaza de Armas (Sector Los Carreras)'],
      'las-luciernagas-y-el-origen-del-fuego': ['Sábado 28', '16:00', 'Interior de la Plaza de Armas (Sector Los Carreras)'],
      'llamada-de-emergencia': ['Sábado 28', '21:00', 'Interior de la Plaza de Armas (Sector Cordovez)'],
      'martin-v-s-trampolino-maletines': ['Sábado 28', '19:00', 'Interior de la Plaza de Armas (Sector Cordovez)'],
      'trans-humante': ['Sábado 28', '19:00', 'Teatro Vive Centenario'],
      'juan-manotas-y-el-origen-del-carnaval': ['Domingo 29', '17:00', 'Interior de la Plaza de Armas (Sector Cordovez)'],
      'de-papel': ['Sábado 28', '17:00', 'Interior de la Plaza de Armas (Sector Cordovez)'],
      'carpe-diem': ['Domingo 29', '21:00', 'Interior de la Plaza de Armas (Sector Cordovez)'],
      'la-gran-troupe-circo': ['Sábado 28', '22:00', 'Interior de la Plaza de Armas (Esquina Matta)'],
      'viaje-a-la-luna': ['Domingo 29', '20:00', 'Interior de la Plaza de Armas (Esquina Matta)'],
    }
    for (const [id, [day, time, location]] of Object.entries(assignments)) {
      expect(byId[id]).toMatchObject({ date: { day, time, month: 'noviembre' }, location })
    }
    expect(byId['el-humedal'].name).toBe('Humedal, un viaje en el tiempo')
  })

  it('keeps every music and stage work in hero order regardless of national status', () => {
    const performers = [
      ...participantCatalog.music.participants.map(entry => ({ ...entry, category: 'music' })),
      ...participantCatalog.stage.participants.map(entry => ({ ...entry, category: 'stage' })),
    ].sort((left, right) => left.order - right.order)
    expect(artists).toEqual(performers)
    expect(artists).toHaveLength(49)
    expect(artists.filter(entry => entry.category === 'music')).toHaveLength(30)
    expect(artists.filter(entry => entry.category === 'stage')).toHaveLength(19)
    expect(artists.some(entry => entry.id === 'absurdo')).toBe(false)
    expect(Object.fromEntries(artists.filter(entry => ['de-papel', 'carpe-diem', 'la-gran-troupe-circo', 'viaje-a-la-luna'].includes(entry.id)).map(({ id, company }) => [id, company]))).toEqual({
      'de-papel': 'Compañia Silencio Blanco',
      'carpe-diem': 'Malabicirco',
      'la-gran-troupe-circo': 'Malabicirco',
      'viaje-a-la-luna': 'La Patogallina',
    })
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
    expect(byId['narrando-mundos-en-bicicuentera'].company).toBe('Títeres Ojos de Agua')
    expect(byId['trans-humante'].company).toBe('Espacio La Isla')
    expect(byId['un-derrotero-nortino-con-marionetas']).toMatchObject({
      name: 'Un Derrotero Nortino con Marionetas', company: 'Red Lambe Norte',
      date: { day: 'Domingo 29', time: '18:00', month: 'noviembre' },
    })
    expect(byId.pulsando).toMatchObject({ name: 'Pulsando', company: 'Agrupación Flamenco Elqui' })
    expect(JSON.stringify(data)).not.toContain('Zapato Rojo')
    expect(artists).toHaveLength(49)
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
    expect(catalog.expo.location).toBe('Estacionamiento subterráneo')
    for (const entry of catalog.expo.participants) {
      expect(Object.keys(entry).sort()).toEqual(['description', 'id', 'image', 'name'])
      expect(artists.some(artist => artist.id === entry.id)).toBe(false)
    }
    for (const entry of catalog.market.participants) {
      expect(Object.keys(entry).sort()).toEqual(['date', 'description', 'id', 'image', 'name'])
      expect(artists.some(artist => artist.id === entry.id)).toBe(false)
    }
  })
})
