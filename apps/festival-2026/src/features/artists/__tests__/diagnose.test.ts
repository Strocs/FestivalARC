import { describe, expect, it } from 'vitest'
import data from '../../../content/artists.json'
import { artistSchema } from '../artists'

describe('diagnose inundaramos', () => {
  it('validates inundaramos record', () => {
    const d = data as any
    const ids = d.music.participants.map((a: any) => a.id)
    const target = ids.find((id: string) => id.includes('nund'))
    console.log('Target id found:', target)
    console.log('Target char codes:', [...target].map(c => c.charCodeAt(0)))
    console.log('Expected char codes:', [...'inundamos'].map(c => c.charCodeAt(0)))
    console.log('Exact match:', target === 'inundamos')
  })
})
