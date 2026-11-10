import { atom } from 'nanostores'

// Shared only by native navigation and cosmetic motion; never a URL/data cache.
export const selectedDetail = atom<HTMLDialogElement | null>(null)
