const FIXED = {
  Novela: '#7b2d3b',
  Cuento: '#2f5f7f',
  Ciencia: '#2b6b57',
  Historia: '#8a5a2c',
  'Matemáticas': '#4b427f',
  Infantil: '#c0692b',
  'Clásico': '#5b4b30',
  'Tecnología': '#34474f'
}
const EXTRA = ['#8b3f5e', '#3d6b8f', '#5c7a3a', '#a0522d', '#5a4a8a', '#2f6f6f']

export function hash(str = '') {
  let h = 0
  for (const ch of str) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h
}
export const genreColor = (g) => FIXED[g] ?? EXTRA[hash(g) % EXTRA.length]
export const spineHeight = (id) => 120 + (hash(id) % 60)
