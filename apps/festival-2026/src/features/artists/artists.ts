import { z } from 'astro/zod'
import artistData from '../../content/artists.json'
import disciplineData from '../../content/disciplines.json'

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

export const disciplines = z.array(z.strictObject({
  id: slug,
  name: z.string().min(1),
})).min(1).refine(
  entries => new Set(entries.map(({ id }) => id)).size === entries.length,
  'Discipline IDs must be unique.',
).parse(disciplineData)

const performerSchema = z.strictObject({
  id: slug,
  name: z.string().min(1),
  company: z.string().min(1).optional(),
  order: z.number().int().nonnegative(),
  disciplines: z.string().refine(
    id => disciplines.some(discipline => discipline.id === id),
    'Unknown discipline ID.',
  ),
  description: z.string(),
  ticketUrl: z.string().nullable(),
  date: z.strictObject({ day: z.string().min(1), time: z.string().min(1) }),
  image: z.strictObject({ url: z.string().min(1), alt: z.string() }).nullable(),
})

/** Music's national flag records national status, not hero eligibility. */
const musicSchema = performerSchema.extend({ national: z.boolean() })
export const artistSchema = z.discriminatedUnion('category', [
  musicSchema.extend({ category: z.literal('music') }),
  performerSchema.extend({ category: z.literal('stage') }),
])
export type Artist = z.infer<typeof artistSchema>

const artistsSchema = z.array(artistSchema).min(1).superRefine((entries, context) => {
  const ids = new Set<string>()
  const orders = new Set<number>()
  entries.forEach((artist, index) => {
    if (ids.has(artist.id) || orders.has(artist.order)) {
      context.addIssue({ code: 'custom', path: [index], message: 'Artist IDs and orders must be unique.' })
    }
    ids.add(artist.id)
    orders.add(artist.order)
  })
})

/** Validate and sort a new array without changing the editable source. */
export function validateArtists(input: unknown): Artist[] {
  return artistsSchema.parse(input).sort((left, right) => left.order - right.order)
}

const participantSchema = performerSchema.pick({
  id: true, name: true, description: true, date: true, image: true,
})
const catalogSchema = z.strictObject({
  music: z.strictObject({ name: z.literal('Música'), participants: z.array(musicSchema).min(1) }),
  stage: z.strictObject({ name: z.literal('Artes Escénicas'), participants: z.array(performerSchema).min(1) }),
  expo: z.strictObject({ name: z.literal('Expo Arte.Co'), participants: z.array(participantSchema).min(1) }),
  market: z.strictObject({ name: z.literal('Mercado Creativo y DAZ'), participants: z.array(participantSchema).min(1) }),
}).superRefine((catalog, context) => {
  const ids = new Set<string>()
  for (const [category, { participants }] of Object.entries(catalog)) {
    participants.forEach(({ id }, index) => {
      if (ids.has(id)) context.addIssue({ code: 'custom', path: [category, 'participants', index, 'id'], message: 'Participant IDs must be unique.' })
      ids.add(id)
    })
  }
})

/** Categories are editorial groupings, not inferred disciplines. */
export function validateParticipantCatalog(input: unknown) {
  const catalog = catalogSchema.parse(input)
  validateArtists([
    ...catalog.music.participants.map(artist => ({ ...artist, category: 'music' })),
    ...catalog.stage.participants.map(artist => ({ ...artist, category: 'stage' })),
  ])
  return catalog
}

export const participantCatalog = validateParticipantCatalog(artistData)

/** Business rule: all music and stage works, regardless of national, belong to the hero.
 * Existing artist routes retain that same set until the separately scoped route migration.
 */
export const artists: readonly Artist[] = validateArtists([
  ...participantCatalog.music.participants.map(artist => ({ ...artist, category: 'music' })),
  ...participantCatalog.stage.participants.map(artist => ({ ...artist, category: 'stage' })),
])
