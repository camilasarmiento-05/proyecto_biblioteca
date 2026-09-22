// Todas las fechas se guardan como texto "YYYY-MM-DD" (hora local).
// Así se evitan los corrimientos de zona horaria de new Date('YYYY-MM-DD').

const pad = (n) => String(n).padStart(2, '0')
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

const parse = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
const toStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const todayStr = () => toStr(new Date())
export const addDays = (s, n) => {
  const d = parse(s)
  d.setDate(d.getDate() + n)
  return toStr(d)
}
/** Días entre a y b (a - b). */
export const daysDiff = (a, b) => Math.round((parse(a) - parse(b)) / 86400000)

export function fmtDate(s) {
  if (!s) return '—'
  const [y, m, d] = s.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}

/** Texto corto sobre el vencimiento: "Vence en 3 días", "Venció hace 6 días"... */
export function dueLabel(dueAt) {
  const d = daysDiff(dueAt, todayStr())
  if (d > 1) return `Vence en ${d} días`
  if (d === 1) return 'Vence mañana'
  if (d === 0) return 'Vence hoy'
  if (d === -1) return 'Venció ayer'
  return `Venció hace ${-d} días`
}

/** Para buscar sin importar tildes ni mayúsculas. */
export const normalize = (s = '') =>
  String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export const initials = (name = '') =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')

export const newId = (prefix) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
