import { artists, disciplines, participantCatalog } from './artists'

export type CategoryKey = keyof typeof participantCatalog

/** Build-time projection only. Client code may import this type, never this module's values. */
export interface ParticipantView {
  id: string
  name: string
  category: CategoryKey
  canonicalPath: string
  description: string
  date: { day: string, time: string, month?: string }
  image: { url: string, alt: string } | null
  location?: string
  socialLinks?: { instagram?: string, spotify?: string }
  company?: string
  disciplineName?: string
  ticketUrl: string | null
}

export interface CategoryView {
  key: CategoryKey
  slug: string
  name: string
  path: string
  participants: readonly ParticipantView[]
}

/** An actionable ticket must be absolute HTTP(S), not a browser-relative URL. */
export function safeTicketUrl(value: string | null | undefined): string | null {
  if (!value || !/^https?:\/\//i.test(value)) return null
  try {
    const url = new URL(value)
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname ? url.href : null
  } catch {
    return null
  }
}

const publicSlugs = {
  music: 'musica',
  stage: 'artes-escenicas',
  expo: 'expo-arte-co',
  market: 'mercado-creativo-y-daz',
} as const satisfies Record<CategoryKey, string>

export const categories: readonly CategoryView[] = (Object.keys(publicSlugs) as CategoryKey[]).map(key => {
  const slug = publicSlugs[key]
  const path = `/${slug}/`
  const category = participantCatalog[key]
  return {
    key, slug, path, name: category.name,
    participants: category.participants.map(participant => ({
      id: participant.id,
      name: participant.name,
      category: key,
      canonicalPath: `${path}${participant.id}/`,
      description: participant.description,
      date: participant.date,
      image: participant.image,
      ...('location' in participant ? { location: participant.location } : {}),
      ...('socialLinks' in participant ? { socialLinks: participant.socialLinks } : {}),
      ...('company' in participant ? { company: participant.company } : {}),
      ...('disciplines' in participant ? { disciplineName: disciplines.find(({ id }) => id === participant.disciplines)!.name } : {}),
      ticketUrl: safeTicketUrl('ticketUrl' in participant ? participant.ticketUrl : null),
    })),
  }
})

export const participants: readonly ParticipantView[] = categories.flatMap(category => category.participants)
const byId = new Map(participants.map(participant => [participant.id, participant]))
/** Reuse the validated, sorted business-rule selection; national never filters it. */
export const heroParticipants: readonly ParticipantView[] = artists.map(({ id }) => byId.get(id)!)
