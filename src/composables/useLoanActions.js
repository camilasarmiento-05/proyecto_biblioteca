import { useQuasar } from 'quasar'
import { useLoansStore } from '@/stores/loans'
import { useBooksStore } from '@/stores/books'
import { useUsersStore } from '@/stores/users'

/** Acciones sobre préstamos con confirmación y aviso, reutilizables en cualquier pantalla. */
export function useLoanActions() {
  const $q = useQuasar()
  const loans = useLoansStore()
  const books = useBooksStore()
  const users = useUsersStore()

  function confirmReturn(loan) {
    const book = books.byId(loan.bookId)
    const user = users.byId(loan.userId)
    $q.dialog({
      title: 'Devolver libro',
      message: `¿Confirmas la devolución de «${book?.title}»${user ? ` por parte de ${user.name}` : ''}?`,
      ok: { label: 'Devolver', unelevated: true, color: 'primary' },
      cancel: { label: 'Cancelar', flat: true, color: 'primary' }
    }).onOk(() => {
      try {
        loans.giveBack(loan.id)
        $q.notify({ type: 'positive', message: `Libro devuelto: «${book?.title}»` })
      } catch (e) {
        $q.notify({ type: 'negative', message: e.message })
      }
    })
  }

  return { confirmReturn }
}
