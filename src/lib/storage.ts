import type { StateStorage } from 'zustand/middleware'

/** localStorage con respaldo en memoria si no está disponible (modo privado, cuota llena). */
export function createSafeStorage(onUnavailable: () => void): StateStorage {
  const memory = new Map<string, string>()
  let failed = false
  const fail = () => {
    if (!failed) {
      failed = true
      onUnavailable()
    }
  }
  return {
    getItem(name) {
      if (memory.has(name)) return memory.get(name) ?? null
      try {
        return localStorage.getItem(name)
      } catch {
        fail()
        return null
      }
    },
    setItem(name, value) {
      try {
        localStorage.setItem(name, value)
        memory.delete(name)
      } catch {
        fail()
        memory.set(name, value)
      }
    },
    removeItem(name) {
      memory.delete(name)
      try {
        localStorage.removeItem(name)
      } catch {
        fail()
      }
    },
  }
}
