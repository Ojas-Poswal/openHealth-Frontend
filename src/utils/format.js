/** Formatting helpers shared across pages. */

export function formatDate(value, options = {}) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  })
}

export function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** "August 2025" — the timeline's month label. */
export function formatMonthYear(value) {
  if (!value) return 'Undated'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Undated'
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

/** "Aug 2025" — compact chip label. */
export function formatShortMonthYear(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
}

export function timeAgo(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  const seconds = Math.round((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const table = [
    ['minute', 60],
    ['hour', 3600],
    ['day', 86400],
    ['week', 604800],
    ['month', 2592000],
    ['year', 31536000],
  ]
  let unit = 'minute'
  let divisor = 60
  for (const [name, secs] of table) {
    if (seconds >= secs) {
      unit = name
      divisor = secs
    }
  }
  const count = Math.floor(seconds / divisor)
  return `${count} ${unit}${count === 1 ? '' : 's'} ago`
}

export function ageFrom(dateOfBirth) {
  if (!dateOfBirth) return null
  const dob = new Date(dateOfBirth)
  if (Number.isNaN(dob.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - dob.getFullYear()
  const monthDelta = now.getMonth() - dob.getMonth()
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < dob.getDate())) age -= 1
  return age >= 0 ? age : null
}

export function initials(name) {
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function humanize(value) {
  if (!value) return ''
  return String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function truncate(text, length = 140) {
  if (!text) return ''
  return text.length <= length ? text : `${text.slice(0, length).trimEnd()}…`
}

export function isImageFile(url) {
  return /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(url || '')
}

export function isPdfFile(url) {
  return /\.pdf(\?.*)?$/i.test(url || '')
}

/**
 * A saved link is whatever the patient typed, so it could be a phone number, a
 * bare domain, or a full URL. `linkHref` turns it into something the browser
 * can actually follow; `linkLabel` turns it into something worth reading.
 *
 * Both return null / '' for empty input so callers can skip rendering.
 */

/** Digits, spaces and the usual phone punctuation, with enough digits to dial. */
export function isPhoneNumber(value) {
  const raw = String(value ?? '').trim()
  // Checked before the URL cases because "9876543210" is a valid-looking host.
  return /^\+?[\d\s().-]+$/.test(raw) && raw.replace(/\D/g, '').length >= 7
}

export function linkHref(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return null
  if (isPhoneNumber(raw)) return `tel:${raw.replace(/[^\d+]/g, '')}`
  if (/^(https?:|mailto:|tel:)/i.test(raw)) return raw
  return `https://${raw}`
}

export function linkLabel(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return ''
  // A phone number reads better as the number itself.
  if (isPhoneNumber(raw)) return raw

  try {
    const url = new URL(/^(https?:|mailto:|tel:)/i.test(raw) ? raw : `https://${raw}`)
    const path = url.pathname && url.pathname !== '/' ? url.pathname.replace(/\/$/, '') : ''
    return `${url.hostname.replace(/^www\./, '')}${path}`
  } catch {
    return raw
  }
}

export function pluralize(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural || `${singular}s`}`
}

/**
 * Compact form for stat-tile values: 942 → "942", 1284 → "1,284",
 * 12934 → "12.9K". Below 10,000 the exact number is more useful than an
 * abbreviation, so the shortening only kicks in past that point.
 */
export function compactNumber(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '0'
  const n = Number(value)
  if (Math.abs(n) < 10000) return n.toLocaleString()
  if (Math.abs(n) < 1000000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`
  return `${(n / 1000000).toFixed(1).replace(/\.0$/, '')}M`
}

/**
 * Percentage of a checklist that is filled in — used for the patient's
 * profile-completeness meter. Returns { completed, total, percent }.
 */
export function completion(entries) {
  const total = entries.length
  const completed = entries.filter((value) => {
    if (Array.isArray(value)) return value.length > 0
    return value !== null && value !== undefined && String(value).trim() !== ''
  }).length
  return { completed, total, percent: total === 0 ? 0 : Math.round((completed / total) * 100) }
}

