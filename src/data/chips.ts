export const EMOTION_CHIPS = [
  'stress', 'anxiety', 'boredom', 'sadness', 'loneliness', 'anger', 'tiredness', 'joy', 'shame', 'other',
] as const

export const ENVIRONMENT_CHIPS = [
  'home', 'work', 'friends', 'party', 'alone', 'family', 'street', 'online', 'other',
] as const

export const RELAPSE_PLAN_CHIPS = [
  'callSomeone', 'avoidPlace', 'sosEarlier', 'sleep', 'eatWell', 'removeAccess', 'professional', 'planEvenings',
] as const

export type EmotionChip = (typeof EMOTION_CHIPS)[number]
export type EnvironmentChip = (typeof ENVIRONMENT_CHIPS)[number]
export type PlanChip = (typeof RELAPSE_PLAN_CHIPS)[number]
