const STORAGE_KEY = 'arc2025:selectedStageIds'

const isClient = typeof window !== 'undefined'

export const stageSelectionStorage = {
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


// TODO: Si en el futuro día 1 y día 2 tienen stages diferentes, agregar validación
// de contexto (ej: agregar dayId al STORAGE_KEY o validar contra configuración actual)
export function getValidStageIds(
  storedIds: string[] | null,
  availableStageIds: string[],
): string[] {
  if (!storedIds || storedIds.length === 0) {
    return []
  }

  return storedIds.filter((id) => availableStageIds.includes(id))
}
