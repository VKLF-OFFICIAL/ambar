export type TrackerKind =
  | 'tobacco'
  | 'vape'
  | 'alcohol'
  | 'cannabis'
  | 'stimulants'
  | 'opioids'
  | 'sedatives'
  | 'gambling'
  | 'porn'
  | 'social'
  | 'gaming'
  | 'shopping'
  | 'food'
  | 'caffeine'
  | 'custom'

export interface Reason {
  id: string
  text: string
  emoji?: string
}

export interface PastStreak {
  start: string
  end: string
  durationMs: number
  trigger?: string[]
  note?: string
  plan?: string[]
}

export interface Tracker {
  id: string
  kind: TrackerKind
  customName?: string
  /** ISO, inicio de la racha actual */
  startDate: string
  createdAt: string
  costPerDay?: number
  minutesPerDay?: number
  reasons: Reason[]
  streakHistory: PastStreak[]
  /** Hitos de la racha actual; se vacía en resetStreak */
  celebratedMilestones: string[]
  /** Conductas sin abstinencia total: qué cuenta como recaída */
  redLine?: string
  medicalNoticeAck?: boolean
}

export interface JournalEntry {
  id: string
  trackerId: string
  at: string
  source: 'checkin' | 'sos'
  intensity: number
  emotions: string[]
  environments: string[]
  overcame?: boolean
  note?: string
  sosDurationSec?: number
}

/** Global: uno por día, no por seguimiento */
export interface Pledge {
  date: string
  pledgedAt?: string
  dayRating?: 1 | 2 | 3 | 4 | 5
  note?: string
}

export interface Helpline {
  label: string
  phone: string
}

export interface Settings {
  theme: 'dark' | 'light'
  locale: 'es' | 'en'
  country: string
  currency: string
  pinHash?: string
  reduceMotion: boolean
  customHelplines: Helpline[]
  name?: string
  onboarded: boolean
  activeTrackerId?: string
}
