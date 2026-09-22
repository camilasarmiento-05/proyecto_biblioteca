import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'dashboard', component: () => import('@/views/DashboardView.vue'), meta: { title: 'Panel' } },
  { path: '/libros', name: 'books', component: () => import('@/views/BooksView.vue'), meta: { title: 'Libros' } },
  { path: '/libros/:id', name: 'book', component: () => import('@/views/BookDetailView.vue'), meta: { title: 'Libro' } },
  { path: '/usuarios', name: 'users', component: () => import('@/views/UsersView.vue'), meta: { title: 'Usuarios' } },
  { path: '/usuarios/:id', name: 'user', component: () => import('@/views/UserDetailView.vue'), meta: { title: 'Usuario' } },
  { path: '/prestamos', name: 'loans', component: () => import('@/views/LoansView.vue'), meta: { title: 'Préstamos' } },
  { path: '/prestamos/nuevo', name: 'new-loan', component: () => import('@/views/NewLoanView.vue'), meta: { title: 'Prestar un libro' } },
  { path: '/:pathMatch(.*)*', redirect: { name: 'dashboard' } }
]

const router = createRouter({
  // Hash history: funciona al abrir el build desde cualquier servidor estático.
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.afterEach((to) => {
  document.title = `${to.meta.title ?? 'Biblioteca'} | Biblioteca`
})

export default router
