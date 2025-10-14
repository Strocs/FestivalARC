const STORAGE_KEY = 'arc2025:stages:selection'

const isClient = typeof window !== 'undefined'

// NOTE: Maybe create a repository with dependency injection?
export const trackSelectionStorage = {
  get(): string[] | null {
    if (!isClient) return null

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return null
    }
  },

  set(stageIds: string[]): void {
    if (!isClient) return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stageIds))
    } catch (error) {
      console.error('Error writing to localStorage:', error)
    }
  },

  clear(): void {
    if (!isClient) return

    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  },
}

export function getValidTrackIds(
  storedIds: string[] | null,
  availableTrackIds: string[],
): string[] {
  if (!storedIds || storedIds.length === 0) {
    return []
  }

  return storedIds.filter((id) => availableTrackIds.includes(id))
}
