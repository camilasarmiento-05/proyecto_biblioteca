// Reglas del préstamo. Cambiarlas aquí las cambia en todo el sistema.
export const MAX_LOAN_DAYS = 30          // plazo máximo que se puede elegir
export const LOAN_DAYS_DEFAULT = 15      // plazo preseleccionado
// Plazos disponibles: 1, 3, 6, 9, ... hasta 30 (la fecha NO se escribe a mano).
export const LOAN_DAYS_OPTIONS = [1, ...Array.from({ length: MAX_LOAN_DAYS / 3 }, (_, i) => (i + 1) * 3)]
export const MAX_LOANS_PER_USER = 3      // libros a la vez por usuario
export const DUE_SOON_DAYS = 3           // "por vencer" = faltan este número de días o menos
