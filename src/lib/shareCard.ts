// Genera una imagen cuadrada para compartir el progreso. No incluye el nombre de
// la adicción: solo los días, una frase y la marca. Todo local; nada se envía solo.

export interface ShareCardText {
  days: string
  daysLabel: string
  message: string
  brand: string
}

/** Índice estable (mismo número de días -> misma frase). */
export function pickIndex(days: number, count: number): number {
  if (count <= 0) return 0
  return ((Math.trunc(days) % count) + count) % count
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, baseY: number, maxWidth: number, lineHeight: number): void {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = w
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  const startY = baseY - (lines.length - 1) * lineHeight
  lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineHeight))
}

export async function renderShareCard(text: ShareCardText): Promise<Blob> {
  const size = 1080
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas no disponible')

  try {
    await document.fonts?.ready
  } catch {
    // Sin las fuentes de la app cargadas se usa la serif/sans del sistema.
  }

  ctx.fillStyle = '#1a1715'
  ctx.fillRect(0, 0, size, size)
  ctx.textAlign = 'center'

  ctx.fillStyle = '#e8b07a'
  ctx.font = '600 300px "Fraunces Variable", Georgia, serif'
  ctx.fillText(text.days, size / 2, size / 2 - 30)

  ctx.fillStyle = '#f3ece4'
  ctx.font = '400 66px "Inter Variable", system-ui, sans-serif'
  ctx.fillText(text.daysLabel, size / 2, size / 2 + 100)

  ctx.fillStyle = '#a39589'
  ctx.font = '400 40px "Inter Variable", system-ui, sans-serif'
  wrapText(ctx, text.message, size / 2, size - 220, size - 160, 54)

  ctx.fillStyle = '#e8b07a'
  ctx.font = '600 46px "Fraunces Variable", Georgia, serif'
  ctx.fillText(text.brand, size / 2, size - 90)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('no se pudo generar la imagen'))), 'image/png')
  })
}

/** Comparte la imagen con el diálogo del sistema; si no se puede, la descarga. */
export async function shareOrDownload(blob: Blob, filename: string): Promise<'shared' | 'downloaded'> {
  const nav = navigator as Navigator & { canShare?: (data?: ShareData) => boolean }
  try {
    const file = new File([blob], filename, { type: 'image/png' })
    if (typeof nav.share === 'function' && nav.canShare?.({ files: [file] })) {
      await nav.share({ files: [file] })
      return 'shared'
    }
  } catch (e) {
    // DOMException no siempre es instanceof Error; se comprueba el nombre directamente.
    if ((e as { name?: string })?.name === 'AbortError') return 'shared' // el usuario canceló
    // cualquier otro fallo al compartir cae a la descarga
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  return 'downloaded'
}
