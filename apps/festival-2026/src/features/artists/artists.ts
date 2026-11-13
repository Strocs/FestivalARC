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

export const artistSchema = z.strictObject({
  id: slug,
  name: z.string().min(1),
  group: z.enum(['national', 'regional', 'stage']),
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

export const artists: readonly Artist[] = validateArtists(artistData)
