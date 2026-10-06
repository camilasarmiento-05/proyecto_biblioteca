# Biblioteca – Sistema de préstamos

Frontend con **Vue 3 + Quasar + Vue Router + Pinia** (Vite). Los datos se guardan en `localStorage`
con **pinia-plugin-persistedstate** (claves `biblioteca-books`, `biblioteca-users`, `biblioteca-loans`).

## Ejecutar

```bash
npm install
npm run dev      # desarrollo
npm run build    # producción (carpeta dist/)
```

## Cómo sabe el sistema si un libro está disponible

Un libro **no guarda** un campo "disponible". Los *préstamos* son la única fuente de verdad
(`src/stores/loans.js`): un libro está prestado si existe un préstamo suyo **sin fecha de devolución**;
si no, está disponible. Al devolver, el préstamo queda cerrado (con `returnedAt`) y se conserva como historial,
así que el estado nunca se desincroniza y siempre se puede reconstruir la historia de cada libro y de cada usuario.

## Pantallas

| Ruta | Qué se hace |
|---|---|
| `/` Panel | Estantería visual (en estante / prestado / vencido), préstamos por revisar y últimos movimientos |
| `/libros` | Catálogo con búsqueda y filtro por estado; agregar, editar, activar/desactivar, prestar y devolver (cada libro tiene serial único y observación) |
| `/libros/:id` | Estado actual del libro e **historial completo** de sus préstamos |
| `/usuarios` | Lista con búsqueda; agregar, editar, activar/desactivar y prestar |
| `/usuarios/:id` | Préstamos activos e historial del usuario |
| `/prestamos` | Activos, vencidos e historial, con búsqueda; devolver |
| `/prestamos/nuevo` | Formulario para prestar (solo ofrece libros disponibles) |

## Reglas (en `src/utils/config.js`)

- Plazo por botones: 1, 3, 6, 9 … 30 días (por defecto 15, máximo 30). La fecha no se escribe a mano.
- Máximo 3 libros a la vez por usuario.
- Un usuario con préstamos vencidos no puede recibir otro libro.
- No se eliminan libros ni usuarios: se activan/desactivan. Un libro prestado o un usuario con libros sin devolver no se puede desactivar; los inactivos no pueden prestar ni recibir préstamos.

## Estructura

```
src/
  components/   piezas reutilizables (BookRow, UserRow, LoansTable, formularios, ShelfOverview…)
  composables/  useLoanActions (devolver con confirmación)
  layouts/      MainLayout (menú lateral)
  router/       rutas
  stores/       books, users, loans (Pinia) + seed con datos de ejemplo
  utils/        config, fechas, estados, colores por género
  views/        una por pantalla
```

> Los datos persisten en el navegador. Para volver a los datos de ejemplo, borra las claves `biblioteca-*` del localStorage.
