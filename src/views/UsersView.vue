<script setup>
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import PageHeader from '@/components/PageHeader.vue'
import UserRow from '@/components/UserRow.vue'
import UserFormDialog from '@/components/UserFormDialog.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useUsersStore } from '@/stores/users'
import { normalize } from '@/utils/format'

const $q = useQuasar()
const users = useUsersStore()

const search = ref('')
const dialog = ref(false)
const editing = ref(null)

const rows = computed(() => {
  const term = normalize(search.value)
  return users.items
    .filter((u) => !term || normalize(`${u.name} ${u.document} ${u.email}`).includes(term))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))
})

function openNew() { editing.value = null; dialog.value = true }
function openEdit(user) { editing.value = user; dialog.value = true }

function save(data) {
  try {
    if (editing.value) {
      users.update(editing.value.id, data)
      $q.notify({ type: 'positive', message: 'Usuario actualizado' })
    } else {
      users.add(data)
      $q.notify({ type: 'positive', message: `Usuario agregado: ${data.name.trim()}` })
    }
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message })
  }
}

function remove(user) {
  $q.dialog({
    title: 'Eliminar usuario',
    message: `¿Eliminar a ${user.name}? Esta acción no se puede deshacer.`,
    ok: { label: 'Eliminar', unelevated: true, color: 'negative' },
    cancel: { label: 'Cancelar', flat: true, color: 'primary' }
  }).onOk(() => {
    try {
      users.remove(user.id)
      $q.notify({ type: 'positive', message: 'Usuario eliminado' })
    } catch (e) {
      $q.notify({ type: 'negative', message: e.message })
    }
  })
}
</script>

<template>
  <q-page class="page">
    <PageHeader title="Usuarios" :subtitle="`${users.items.length} personas registradas`">
      <template #actions>
        <q-btn unelevated color="primary" icon="person_add" label="Agregar usuario" @click="openNew" />
      </template>
    </PageHeader>

    <div class="toolbar">
      <q-input v-model="search" class="search" outlined dense clearable placeholder="Buscar por nombre, documento o correo" aria-label="Buscar usuarios">
        <template #prepend><q-icon name="search" /></template>
      </q-input>
    </div>

    <div class="rows">
      <template v-if="rows.length">
        <UserRow v-for="u in rows" :key="u.id" :user="u" @edit="openEdit" @remove="remove" />
      </template>
      <EmptyState v-else-if="users.items.length" icon="search_off" title="Ningún usuario coincide" text="Prueba con otro nombre o documento." />
      <EmptyState v-else icon="group" title="Aún no hay usuarios" text="Agrega el primero para poder prestarle libros.">
        <q-btn unelevated color="primary" icon="person_add" label="Agregar usuario" @click="openNew" />
      </EmptyState>
    </div>

    <UserFormDialog v-model="dialog" :user="editing" @save="save" />
  </q-page>
</template>
