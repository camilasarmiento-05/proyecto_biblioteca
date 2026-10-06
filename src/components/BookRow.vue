<script setup>
import { computed } from 'vue'
import BookSpine from './BookSpine.vue'
import StatusBadge from './StatusBadge.vue'
import { useLoansStore } from '@/stores/loans'
import { useUsersStore } from '@/stores/users'
import { useLoanActions } from '@/composables/useLoanActions'
import { dueLabel } from '@/utils/format'

const props = defineProps({ book: { type: Object, required: true } })
const emit = defineEmits(['edit', 'toggle'])

const loans = useLoansStore()
const users = useUsersStore()
const { confirmReturn } = useLoanActions()

const loan = computed(() => loans.activeOfBook(props.book.id))
const status = computed(() => loans.bookStatus(props.book.id))
const holder = computed(() => (loan.value ? users.byId(loan.value.userId) : null))
const inactive = computed(() => props.book.active === false)
</script>

<template>
  <div class="row-item" :class="{ 'is-inactive': inactive }">
    <BookSpine :genre="book.genre" />
    <div class="row-main">
      <router-link :to="{ name: 'book', params: { id: book.id } }" class="row-title">{{ book.title }}</router-link>
      <div>{{ book.author }}</div>
      <div class="row-caption">{{ book.genre }}<template v-if="book.year">, {{ book.year }}</template></div>
      <div class="row-caption">Serial: <span class="serial">{{ book.serial }}</span></div>
      <div v-if="book.description" class="row-desc">{{ book.description }}</div>
    </div>

    <div class="row-status">
      <StatusBadge :status="status" />
      <template v-if="loan">
        <router-link v-if="holder" :to="{ name: 'user', params: { id: holder.id } }" class="link">{{ holder.name }}</router-link>
        <span class="row-caption" :class="{ 'text-negative': status === 'overdue' }">{{ dueLabel(loan.dueAt) }}</span>
      </template>
    </div>

    <div class="row-actions">
      <q-btn v-if="inactive" outline color="positive" icon="toggle_on" label="Activar" @click="emit('toggle', book)" />
      <q-btn v-else-if="!loan" unelevated color="primary" icon="output" label="Prestar" :to="{ name: 'new-loan', query: { libro: book.id } }" />
      <q-btn v-else outline color="primary" icon="undo" label="Devolver" @click="confirmReturn(loan)" />
      <q-btn v-if="!inactive && !loan" outline color="grey-8" icon="toggle_off" label="Desactivar" @click="emit('toggle', book)" />
      <q-btn flat round dense icon="more_vert" aria-label="Más acciones">
        <q-menu>
          <q-list style="min-width: 180px">
            <q-item v-close-popup clickable @click="emit('edit', book)">
              <q-item-section avatar><q-icon name="edit" /></q-item-section>
              <q-item-section>Editar</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
  </div>
</template>
