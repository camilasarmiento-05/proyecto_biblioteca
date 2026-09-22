import { defineStore } from 'pinia'
import { ref } from 'vue'
import { seedUsers } from './seed'
import { useLoansStore } from './loans'
import { newId } from '@/utils/format'

const clean = (d) => ({
  name: d.name.trim(),
  document: d.document.trim(),
  email: (d.email ?? '').trim(),
  phone: (d.phone ?? '').trim()
})

export const useUsersStore = defineStore('users', () => {
  const items = ref(seedUsers())

  const byId = (id) => items.value.find((u) => u.id === id) ?? null
  const documentTaken = (document, exceptId = null) =>
    items.value.some((u) => u.document === document.trim() && u.id !== exceptId)

  function add(data) {
    if (documentTaken(data.document)) throw new Error('Ya existe un usuario con ese documento.')
    const user = { id: newId('u'), ...clean(data) }
    items.value.push(user)
    return user
  }

  function update(id, data) {
    const user = byId(id)
    if (!user) throw new Error('El usuario no existe.')
    if (documentTaken(data.document, id)) throw new Error('Ya existe un usuario con ese documento.')
    Object.assign(user, clean(data))
    return user
  }

  function remove(id) {
    if (useLoansStore().hasHistoryOfUser(id))
      throw new Error('No se puede eliminar: el usuario tiene historial de préstamos.')
    items.value = items.value.filter((u) => u.id !== id)
  }

  return { items, byId, documentTaken, add, update, remove }
})
