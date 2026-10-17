function toHex(buf: ArrayBuffer | Uint8Array): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function hashPin(pin: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${pin}`)
  return toHex(await crypto.subtle.digest('SHA-256', data))
}

/** Devuelve `salt:hash`. Protege de miradas, no es cifrado fuerte. */
export async function createPinHash(pin: string): Promise<string> {
  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)))
  return `${salt}:${await hashPin(pin, salt)}`
}

export async function verifyPin(pin: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  return (await hashPin(pin, salt)) === hash
}
