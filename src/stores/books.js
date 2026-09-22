import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { seedBooks } from './seed'
import { useLoansStore } from './loans'
import { newId } from '@/utils/format'

const clean = (d) => ({
  title: d.title.trim(),
  author: d.author.trim(),
  year: d.year ? Number(d.year) : null,
  genre: d.genre.trim()
})

export const useBooksStore = defineStore('books', () => {
  const items = ref(seedBooks())

  const total = computed(() => items.value.length)
  const genres = computed(() =>
    [...new Set(items.value.map((b) => b.genre).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'))
  )
  const byId = (id) => items.value.find((b) => b.id === id) ?? null

  function add(data) {
    const book = { id: newId('b'), ...clean(data) }
    items.value.push(book)
    return book
  }

  function update(id, data) {
    const book = byId(id)
    if (!book) throw new Error('El libro no existe.')
    Object.assign(book, clean(data))
    return book
  }

  // Un libro con historial no se borra: perderíamos la trazabilidad de sus préstamos.
  function remove(id) {
    if (useLoansStore().hasHistoryOfBook(id))
      throw new Error('No se puede eliminar: el libro tiene historial de préstamos.')
    items.value = items.value.filter((b) => b.id !== id)
  }

  return { items, total, genres, byId, add, update, remove }
})
