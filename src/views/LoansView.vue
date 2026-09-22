<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import LoansTable from '@/components/LoansTable.vue'
import { useBooksStore } from '@/stores/books'
import { useUsersStore } from '@/stores/users'
import { useLoansStore } from '@/stores/loans'
import { normalize } from '@/utils/format'

const route = useRoute()
const books = useBooksStore()
const users = useUsersStore()
const loans = useLoansStore()

const tab = ref(['active', 'overdue', 'history'].includes(route.query.tab) ? route.query.tab : 'active')
const search = ref('')

const byDueDate = (list) => [...list].sort((a, b) => a.dueAt.localeCompare(b.dueAt))

const source = computed(() => {
  if (tab.value === 'overdue') return byDueDate(loans.overdue)
  if (tab.value === 'history') return loans.newestFirst
  return byDueDate(loans.active)
})

const rows = computed(() => {
  const term = normalize(search.value)
  if (!term) return source.value
  return source.value.filter((l) =>
    normalize(`${books.byId(l.bookId)?.title} ${users.byId(l.userId)?.name}`).includes(term)
  )
})

const emptyText = computed(() => {
  if (search.value) return 'Ningún préstamo coincide con la búsqueda.'
  if (tab.value === 'overdue') return 'No hay préstamos vencidos.'
  if (tab.value === 'history') return 'Todavía no se ha registrado ningún préstamo.'
  return 'No hay libros prestados en este momento.'
})
</script>

<template>
  <q-page class="page">
    <PageHeader title="Préstamos" subtitle="Lo que está afuera ahora y todo lo que ha pasado">
      <template #actions>
        <q-btn unelevated color="primary" icon="add" label="Prestar un libro" :to="{ name: 'new-loan' }" />
      </template>
    </PageHeader>

    <q-tabs v-model="tab" dense align="left" active-color="primary" indicator-color="secondary" class="q-mb-md">
      <q-tab name="active" :label="`Activos (${loans.active.length})`" />
      <q-tab name="overdue" :label="`Vencidos (${loans.overdue.length})`" />
      <q-tab name="history" :label="`Historial (${loans.items.length})`" />
    </q-tabs>

    <div class="toolbar">
      <q-input v-model="search" class="search" outlined dense clearable placeholder="Buscar por libro o usuario" aria-label="Buscar préstamos">
        <template #prepend><q-icon name="search" /></template>
      </q-input>
    </div>

    <LoansTable :rows="rows" :show-returned="tab === 'history'" :empty-text="emptyText" />
  </q-page>
</template>
