// Cifrado en reposo derivado del PIN: PBKDF2 (SHA-256) -> clave AES-GCM 256.
// El PIN nunca se guarda; la clave vive solo en memoria durante la sesión.
const ITERATIONS = 310_000
const td = new TextDecoder()
const te = new TextEncoder()

function toB64(bytes: Uint8Array): string {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s)
}

function fromB64(b64: string): Uint8Array<ArrayBuffer> {
  const s = atob(b64)
  const out = new Uint8Array(s.length)
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i)
  return out
}

/** ¿Está disponible WebCrypto? (falta en contextos no seguros: HTTP que no sea localhost). */
export function cryptoAvailable(): boolean {
  return typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined'
}

/** Sal aleatoria de 16 bytes en hex (32 caracteres). */
export function randomSaltHex(): string {
  return [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Deriva una clave AES-GCM a partir del PIN y una sal. */
export async function deriveKey(pin: string, saltHex: string): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey('raw', te.encode(pin), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: te.encode(saltHex), iterations: ITERATIONS, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export interface Encrypted {
  iv: string
  ct: string
}

export async function encryptString(key: CryptoKey, plain: string): Promise<Encrypted> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, te.encode(plain))
  return { iv: toB64(iv), ct: toB64(new Uint8Array(ct)) }
}

/** Devuelve el texto claro, o lanza si la clave es incorrecta o el dato está dañado. */
export async function decryptString(key: CryptoKey, enc: Encrypted): Promise<string> {
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(enc.iv) }, key, fromB64(enc.ct))
  return td.decode(pt)
}
