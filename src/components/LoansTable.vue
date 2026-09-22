<script setup>
import { computed } from 'vue'
import StatusBadge from './StatusBadge.vue'
import { useBooksStore } from '@/stores/books'
import { useUsersStore } from '@/stores/users'
import { useLoansStore } from '@/stores/loans'
import { useLoanActions } from '@/composables/useLoanActions'
import { dueLabel, fmtDate } from '@/utils/format'

const props = defineProps({
  rows: { type: Array, required: true },
  showBook: { type: Boolean, default: true },
  showUser: { type: Boolean, default: true },
  showReturned: { type: Boolean, default: false },
  canReturn: { type: Boolean, default: true },
  emptyText: { type: String, default: 'No hay préstamos para mostrar.' }
})

const books = useBooksStore()
const users = useUsersStore()
const loans = useLoansStore()
const { confirmReturn } = useLoanActions()

const bookOf = (l) => books.byId(l.bookId)
const userOf = (l) => users.byId(l.userId)

const columns = computed(() =>
  [
    props.showBook && { name: 'book', label: 'Libro', align: 'left', field: (r) => bookOf(r)?.title ?? '', sortable: true },
    props.showUser && { name: 'user', label: 'Usuario', align: 'left', field: (r) => userOf(r)?.name ?? '', sortable: true },
    { name: 'lentAt', label: 'Prestado', align: 'left', field: 'lentAt', sortable: true },
    { name: 'dueAt', label: 'Vence', align: 'left', field: 'dueAt', sortable: true },
    props.showReturned && { name: 'returnedAt', label: 'Devuelto', align: 'left', field: 'returnedAt', sortable: true },
    { name: 'status', label: 'Estado', align: 'left', field: (r) => loans.statusOf(r) },
    props.canReturn && { name: 'actions', label: '', align: 'right' }
  ].filter(Boolean)
)
</script>

<template>
  <q-table
    flat
    class="loans-table"
    row-key="id"
    :rows="rows"
    :columns="columns"
    :grid="$q.screen.lt.md"
    :pagination="{ rowsPerPage: 10 }"
    :rows-per-page-options="[10, 25, 50]"
  >
    <template #body-cell-book="p">
      <q-td :props="p">
        <router-link :to="{ name: 'book', params: { id: p.row.bookId } }" class="link">{{ bookOf(p.row)?.title }}</router-link>
        <div class="row-caption">{{ bookOf(p.row)?.author }}</div>
      </q-td>
    </template>
    <template #body-cell-user="p">
      <q-td :props="p">
        <router-link :to="{ name: 'user', params: { id: p.row.userId } }" class="link">{{ userOf(p.row)?.name }}</router-link>
      </q-td>
    </template>
    <template #body-cell-lentAt="p"><q-td :props="p">{{ fmtDate(p.row.lentAt) }}</q-td></template>
    <template #body-cell-dueAt="p">
      <q-td :props="p">
        {{ fmtDate(p.row.dueAt) }}
        <div v-if="!p.row.returnedAt" class="row-caption" :class="{ 'text-negative': loans.isOverdue(p.row) }">{{ dueLabel(p.row.dueAt) }}</div>
      </q-td>
    </template>
    <template #body-cell-returnedAt="p"><q-td :props="p">{{ fmtDate(p.row.returnedAt) }}</q-td></template>
    <template #body-cell-status="p"><q-td :props="p"><StatusBadge :status="p.value" /></q-td></template>
    <template #body-cell-actions="p">
      <q-td :props="p">
        <q-btn v-if="!p.row.returnedAt" flat dense color="primary" icon="undo" label="Devolver" @click="confirmReturn(p.row)" />
      </q-td>
    </template>

    <!-- En pantallas pequeñas la tabla se convierte en tarjetas -->
    <template #item="p">
      <div class="col-12 col-sm-6 q-pa-xs">
        <q-card flat bordered>
          <q-card-section>
            <div class="row no-wrap items-start justify-between q-gutter-x-sm">
              <div>
                <router-link v-if="showBook" :to="{ name: 'book', params: { id: p.row.bookId } }" class="link">{{ bookOf(p.row)?.title }}</router-link>
                <div v-if="showUser">
                  <router-link :to="{ name: 'user', params: { id: p.row.userId } }" :class="showBook ? 'row-caption' : 'link'">{{ userOf(p.row)?.name }}</router-link>
                </div>
              </div>
              <StatusBadge :status="loans.statusOf(p.row)" />
            </div>
            <div class="row-caption q-mt-sm">
              Prestado {{ fmtDate(p.row.lentAt) }}, vence {{ fmtDate(p.row.dueAt) }}<template v-if="p.row.returnedAt">, devuelto {{ fmtDate(p.row.returnedAt) }}</template>
            </div>
            <div v-if="!p.row.returnedAt" class="row-caption" :class="{ 'text-negative': loans.isOverdue(p.row) }">{{ dueLabel(p.row.dueAt) }}</div>
          </q-card-section>
          <q-card-actions v-if="canReturn && !p.row.returnedAt">
            <q-btn flat color="primary" icon="undo" label="Devolver" @click="confirmReturn(p.row)" />
          </q-card-actions>
        </q-card>
      </div>
    </template>

    <template #no-data>
      <div class="full-width text-center q-pa-lg muted">{{ emptyText }}</div>
    </template>
  </q-table>
</template>
