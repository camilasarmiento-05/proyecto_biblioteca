import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { seedBooks } from './seed'
import { useLoansStore } from './loans'
import { newId } from '@/utils/format'

const clean = (d) => ({
  title: d.title.trim(),
  author: d.author.trim(),
  year: d.year ? Number(d.year) : null,
  genre: d.genre.trim(),
  serial: d.serial.trim().toUpperCase(),
  description: (d.description ?? '').trim()
})

export const useBooksStore = defineStore(
  'books',
  () => {
    const items = ref(seedBooks())

    const total = computed(() => items.value.length)
    const activeItems = computed(() => items.value.filter((b) => b.active !== false))
    const activeTotal = computed(() => activeItems.value.length)
    const genres = computed(() =>
      [...new Set(items.value.map((b) => b.genre).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'))
    )
    const byId = (id) => items.value.find((b) => b.id === id) ?? null
    const serialTaken = (serial, exceptId = null) =>
      items.value.some((b) => b.serial?.toUpperCase() === String(serial).trim().toUpperCase() && b.id !== exceptId)

    /** Siguiente serial sugerido: LIB-0001, LIB-0002... */
    function nextSerial() {
      const max = items.value.reduce((m, b) => {
        const n = Number(/^LIB-(\d+)$/.exec(b.serial ?? '')?.[1] ?? 0)
        return Math.max(m, n)
      }, 0)
      return `LIB-${String(max + 1).padStart(4, '0')}`
    }

    function add(data) {
      if (serialTaken(data.serial)) throw new Error('Ya existe un libro con ese serial.')
      const book = { id: newId('b'), ...clean(data), active: true }
      items.value.push(book)
      return book
    }

    function update(id, data) {
      const book = byId(id)
      if (!book) throw new Error('El libro no existe.')
      if (serialTaken(data.serial, id)) throw new Error('Ya existe un libro con ese serial.')
      Object.assign(book, clean(data))
      return book
    }

    /** Activa o desactiva. No se puede desactivar un libro que está prestado. */
    function toggleActive(id) {
      const book = byId(id)
      if (!book) throw new Error('El libro no existe.')
      if (book.active !== false && !useLoansStore().isAvailable(id))
        throw new Error('No se puede desactivar: el libro está prestado. Primero debe devolverse.')
      book.active = book.active === false
      return book
    }

    return { items, total, activeItems, activeTotal, genres, byId, serialTaken, nextSerial, add, update, toggleActive }
  },
  { persist: { key: 'biblioteca-books' } }
)
