import type { MessageKey } from '../i18n'
import { DAY, HOUR, MINUTE } from '../lib/time'

export interface HealthPoint {
  afterMs: number
  textKey: MessageKey
  source: string
}

const WHO_TOBACCO = 'OMS — Health benefits of smoking cessation (who.int)'
const NHS_ALCOHOL = 'NHS — Tips on cutting down / Alcohol support (nhs.uk)'
const BLT = 'British Liver Trust — Alcohol and liver disease (britishlivertrust.org.uk)'

export const HEALTH_TIMELINE: Record<'tobacco' | 'alcohol', HealthPoint[]> = {
  tobacco: [
    { afterMs: 20 * MINUTE, textKey: 'health.tobacco.m20', source: WHO_TOBACCO },
    { afterMs: 12 * HOUR, textKey: 'health.tobacco.h12', source: WHO_TOBACCO },
    { afterMs: 14 * DAY, textKey: 'health.tobacco.w2', source: WHO_TOBACCO },
    { afterMs: 30 * DAY, textKey: 'health.tobacco.m1', source: WHO_TOBACCO },
    { afterMs: 365 * DAY, textKey: 'health.tobacco.y1', source: WHO_TOBACCO },
    { afterMs: 5 * 365 * DAY, textKey: 'health.tobacco.y5', source: WHO_TOBACCO },
    { afterMs: 10 * 365 * DAY, textKey: 'health.tobacco.y10', source: WHO_TOBACCO },
    { afterMs: 15 * 365 * DAY, textKey: 'health.tobacco.y15', source: WHO_TOBACCO },
  ],
  alcohol: [
    { afterMs: 3 * DAY, textKey: 'health.alcohol.d3', source: NHS_ALCOHOL },
    { afterMs: 7 * DAY, textKey: 'health.alcohol.w1', source: NHS_ALCOHOL },
    { afterMs: 21 * DAY, textKey: 'health.alcohol.w3', source: BLT },
    { afterMs: 30 * DAY, textKey: 'health.alcohol.m1', source: NHS_ALCOHOL },
    { afterMs: 90 * DAY, textKey: 'health.alcohol.m3', source: NHS_ALCOHOL },
    { afterMs: 365 * DAY, textKey: 'health.alcohol.y1', source: NHS_ALCOHOL },
  ],
}
