import { addDays, todayStr } from '@/utils/format'

const ago = (n) => addDays(todayStr(), -n)

export const seedBooks = () => [
  { id: 'b1', title: 'Cien años de soledad', author: 'Gabriel García Márquez', year: 1967, genre: 'Novela' },
  { id: 'b2', title: 'El amor en los tiempos del cólera', author: 'Gabriel García Márquez', year: 1985, genre: 'Novela' },
  { id: 'b3', title: 'Rayuela', author: 'Julio Cortázar', year: 1963, genre: 'Novela' },
  { id: 'b4', title: 'La vorágine', author: 'José Eustasio Rivera', year: 1924, genre: 'Novela' },
  { id: 'b5', title: 'Pedro Páramo', author: 'Juan Rulfo', year: 1955, genre: 'Novela' },
  { id: 'b6', title: 'El coronel no tiene quien le escriba', author: 'Gabriel García Márquez', year: 1961, genre: 'Novela' },
  { id: 'b7', title: 'Ficciones', author: 'Jorge Luis Borges', year: 1944, genre: 'Cuento' },
  { id: 'b8', title: 'Crónica de una muerte anunciada', author: 'Gabriel García Márquez', year: 1981, genre: 'Novela' },
  { id: 'b9', title: 'Breve historia del tiempo', author: 'Stephen Hawking', year: 1988, genre: 'Ciencia' },
  { id: 'b10', title: 'Sapiens', author: 'Yuval Noah Harari', year: 2011, genre: 'Historia' },
  { id: 'b11', title: 'Cálculo de una variable', author: 'James Stewart', year: 2012, genre: 'Matemáticas' },
  { id: 'b12', title: 'El principito', author: 'Antoine de Saint-Exupéry', year: 1943, genre: 'Infantil' },
  { id: 'b13', title: 'Don Quijote de la Mancha', author: 'Miguel de Cervantes', year: 1605, genre: 'Clásico' },
  { id: 'b14', title: 'Clean Code', author: 'Robert C. Martin', year: 2008, genre: 'Tecnología' }
]

export const seedUsers = () => [
  { id: 'u1', name: 'Camila Rojas', document: '1098700111', email: 'camila.rojas@example.com', phone: '3001112233' },
  { id: 'u2', name: 'Juan Sebastián Ortiz', document: '1098700222', email: 'juan.ortiz@example.com', phone: '3012223344' },
  { id: 'u3', name: 'Laura Mendoza', document: '1098700333', email: 'laura.mendoza@example.com', phone: '3023334455' },
  { id: 'u4', name: 'Carlos Duarte', document: '1098700444', email: 'carlos.duarte@example.com', phone: '3034445566' },
  { id: 'u5', name: 'Valentina Gómez', document: '1098700555', email: 'valentina.gomez@example.com', phone: '3045556677' },
  { id: 'u6', name: 'Miguel Ángel Prada', document: '1098700666', email: 'miguel.prada@example.com', phone: '3056667788' }
]

// [libro, usuario, hace cuántos días se prestó, hace cuántos días se devolvió (null = sigue prestado)]
// Ordenado del más antiguo al más reciente.
const LOANS = [
  ['b1', 'u1', 120, 105],
  ['b1', 'u3', 100, 88],
  ['b2', 'u4', 90, 80],
  ['b3', 'u5', 75, 60],
  ['b1', 'u2', 60, 47],
  ['b5', 'u1', 50, 40],
  ['b7', 'u3', 45, 33],
  ['b1', 'u4', 40, 30],
  ['b9', 'u6', 40, 30],
  ['b10', 'u2', 35, 20],
  ['b12', 'u4', 30, 25],
  ['b14', 'u5', 28, 12],
  ['b3', 'u2', 20, null], // vencido
  ['b10', 'u3', 12, null], // vence en 2 días
  ['b7', 'u1', 9, null],
  ['b1', 'u6', 5, null],
  ['b14', 'u5', 3, null]
]

export const seedLoans = () =>
  LOANS.map(([bookId, userId, lent, back], i) => ({
    id: `l${i + 1}`,
    bookId,
    userId,
    lentAt: ago(lent),
    dueAt: addDays(ago(lent), 14),
    returnedAt: back == null ? null : ago(back)
  }))
