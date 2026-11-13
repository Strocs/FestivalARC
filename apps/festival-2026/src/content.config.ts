import { defineCollection } from 'astro:content'
import { artists, artistSchema } from './features/artists/artists'

// Collections and static pages consume the same validated, explicitly ordered data.
export const collections = {
  artists: defineCollection({ loader: () => [...artists], schema: artistSchema }),
}
