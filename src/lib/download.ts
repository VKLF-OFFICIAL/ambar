import { toLocalDateKey } from './time'

export function downloadBackup(json: string): void {
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ambar-backup-${toLocalDateKey(Date.now())}.json`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
