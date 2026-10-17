import type { MessageKey } from '../i18n'

export interface HelplineEntry {
  labelKey: MessageKey
  phone: string
}

// Verificados el 2026-10-17 contra las fuentes indicadas.
export const HELPLINES: Record<string, HelplineEntry[]> = {
  ES: [
    // https://www.sanidad.gob.es/linea024/ — Línea 024 de atención a la conducta suicida
    { labelKey: 'helplines.es024', phone: '024' },
    { labelKey: 'helplines.emergency', phone: '112' },
  ],
  MX: [
    // Línea de la Vida (CONASAMA), 24 h — https://www.gob.mx/conasama
    { labelKey: 'helplines.mxLineaVida', phone: '800 911 2000' },
    { labelKey: 'helplines.emergency', phone: '911' },
  ],
  AR: [
    // Línea 141 SEDRONAR, 24 h — https://www.argentina.gob.ar/tema/cuidarlasalud/recuperacion-de-adicciones
    { labelKey: 'helplines.ar141', phone: '141' },
    // Línea nacional de urgencias en salud mental — Ministerio de Salud
    { labelKey: 'helplines.arMentalHealth', phone: '0800 999 0091' },
    { labelKey: 'helplines.emergency', phone: '911' },
  ],
  CO: [
    // Línea 106 — https://minsalud.gov.co/salud/publica/salud-mental/Paginas/linea-106.aspx
    { labelKey: 'helplines.co106', phone: '106' },
    { labelKey: 'helplines.emergency', phone: '123' },
  ],
  CL: [
    // *4141 MINSAL — https://www.minsal.cl/ministerio-de-salud-lanza-guia-ciudadana-para-la-prevencion-del-suicidio/
    { labelKey: 'helplines.cl4141', phone: '*4141' },
    // Fono Drogas y Alcohol SENDA — https://www.senda.gob.cl
    { labelKey: 'helplines.cl1412', phone: '1412' },
    { labelKey: 'helplines.emergency', phone: '131' },
  ],
  US: [
    // https://988lifeline.org
    { labelKey: 'helplines.us988', phone: '988' },
    // SAMHSA National Helpline — https://www.samhsa.gov/find-help/helplines/national-helpline
    { labelKey: 'helplines.usSamhsa', phone: '1-800-662-4357' },
    { labelKey: 'helplines.emergency', phone: '911' },
  ],
  GB: [
    // https://www.samaritans.org
    { labelKey: 'helplines.samaritans', phone: '116 123' },
    { labelKey: 'helplines.gbNhs111', phone: '111' },
    { labelKey: 'helplines.emergency', phone: '999' },
  ],
  IE: [
    { labelKey: 'helplines.samaritans', phone: '116 123' },
    // https://www2.hse.ie/services/habit-addiction/drugs-and-alcohol-helpline/
    { labelKey: 'helplines.ieHse', phone: '1800 459 459' },
    { labelKey: 'helplines.emergency', phone: '112' },
  ],
  CA: [
    // https://988.ca
    { labelKey: 'helplines.ca988', phone: '988' },
    { labelKey: 'helplines.emergency', phone: '911' },
  ],
}

export const FALLBACK_HELPLINES: HelplineEntry[] = [
  { labelKey: 'helplines.emergency', phone: '112' },
  { labelKey: 'helplines.emergencyAmericas', phone: '911' },
]

export const FIND_A_HELPLINE_URL = 'https://findahelpline.com'

export const SUPPORTED_COUNTRIES = Object.keys(HELPLINES)

export function helplinesFor(country: string): HelplineEntry[] {
  return HELPLINES[country.toUpperCase()] ?? FALLBACK_HELPLINES
}

export function detectCountry(navLang: string): string {
  const [lang, region] = navLang.split('-')
  if (region) return region.toUpperCase()
  return lang?.toLowerCase() === 'es' ? 'ES' : 'US'
}

export function currencyFor(country: string): string {
  const map: Record<string, string> = {
    ES: 'EUR', IE: 'EUR', MX: 'MXN', AR: 'ARS', CO: 'COP', CL: 'CLP', US: 'USD', GB: 'GBP', CA: 'CAD',
  }
  return map[country] ?? 'EUR'
}
