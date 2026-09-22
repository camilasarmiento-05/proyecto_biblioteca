import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { seedLoans } from './seed'
import { addDays, daysDiff, newId, todayStr } from '@/utils/format'
import { DUE_SOON_DAYS, MAX_LOAN_DAYS, MAX_LOANS_PER_USER } from '@/utils/config'

/**
 * Los PRÉSTAMOS son la única fuente de verdad.
 * Un libro no guarda un "disponible: true/false": está disponible si y solo si
 * no existe ningún préstamo suyo sin fecha de devolución. Así el estado nunca
 * puede quedar desincronizado, y cada préstamo devuelto queda como historial.
 *
 * Préstamo: { id, bookId, userId, lentAt, dueAt, returnedAt | null }  (fechas "YYYY-MM-DD")
 */
export const useLoansStore = defineStore('loans', () => {
  const items = ref(seedLoans())

  // ---- Consultas ----
  const active = computed(() => items.value.filter((l) => !l.returnedAt))
  const activeByBook = computed(() => new Map(active.value.map((l) => [l.bookId, l])))

  const isOverdue = (loan) => !loan.returnedAt && loan.dueAt < todayStr()
  const statusOf = (loan) => (loan.returnedAt ? 'returned' : isOverdue(loan) ? 'overdue' : 'lent')

  const isAvailable = (bookId) => !activeByBook.value.has(bookId)
  const activeOfBook = (bookId) => activeByBook.value.get(bookId) ?? null
  const bookStatus = (bookId) => {
    const loan = activeOfBook(bookId)
    return !loan ? 'available' : isOverdue(loan) ? 'overdue' : 'lent'
  }

  const overdue = computed(() => active.value.filter(isOverdue))
  const dueSoon = computed(() =>
    active.value.filter((l) => !isOverdue(l) && daysDiff(l.dueAt, todayStr()) <= DUE_SOON_DAYS)
  )

  // Más reciente primero (los empates del mismo día se resuelven por orden de registro).
  const newestFirst = computed(() =>
    [...items.value].reverse().sort((a, b) => b.lentAt.localeCompare(a.lentAt))
  )
  const ofBook = (bookId) => newestFirst.value.filter((l) => l.bookId === bookId)
  const ofUser = (userId) => newestFirst.value.filter((l) => l.userId === userId)
  const activeOfUser = (userId) => ofUser(userId).filter((l) => !l.returnedAt)
  const overdueOfUser = (userId) => activeOfUser(userId).filter(isOverdue)

  const hasHistoryOfBook = (bookId) => items.value.some((l) => l.bookId === bookId)
  const hasHistoryOfUser = (userId) => items.value.some((l) => l.userId === userId)

  /** null si el usuario puede recibir un préstamo; si no, el motivo en texto. */
  function blockReason(userId) {
    if (overdueOfUser(userId).length) return 'Tiene préstamos vencidos'
    if (activeOfUser(userId).length >= MAX_LOANS_PER_USER)
      return `Ya tiene ${MAX_LOANS_PER_USER} libros prestados`
    return null
  }

  // ---- Acciones ----
  function lend({ bookId, userId, dueAt }) {
    if (!isAvailable(bookId)) throw new Error('Ese libro ya está prestado.')
    const reason = blockReason(userId)
    if (reason) throw new Error(`No se puede prestar: ${reason.toLowerCase()}.`)
    const today = todayStr()
    if (!dueAt || dueAt < today) throw new Error('La fecha de devolución debe ser hoy o posterior.')
    if (dueAt > addDays(today, MAX_LOAN_DAYS))
      throw new Error(`El plazo máximo es de ${MAX_LOAN_DAYS} días.`)

    const loan = { id: newId('l'), bookId, userId, lentAt: today, dueAt, returnedAt: null }
    items.value.push(loan)
    return loan
  }

  function giveBack(loanId) {
    const loan = items.value.find((l) => l.id === loanId)
    if (!loan) throw new Error('El préstamo no existe.')
    if (loan.returnedAt) throw new Error('Este libro ya fue devuelto.')
    loan.returnedAt = todayStr()
    return loan
  }

  return {
    items, active, overdue, dueSoon, newestFirst,
    isOverdue, statusOf, isAvailable, activeOfBook, bookStatus,
    ofBook, ofUser, activeOfUser, overdueOfUser,
    hasHistoryOfBook, hasHistoryOfUser, blockReason,
    lend, giveBack
  }
})
