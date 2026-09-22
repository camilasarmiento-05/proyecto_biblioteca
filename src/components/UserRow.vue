<script setup>
import { computed } from 'vue'
import StatusBadge from './StatusBadge.vue'
import { useLoansStore } from '@/stores/loans'
import { MAX_LOANS_PER_USER } from '@/utils/config'
import { initials } from '@/utils/format'

const props = defineProps({ user: { type: Object, required: true } })
const emit = defineEmits(['edit', 'remove'])

const loans = useLoansStore()
const activeCount = computed(() => loans.activeOfUser(props.user.id).length)
const late = computed(() => loans.overdueOfUser(props.user.id).length)
const reason = computed(() => loans.blockReason(props.user.id))
const hasHistory = computed(() => loans.hasHistoryOfUser(props.user.id))
</script>

<template>
  <div class="row-item">
    <q-avatar color="primary" text-color="white" size="42px" font-size="15px">{{ initials(user.name) }}</q-avatar>
    <div class="row-main">
      <router-link :to="{ name: 'user', params: { id: user.id } }" class="row-title">{{ user.name }}</router-link>
      <div class="row-caption">Documento {{ user.document }}</div>
      <div v-if="user.email" class="row-caption">{{ user.email }}</div>
    </div>

    <div class="row-status">
      <span>{{ activeCount }} de {{ MAX_LOANS_PER_USER }} libros prestados</span>
      <StatusBadge v-if="late" status="overdue" />
    </div>

    <div class="row-actions">
      <q-btn unelevated color="primary" icon="output" label="Prestar" :disable="!!reason" :to="{ name: 'new-loan', query: { usuario: user.id } }">
        <q-tooltip v-if="reason">{{ reason }}</q-tooltip>
      </q-btn>
      <q-btn flat round dense icon="more_vert" aria-label="Más acciones">
        <q-menu>
          <q-list style="min-width: 180px">
            <q-item v-close-popup clickable @click="emit('edit', user)">
              <q-item-section avatar><q-icon name="edit" /></q-item-section>
              <q-item-section>Editar</q-item-section>
            </q-item>
            <q-item v-close-popup clickable :disable="hasHistory" @click="emit('remove', user)">
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
</template>
