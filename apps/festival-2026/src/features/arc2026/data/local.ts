import artists from '../../../content/artists/demo.json'
import activities from '../../../content/activities/demo.json'
import venues from '../../../content/venues/demo.json'
import { validateProgram } from './program'
import type { Program } from './program'

/** Shared by Astro collection loaders and static renderers; no runtime requests. */
export function readLocalProgram(): Program {
  return validateProgram({ artists, activities, venues })
}
