// Input checks shared by API routes.
import { LANGUAGE_BY_CODE } from './languages.mjs'

export const LEVEL_KEYS = ['beginner', 'intermediate', 'advanced']

export const isLanguage = code => typeof code === 'string' && Boolean(LANGUAGE_BY_CODE[code])
export const isLevel = level => LEVEL_KEYS.includes(level)
export const isDeliveryTime = t => typeof t === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(t)

export function isTimeZone(tz) {
  if (typeof tz !== 'string' || !tz) return false
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz })
    return true
  } catch {
    return false
  }
}
