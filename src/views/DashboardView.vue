<script setup>
import { computed } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import ShelfOverview from '@/components/ShelfOverview.vue'
import LoansTable from '@/components/LoansTable.vue'
import { useBooksStore } from '@/stores/books'
import { useUsersStore } from '@/stores/users'
import { useLoansStore } from '@/stores/loans'
import { fmtDate } from '@/utils/format'

const books = useBooksStore()
const users = useUsersStore()
const loans = useLoansStore()

const today = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

// Lo que requiere atención: vencidos primero, luego los que vencen pronto.
const attention = computed(() =>
  [...loans.overdue, ...loans.dueSoon].sort((a, b) => a.dueAt.localeCompare(b.dueAt))
)

// Movimientos recientes = cada préstamo genera una salida y, si ya volvió, una devolución.
const activity = computed(() => {
  const events = []
  for (const loan of loans.items) {
    events.push({ key: `out-${loan.id}`, type: 'out', date: loan.lentAt, loan })
    if (loan.returnedAt) events.push({ key: `in-${loan.id}`, type: 'in', date: loan.returnedAt, loan })
  }
  return events.reverse().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8)
})
</script>

<template>
  <q-page class="page">
    <section class="library-banner">
      <div class="library-banner__text">
        <span class="library-banner__eyebrow">Panel</span>
        <h1 class="library-banner__title">Biblioteca</h1>
        <p class="library-banner__subtitle">Todo el catálogo, los préstamos y las personas lectoras, en un mismo lugar.</p>
      </div>
      <div class="library-banner__shelf" aria-hidden="true">
        <span class="banner-spine" style="--h: 55%; --c: #7b2d3b;"></span>
        <span class="banner-spine" style="--h: 82%; --c: #b8862b;"></span>
        <span class="banner-spine" style="--h: 66%; --c: #2f5f7f;"></span>
        <span class="banner-spine" style="--h: 92%; --c: #f3f5f3;"></span>
        <span class="banner-spine" style="--h: 60%; --c: #2b6b57;"></span>
        <span class="banner-spine" style="--h: 75%; --c: #8a5a2c;"></span>
        <span class="banner-spine" style="--h: 46%; --c: #c0692b;"></span>
        <span class="banner-spine" style="--h: 88%; --c: #4b427f;"></span>
      </div>
    </section>

    <PageHeader title="Hoy en la biblioteca" :subtitle="today">
      <template #actions>
        <q-btn unelevated color="primary" icon="add" label="Prestar un libro" :to="{ name: 'new-loan' }" />
      </template>
    </PageHeader>

    <ShelfOverview />

    <div class="row q-col-gutter-lg">
      <div class="col-12">
        <h2 class="section-title">Para revisar</h2>
        <LoansTable :rows="attention" empty-text="Ningún préstamo vence en los próximos días." />
      </div>

      <div class="col-12">
        <h2 class="section-title">Últimos movimientos</h2>
        <q-list class="activity">
          <q-item v-for="e in activity" :key="e.key">
            <q-item-section avatar>
              <q-icon :name="e.type === 'out' ? 'output' : 'undo'" :color="e.type === 'out' ? 'secondary' : 'positive'" />
            </q-item-section>
            <q-item-section>
              <q-item-label>
                <router-link :to="{ name: 'book', params: { id: e.loan.bookId } }" class="link">{{ books.byId(e.loan.bookId)?.title }}</router-link>
              </q-item-label>
              <q-item-label caption>
                {{ e.type === 'out' ? 'Prestado a' : 'Devuelto por' }} {{ users.byId(e.loan.userId)?.name }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>{{ fmtDate(e.date) }}</q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </q-page>
</template>
