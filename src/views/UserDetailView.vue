<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import LoansTable from '@/components/LoansTable.vue'
import UserFormDialog from '@/components/UserFormDialog.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useUsersStore } from '@/stores/users'
import { useLoansStore } from '@/stores/loans'
import { MAX_LOANS_PER_USER } from '@/utils/config'
import { initials } from '@/utils/format'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const users = useUsersStore()
const loans = useLoansStore()

const user = computed(() => users.byId(route.params.id))
const active = computed(() => (user.value ? loans.activeOfUser(user.value.id) : []))
const history = computed(() => (user.value ? loans.ofUser(user.value.id) : []))
const late = computed(() => (user.value ? loans.overdueOfUser(user.value.id).length : 0))
const reason = computed(() => (user.value ? loans.blockReason(user.value.id) : null))
const dialog = ref(false)

function save(data) {
  try {
    users.update(user.value.id, data)
    $q.notify({ type: 'positive', message: 'Usuario actualizado' })
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message })
  }
}

function remove() {
  $q.dialog({
    title: 'Eliminar usuario',
    message: `¿Eliminar a ${user.value.name}? Esta acción no se puede deshacer.`,
    ok: { label: 'Eliminar', unelevated: true, color: 'negative' },
    cancel: { label: 'Cancelar', flat: true, color: 'primary' }
  }).onOk(() => {
    try {
      users.remove(user.value.id)
      $q.notify({ type: 'positive', message: 'Usuario eliminado' })
      router.replace({ name: 'users' })
    } catch (e) {
      $q.notify({ type: 'negative', message: e.message })
    }
  })
}
</script>

<template>
  <q-page class="page">
    <q-btn flat dense color="primary" icon="arrow_back" label="Usuarios" class="back-link" :to="{ name: 'users' }" />

    <EmptyState v-if="!user" icon="search_off" title="No encontramos este usuario" text="Puede que haya sido eliminado.">
      <q-btn unelevated color="primary" label="Ver todos los usuarios" :to="{ name: 'users' }" />
    </EmptyState>

    <template v-else>
      <div class="detail-head">
        <q-avatar color="primary" text-color="white" size="64px" font-size="22px">{{ initials(user.name) }}</q-avatar>
        <div class="grow">
          <h1 class="page-title">{{ user.name }}</h1>
          <div class="facts">
            <span>Documento {{ user.document }}</span>
            <span v-if="user.email">{{ user.email }}</span>
            <span v-if="user.phone">{{ user.phone }}</span>
          </div>
        </div>
        <div class="page-actions" style="align-self: flex-start">
          <q-btn unelevated color="primary" icon="output" label="Prestar" :disable="!!reason" :to="{ name: 'new-loan', query: { usuario: user.id } }" />
          <q-btn flat round icon="more_vert" aria-label="Más acciones">
            <q-menu>
              <q-list style="min-width: 180px">
                <q-item v-close-popup clickable @click="dialog = true">
                  <q-item-section avatar><q-icon name="edit" /></q-item-section>
                  <q-item-section>Editar</q-item-section>
                </q-item>
                <q-item v-close-popup clickable :disable="history.length > 0" @click="remove">
                  <q-item-section avatar><q-icon name="delete" /></q-item-section>
                  <q-item-section>
                    Eliminar
                    <q-item-label v-if="history.length" caption>Tiene historial de préstamos</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </div>

      <div class="notice" :class="late ? 'notice--late' : reason ? '' : 'notice--ok'">
        <strong>{{ active.length }} de {{ MAX_LOANS_PER_USER }} libros prestados.</strong>
        <span v-if="reason"> {{ reason }}: no puede recibir otro libro por ahora.</span>
        <span v-else> Puede llevarse {{ MAX_LOANS_PER_USER - active.length }} más.</span>
      </div>

      <h2 class="section-title">Préstamos activos</h2>
      <LoansTable :rows="active" :show-user="false" empty-text="No tiene libros prestados en este momento." />

      <h2 class="section-title">Historial</h2>
      <LoansTable v-if="history.length" :rows="history" :show-user="false" show-returned :can-return="false" />
      <div v-else class="rows">
        <EmptyState icon="history" title="Sin historial" text="Sus préstamos y devoluciones aparecerán aquí." />
      </div>

      <UserFormDialog v-model="dialog" :user="user" @save="save" />
    </template>
  </q-page>
</template>
