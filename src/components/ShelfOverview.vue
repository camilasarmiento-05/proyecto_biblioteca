<script setup>
import { computed } from 'vue'
import { useBooksStore } from '@/stores/books'
import { useLoansStore } from '@/stores/loans'
import { STATUS } from '@/utils/status'
import { genreColor, spineHeight } from '@/utils/genres'

const books = useBooksStore()
const loans = useLoansStore()

// Ordenados por género y título, como en una estantería real.
const shelf = computed(() =>
  [...books.activeItems]
    .sort((a, b) => a.genre.localeCompare(b.genre, 'es') || a.title.localeCompare(b.title, 'es'))
    .map((book) => ({ book, status: loans.bookStatus(book.id) }))
)

const onShelf = computed(() => books.activeTotal - loans.active.length)
const lentOnTime = computed(() => loans.active.length - loans.overdue.length)
</script>

<template>
  <div class="shelf-card">
    <div class="shelf" role="list" aria-label="Estantería con el estado de cada libro">
      <router-link
        v-for="{ book, status } in shelf"
        :key="book.id"
        role="listitem"
        class="shelf-slot"
        :class="`is-${status}`"
        :style="{ height: spineHeight(book.id) + 'px', '--c': genreColor(book.genre) }"
        :to="{ name: 'book', params: { id: book.id } }"
        :aria-label="`${book.title}: ${STATUS[status].label}`"
      >
        <q-tooltip>{{ book.title }}: {{ STATUS[status].label.toLowerCase() }}</q-tooltip>
      </router-link>
    </div>

    <ul class="shelf-legend">
      <li>
        <router-link :to="{ name: 'books', query: { estado: 'available' } }">
          <span class="swatch swatch--ok" /><span><strong>{{ onShelf }}</strong> en la estantería</span>
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'books', query: { estado: 'lent' } }">
          <span class="swatch swatch--lent" /><span><strong>{{ lentOnTime }}</strong> prestados a tiempo</span>
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'loans', query: { tab: 'overdue' } }">
          <span class="swatch swatch--late" /><span><strong>{{ loans.overdue.length }}</strong> con retraso</span>
        </router-link>
      </li>
    </ul>
  </div>
</template>
