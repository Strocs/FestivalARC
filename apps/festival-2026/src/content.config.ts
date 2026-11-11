import { defineCollection } from 'astro:content'
import { readLocalProgram } from './features/program/local'
import { activitySchema, artistSchema, venueSchema } from './features/program/program'

// Each build-time loader validates the whole local graph before storing entries.
export const collections = {
  artists: defineCollection({ loader: () => readLocalProgram().artists, schema: artistSchema }),
  activities: defineCollection({ loader: () => readLocalProgram().activities, schema: activitySchema }),
  venues: defineCollection({ loader: () => readLocalProgram().venues, schema: venueSchema }),
}
