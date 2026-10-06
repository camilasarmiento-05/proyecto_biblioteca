<script setup>
import { computed } from 'vue'
import StatusBadge from './StatusBadge.vue'
import { useLoansStore } from '@/stores/loans'
import { MAX_LOANS_PER_USER } from '@/utils/config'
import { initials } from '@/utils/format'

const props = defineProps({ user: { type: Object, required: true } })
const emit = defineEmits(['edit', 'toggle'])

const loans = useLoansStore()
const activeCount = computed(() => loans.activeOfUser(props.user.id).length)
const late = computed(() => loans.overdueOfUser(props.user.id).length)
const reason = computed(() => loans.blockReason(props.user.id))
const inactive = computed(() => props.user.active === false)
</script>

<template>
  <div class="row-item" :class="{ 'is-inactive': inactive }">
    <q-avatar color="primary" text-color="white" size="42px" font-size="15px">{{ initials(user.name) }}</q-avatar>
    <div class="row-main">
      <router-link :to="{ name: 'user', params: { id: user.id } }" class="row-title">{{ user.name }}</router-link>
      <div class="row-caption">Documento {{ user.document }}</div>
      <div v-if="user.email" class="row-caption">{{ user.email }}</div>
    </div>

    <div class="row-status">
      <span>{{ activeCount }} de {{ MAX_LOANS_PER_USER }} libros prestados</span>
      <StatusBadge v-if="inactive" status="inactive" />
      <StatusBadge v-else-if="late" status="overdue" />
    </div>

    <div class="row-actions">
      <q-btn v-if="inactive" outline color="positive" icon="toggle_on" label="Activar" @click="emit('toggle', user)" />
      <q-btn v-else unelevated color="primary" icon="output" label="Prestar" :disable="!!reason" :to="{ name: 'new-loan', query: { usuario: user.id } }">
        <q-tooltip v-if="reason">{{ reason }}</q-tooltip>
      </q-btn>
      <q-btn v-if="!inactive && !activeCount" outline color="grey-8" icon="toggle_off" label="Desactivar" @click="emit('toggle', user)" />
      <q-btn flat round dense icon="more_vert" aria-label="Más acciones">
        <q-menu>
          <q-list style="min-width: 180px">
            <q-item v-close-popup clickable @click="emit('edit', user)">
              <q-item-section avatar><q-icon name="edit" /></q-item-section>
              <q-item-section>Editar</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
  </div>
</template>
