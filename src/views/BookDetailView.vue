<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import BookSpine from '@/components/BookSpine.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import LoansTable from '@/components/LoansTable.vue'
import BookFormDialog from '@/components/BookFormDialog.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useBooksStore } from '@/stores/books'
import { useUsersStore } from '@/stores/users'
import { useLoansStore } from '@/stores/loans'
import { useLoanActions } from '@/composables/useLoanActions'
import { dueLabel, fmtDate } from '@/utils/format'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const books = useBooksStore()
const users = useUsersStore()
const loans = useLoansStore()
const { confirmReturn } = useLoanActions()

const book = computed(() => books.byId(route.params.id))
const loan = computed(() => (book.value ? loans.activeOfBook(book.value.id) : null))
const holder = computed(() => (loan.value ? users.byId(loan.value.userId) : null))
const status = computed(() => (book.value ? loans.bookStatus(book.value.id) : 'available'))
const history = computed(() => (book.value ? loans.ofBook(book.value.id) : []))
const hasHistory = computed(() => history.value.length > 0)

const dialog = ref(false)

function save(data) {
  books.update(book.value.id, data)
  $q.notify({ type: 'positive', message: 'Libro actualizado' })
}

function remove() {
  $q.dialog({
    title: 'Eliminar libro',
    message: `¿Eliminar «${book.value.title}»? Esta acción no se puede deshacer.`,
    ok: { label: 'Eliminar', unelevated: true, color: 'negative' },
    cancel: { label: 'Cancelar', flat: true, color: 'primary' }
  }).onOk(() => {
    try {
      books.remove(book.value.id)
      $q.notify({ type: 'positive', message: 'Libro eliminado' })
      router.replace({ name: 'books' })
    } catch (e) {
      $q.notify({ type: 'negative', message: e.message })
    }
  })
}
</script>

<template>
  <q-page class="page">
    <q-btn flat dense color="primary" icon="arrow_back" label="Libros" class="back-link" :to="{ name: 'books' }" />

    <EmptyState v-if="!book" icon="search_off" title="No encontramos este libro" text="Puede que haya sido eliminado.">
      <q-btn unelevated color="primary" label="Ver todos los libros" :to="{ name: 'books' }" />
    </EmptyState>

    <template v-else>
      <div class="detail-head">
        <BookSpine :genre="book.genre" large />
        <div class="grow">
          <h1 class="page-title">{{ book.title }}</h1>
          <div>{{ book.author }}</div>
          <div class="facts">
            <span>{{ book.genre }}</span>
            <span v-if="book.year">Publicado en {{ book.year }}</span>
            <span>Prestado {{ history.length }} {{ history.length === 1 ? 'vez' : 'veces' }}</span>
          </div>
        </div>
        <div class="page-actions" style="align-self: flex-start">
          <q-btn v-if="!loan" unelevated color="primary" icon="output" label="Prestar" :to="{ name: 'new-loan', query: { libro: book.id } }" />
          <q-btn v-else outline color="primary" icon="undo" label="Devolver" @click="confirmReturn(loan)" />
          <q-btn flat round icon="more_vert" aria-label="Más acciones">
            <q-menu>
              <q-list style="min-width: 180px">
                <q-item v-close-popup clickable @click="dialog = true">
                  <q-item-section avatar><q-icon name="edit" /></q-item-section>
                  <q-item-section>Editar</q-item-section>
                </q-item>
                <q-item v-close-popup clickable :disable="hasHistory" @click="remove">
                  <q-item-section avatar><q-icon name="delete" /></q-item-section>
                  <q-item-section>
                    Eliminar
                    <q-item-label v-if="hasHistory" caption>Tiene historial de préstamos</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </div>

      <div class="notice" :class="status === 'overdue' ? 'notice--late' : status === 'available' ? 'notice--ok' : ''">
        <StatusBadge :status="status" />
        <div v-if="loan && holder" class="q-mt-sm">
          En poder de
          <router-link :to="{ name: 'user', params: { id: holder.id } }" class="link">{{ holder.name }}</router-link>
          desde el {{ fmtDate(loan.lentAt) }}. Debe devolverlo el {{ fmtDate(loan.dueAt) }}
          <span :class="{ 'text-negative': status === 'overdue' }">({{ dueLabel(loan.dueAt).toLowerCase() }}).</span>
        </div>
        <div v-else class="q-mt-sm">Está en la estantería y se puede prestar.</div>
      </div>

      <h2 class="section-title">Historial de préstamos</h2>
      <LoansTable
        v-if="history.length"
        :rows="history"
        :show-book="false"
        show-returned
        :can-return="false"
      />
      <div v-else class="rows">
        <EmptyState icon="history" title="Este libro aún no se ha prestado" text="Cuando se preste, cada salida y devolución quedará registrada aquí." />
      </div>

      <BookFormDialog v-model="dialog" :book="book" :genres="books.genres" @save="save" />
    </template>
  </q-page>
</template>
