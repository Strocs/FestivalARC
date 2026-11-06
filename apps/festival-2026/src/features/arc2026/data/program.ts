import { z } from 'astro/zod'

export const demoLabel = 'Demostración: artista, actividades, horarios y espacios no confirmados.'

const identity = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  order: z.number().int().nonnegative(),
  demo: z.literal(true),
  name: z.string().min(1),
})
const disciplines = z.array(z.string().min(1)).min(1)

export const artistSchema = identity.extend({ disciplines })
export const venueSchema = identity.extend({ city: z.literal('La Serena') })
export const activitySchema = identity.extend({
  artistId: z.string().min(1),
  venueId: z.string().min(1),
  disciplines,
  startsAt: z.iso.datetime({ offset: true }),
  externalUrl: z.url({ protocol: /^https?$/ }).optional(),
})

export type Artist = z.infer<typeof artistSchema>
export type Activity = z.infer<typeof activitySchema>
export type Venue = z.infer<typeof venueSchema>

const programSchema = z.object({
  artists: z.array(artistSchema).min(1),
  activities: z.array(activitySchema).min(1),
  venues: z.array(venueSchema).min(1),
}).superRefine((program, context) => {
  for (const collection of ['artists', 'activities', 'venues'] as const) {
    const ids = new Set<string>()
    const orders = new Set<number>()
    program[collection].forEach((entry, index) => {
      if (ids.has(entry.id) || orders.has(entry.order)) {
        context.addIssue({ code: 'custom', path: [collection, index], message: 'ID y orden deben ser únicos en la colección.' })
      }
      ids.add(entry.id)
      orders.add(entry.order)
    })
  }
  program.activities.forEach((activity, index) => {
    if (!program.artists.some(({ id }) => id === activity.artistId)) {
      context.addIssue({ code: 'custom', path: ['activities', index, 'artistId'], message: 'Artista inexistente.' })
    }
    if (!program.venues.some(({ id }) => id === activity.venueId)) {
      context.addIssue({ code: 'custom', path: ['activities', index, 'venueId'], message: 'Espacio inexistente.' })
    }
  })
})

export type Program = z.infer<typeof programSchema>

/** Pure build-time validation; never reorder or modify the caller's input. */
export function validateProgram(input: unknown): Program {
  const program = programSchema.parse(input)
  for (const entries of [program.artists, program.activities, program.venues]) {
    entries.sort((left, right) => left.order - right.order)
  }
  return program
}

export function activitiesForArtist(program: Program, artistId: string): Activity[] {
  return program.activities.filter((activity) => activity.artistId === artistId)
}

const activityTime = new Intl.DateTimeFormat('es-CL', {
  timeZone: 'America/Santiago', weekday: 'long', year: 'numeric',
  month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
})

export function formatActivityTime(startsAt: string): string {
  return activityTime.format(new Date(startsAt))
}
