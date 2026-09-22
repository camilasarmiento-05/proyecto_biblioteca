<script setup>
import { computed } from 'vue'
import BookSpine from './BookSpine.vue'
import StatusBadge from './StatusBadge.vue'
import { useLoansStore } from '@/stores/loans'
import { useUsersStore } from '@/stores/users'
import { useLoanActions } from '@/composables/useLoanActions'
import { dueLabel } from '@/utils/format'

const props = defineProps({ book: { type: Object, required: true } })
const emit = defineEmits(['edit', 'remove'])

const loans = useLoansStore()
const users = useUsersStore()
const { confirmReturn } = useLoanActions()

const loan = computed(() => loans.activeOfBook(props.book.id))
const status = computed(() => loans.bookStatus(props.book.id))
const holder = computed(() => (loan.value ? users.byId(loan.value.userId) : null))
const hasHistory = computed(() => loans.hasHistoryOfBook(props.book.id))
</script>

<template>
  <div class="row-item">
    <BookSpine :genre="book.genre" />
    <div class="row-main">
      <router-link :to="{ name: 'book', params: { id: book.id } }" class="row-title">{{ book.title }}</router-link>
      <div>{{ book.author }}</div>
      <div class="row-caption">{{ book.genre }}<template v-if="book.year">, {{ book.year }}</template></div>
    </div>

    <div class="row-status">
      <StatusBadge :status="status" />
      <template v-if="loan">
        <router-link v-if="holder" :to="{ name: 'user', params: { id: holder.id } }" class="link">{{ holder.name }}</router-link>
        <span class="row-caption" :class="{ 'text-negative': status === 'overdue' }">{{ dueLabel(loan.dueAt) }}</span>
      </template>
    </div>

    <div class="row-actions">
      <q-btn v-if="!loan" unelevated color="primary" icon="output" label="Prestar" :to="{ name: 'new-loan', query: { libro: book.id } }" />
      <q-btn v-else outline color="primary" icon="undo" label="Devolver" @click="confirmReturn(loan)" />
      <q-btn flat round dense icon="more_vert" aria-label="Más acciones">
        <q-menu>
          <q-list style="min-width: 180px">
            <q-item v-close-popup clickable @click="emit('edit', book)">
              <q-item-section avatar><q-icon name="edit" /></q-item-section>
              <q-item-section>Editar</q-item-section>
            </q-item>
            <q-item v-close-popup clickable :disable="hasHistory" @click="emit('remove', book)">
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
