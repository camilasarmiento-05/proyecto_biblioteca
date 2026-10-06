<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import PageHeader from '@/components/PageHeader.vue'
import BookRow from '@/components/BookRow.vue'
import BookFormDialog from '@/components/BookFormDialog.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useBooksStore } from '@/stores/books'
import { useLoansStore } from '@/stores/loans'
import { normalize } from '@/utils/format'

const $q = useQuasar()
const route = useRoute()
const books = useBooksStore()
const loans = useLoansStore()

const search = ref('')
const status = ref(['available', 'lent', 'inactive'].includes(route.query.estado) ? route.query.estado : 'all')
const dialog = ref(false)
const editing = ref(null)

const availableCount = computed(() => books.activeItems.filter((b) => loans.isAvailable(b.id)).length)
const inactiveCount = computed(() => books.total - books.activeTotal)

const rows = computed(() => {
  const term = normalize(search.value)
  return books.items
    .filter((b) => !term || normalize(`${b.title} ${b.author} ${b.genre} ${b.serial} ${b.description}`).includes(term))
    .filter((b) => {
      const inactive = b.active === false
      if (status.value === 'all') return true
      if (status.value === 'inactive') return inactive
      return !inactive && (status.value === 'available') === loans.isAvailable(b.id)
    })
    .sort((a, b) => a.title.localeCompare(b.title, 'es'))
})

const statusOptions = computed(() => [
  { value: 'all', label: `Todos (${books.total})` },
  { value: 'available', label: `Disponibles (${availableCount.value})` },
  { value: 'lent', label: `Prestados (${books.activeTotal - availableCount.value})` },
  { value: 'inactive', label: `Inactivos (${inactiveCount.value})` }
])

function openNew() { editing.value = null; dialog.value = true }
function openEdit(book) { editing.value = book; dialog.value = true }

function save(data) {
  try {
    if (editing.value) {
      books.update(editing.value.id, data)
      $q.notify({ type: 'positive', message: 'Libro actualizado' })
    } else {
      books.add(data)
      $q.notify({ type: 'positive', message: `Libro agregado: «${data.title.trim()}»` })
    }
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message })
  }
}

function toggle(book) {
  const activating = book.active === false
  $q.dialog({
    title: activating ? 'Activar libro' : 'Desactivar libro',
    message: activating
      ? `¿Activar «${book.title}»? Volverá a estar disponible para prestar.`
      : `¿Desactivar «${book.title}»? No se podrá prestar hasta que lo actives de nuevo.`,
    ok: { label: activating ? 'Activar' : 'Desactivar', unelevated: true, color: activating ? 'positive' : 'primary' },
    cancel: { label: 'Cancelar', flat: true, color: 'primary' }
  }).onOk(() => {
    try {
      books.toggleActive(book.id)
      $q.notify({ type: 'positive', message: activating ? 'Libro activado' : 'Libro desactivado' })
    } catch (e) {
      $q.notify({ type: 'negative', message: e.message })
    }
  })
}

function clearFilters() { search.value = ''; status.value = 'all' }
</script>

<template>
  <q-page class="page">
    <PageHeader title="Libros" :subtitle="`${books.total} títulos en el catálogo`">
      <template #actions>
        <q-btn unelevated color="primary" icon="add" label="Agregar libro" @click="openNew" />
      </template>
    </PageHeader>

    <div class="toolbar">
      <q-input v-model="search" class="search" outlined dense clearable placeholder="Buscar por título, autor, género o serial" aria-label="Buscar libros">
        <template #prepend><q-icon name="search" /></template>
      </q-input>
      <q-btn-toggle v-model="status" unelevated toggle-color="primary" color="white" text-color="primary" :options="statusOptions" />
    </div>

    <div v-if="rows.length" class="rows">
      <BookRow v-for="b in rows" :key="b.id" :book="b" @edit="openEdit" @toggle="toggle" />
    </div>
    <div v-else class="rows">
      <EmptyState
        v-if="books.total"
        icon="search_off"
        title="Ningún libro coincide"
        text="Prueba con otra búsqueda o quita los filtros."
      >
        <q-btn flat color="primary" label="Quitar filtros" @click="clearFilters" />
      </EmptyState>
      <EmptyState v-else title="Aún no hay libros" text="Agrega el primero para empezar a prestar.">
        <q-btn unelevated color="primary" icon="add" label="Agregar libro" @click="openNew" />
      </EmptyState>
    </div>

    <BookFormDialog v-model="dialog" :book="editing" :genres="books.genres" @save="save" />
  </q-page>
</template>
