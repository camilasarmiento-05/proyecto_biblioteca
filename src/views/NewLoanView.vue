<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import PageHeader from '@/components/PageHeader.vue'
import { useBooksStore } from '@/stores/books'
import { useUsersStore } from '@/stores/users'
import { useLoansStore } from '@/stores/loans'
import { LOAN_DAYS_DEFAULT, LOAN_DAYS_OPTIONS, MAX_LOAN_DAYS, MAX_LOANS_PER_USER } from '@/utils/config'
import { addDays, fmtDate, normalize, todayStr } from '@/utils/format'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const books = useBooksStore()
const users = useUsersStore()
const loans = useLoansStore()

const today = todayStr()

const toUserOpt = (u) => {
  const reason = loans.blockReason(u.id)
  return { value: u.id, label: u.name, document: u.document, reason, disable: !!reason }
}
const toBookOpt = (b) => ({ value: b.id, label: b.title, author: b.author })

// Si llegamos desde un libro o un usuario, el campo ya viene elegido (solo si es válido).
const preUser = users.byId(route.query.usuario)
const preBook = books.byId(route.query.libro)
const form = reactive({
  user: preUser && !loans.blockReason(preUser.id) ? toUserOpt(preUser) : null,
  book: preBook && preBook.active !== false && loans.isAvailable(preBook.id) ? toBookOpt(preBook) : null,
  days: LOAN_DAYS_DEFAULT
})
const dueAt = computed(() => addDays(today, form.days))

// Solo se ofrecen los libros que están disponibles; los usuarios bloqueados salen deshabilitados con su motivo.
const userTerm = ref('')
const bookTerm = ref('')
const userOptions = computed(() =>
  users.items
    .filter((u) => u.active !== false)
    .filter((u) => normalize(`${u.name} ${u.document}`).includes(normalize(userTerm.value)))
    .map(toUserOpt)
    .sort((a, b) => a.label.localeCompare(b.label, 'es'))
)
const bookOptions = computed(() =>
  books.items
    .filter((b) => b.active !== false && loans.isAvailable(b.id) && normalize(`${b.title} ${b.author}`).includes(normalize(bookTerm.value)))
    .map(toBookOpt)
    .sort((a, b) => a.label.localeCompare(b.label, 'es'))
)
const filterUsers = (val, update) => update(() => { userTerm.value = val })
const filterBooks = (val, update) => update(() => { bookTerm.value = val })

const userLoansCount = computed(() => (form.user ? loans.activeOfUser(form.user.value).length : 0))

function submit() {
  try {
    loans.lend({ bookId: form.book.value, userId: form.user.value, days: form.days })
    $q.notify({ type: 'positive', message: `«${form.book.label}» prestado a ${form.user.label}` })
    router.push({ name: 'loans' })
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message })
  }
}
</script>

<template>
  <q-page class="page">
    <q-btn flat dense color="primary" icon="arrow_back" label="Préstamos" class="back-link" :to="{ name: 'loans' }" />
    <PageHeader title="Prestar un libro" subtitle="Elige quién se lo lleva y cuándo debe devolverlo" />

    <div class="loan-layout">
      <q-form class="q-gutter-y-md" @submit="submit">
        <q-select
          v-model="form.user"
          outlined
          use-input
          input-debounce="0"
          label="Usuario"
          hint="Busca por nombre o documento"
          :options="userOptions"
          :rules="[(v) => !!v || 'Elige un usuario']"
          @filter="filterUsers"
        >
          <template #option="{ itemProps, opt }">
            <q-item v-bind="itemProps">
              <q-item-section>
                <q-item-label>{{ opt.label }}</q-item-label>
                <q-item-label caption :class="{ 'text-negative': opt.reason }">{{ opt.reason ?? `Documento ${opt.document}` }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
          <template #no-option><q-item><q-item-section class="muted">Sin resultados</q-item-section></q-item></template>
        </q-select>

        <q-select
          v-model="form.book"
          outlined
          use-input
          input-debounce="0"
          label="Libro"
          hint="Solo aparecen los libros disponibles"
          :options="bookOptions"
          :rules="[(v) => !!v || 'Elige un libro']"
          @filter="filterBooks"
        >
          <template #option="{ itemProps, opt }">
            <q-item v-bind="itemProps">
              <q-item-section>
                <q-item-label>{{ opt.label }}</q-item-label>
                <q-item-label caption>{{ opt.author }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
          <template #no-option><q-item><q-item-section class="muted">No hay libros disponibles con ese nombre</q-item-section></q-item></template>
        </q-select>

        <div>
          <div class="text-subtitle2 q-mb-xs">Días de préstamo</div>
          <div class="days-picker" role="radiogroup" aria-label="Días de préstamo">
            <q-btn
              v-for="d in LOAN_DAYS_OPTIONS"
              :key="d"
              dense
              no-caps
              color="primary"
              :unelevated="form.days === d"
              :outline="form.days !== d"
              :label="`${d} ${d === 1 ? 'día' : 'días'}`"
              role="radio"
              :aria-checked="form.days === d"
              @click="form.days = d"
            />
          </div>
          <div class="muted q-mt-sm">Fecha de devolución: <strong>{{ fmtDate(dueAt) }}</strong></div>
        </div>

        <div class="row q-gutter-sm q-pt-sm">
          <q-btn unelevated color="primary" type="submit" icon="output" label="Prestar libro" />
          <q-btn flat color="primary" label="Cancelar" :to="{ name: 'loans' }" />
        </div>
      </q-form>

      <aside class="summary" aria-live="polite">
        <h2>Resumen</h2>
        <dl v-if="form.user || form.book">
          <template v-if="form.book">
            <dt>Libro</dt>
            <dd>{{ form.book.label }}</dd>
          </template>
          <template v-if="form.user">
            <dt>Usuario</dt>
            <dd>{{ form.user.label }}</dd>
            <dt>Después de este préstamo tendrá</dt>
            <dd>{{ userLoansCount + 1 }} de {{ MAX_LOANS_PER_USER }} libros</dd>
          </template>
          <dt>Devuelve el</dt>
          <dd>{{ fmtDate(dueAt) }} ({{ form.days }} {{ form.days === 1 ? 'día' : 'días' }})</dd>
        </dl>
        <p v-else class="muted q-mb-none">Aquí verás el resumen cuando elijas un libro y un usuario.</p>

        <ul class="rules">
          <li>Plazo habitual: {{ LOAN_DAYS_DEFAULT }} días, máximo {{ MAX_LOAN_DAYS }} (se elige con los botones).</li>
          <li>Cada usuario puede tener hasta {{ MAX_LOANS_PER_USER }} libros a la vez.</li>
          <li>Los libros o usuarios inactivos no aparecen para prestar.</li>
          <li>Quien tenga un préstamo vencido no puede llevarse otro libro.</li>
        </ul>
      </aside>
    </div>
  </q-page>
</template>
