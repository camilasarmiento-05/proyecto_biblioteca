<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useLoansStore } from '@/stores/loans'

const $q = useQuasar()
const loans = useLoansStore()
const drawer = ref(false)

const nav = [
  { to: { name: 'dashboard' }, icon: 'space_dashboard', label: 'Panel', exact: true },
  { to: { name: 'books' }, icon: 'menu_book', label: 'Libros' },
  { to: { name: 'users' }, icon: 'group', label: 'Usuarios' },
  { to: { name: 'loans' }, icon: 'swap_horiz', label: 'Préstamos', alert: true }
]

// En móvil el menú es un panel superpuesto: se cierra al elegir una opción.
const closeOnMobile = () => { if ($q.screen.lt.md) drawer.value = false }
</script>

<template>
  <q-layout view="hHh LpR lFf">
    <q-header class="mobile-bar">
      <q-toolbar>
        <q-btn flat round dense icon="menu" aria-label="Abrir menú" @click="drawer = !drawer" />
        <q-toolbar-title class="header-title">Biblioteca</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawer" behavior="mobile" :width="250" class="side-nav">
      <div class="brand">
        <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
          <rect x="4" y="8" width="7" height="22" rx="1.5" fill="#b8862b" />
          <rect x="13" y="4" width="7" height="26" rx="1.5" fill="#f3f5f3" />
          <rect x="22" y="10" width="7" height="20" rx="1.5" fill="#7b2d3b" transform="rotate(8 25 30)" />
        </svg>
        <div>
          <div class="brand-name">Biblioteca</div>
          <div class="brand-sub">Control de préstamos</div>
        </div>
      </div>

      <q-btn class="side-cta" unelevated color="secondary" text-color="dark" icon="add" label="Prestar un libro" :to="{ name: 'new-loan' }" @click="closeOnMobile" />

      <q-list class="side-list">
        <q-item
          v-for="n in nav"
          :key="n.label"
          v-ripple
          clickable
          :to="n.to"
          :exact="n.exact"
          active-class="side-active"
          @click="closeOnMobile"
        >
          <q-item-section avatar><q-icon :name="n.icon" /></q-item-section>
          <q-item-section>{{ n.label }}</q-item-section>
          <q-item-section v-if="n.alert && loans.overdue.length" side>
            <q-badge color="negative" :label="loans.overdue.length" :aria-label="`${loans.overdue.length} préstamos vencidos`" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
