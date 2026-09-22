<script setup>
import { computed, reactive, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  book: { type: Object, default: null },
  genres: { type: Array, default: () => [] }
})
const emit = defineEmits(['update:modelValue', 'save'])

const form = reactive({ title: '', author: '', year: '', genre: '' })
const isEdit = computed(() => !!props.book)
const thisYear = new Date().getFullYear()

// Cada vez que se abre, el formulario parte del libro (o vacío si es nuevo).
watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    Object.assign(form, {
      title: props.book?.title ?? '',
      author: props.book?.author ?? '',
      year: props.book?.year ?? '',
      genre: props.book?.genre ?? ''
    })
  }
)

const required = (msg) => (v) => !!String(v ?? '').trim() || msg
const yearRule = (v) => v === '' || v === null || (Number.isInteger(Number(v)) && v >= 1000 && v <= thisYear) || `Escribe un año entre 1000 y ${thisYear}`

function submit() {
  emit('save', { ...form })
  emit('update:modelValue', false)
}
</script>

<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card class="form-card">
      <q-form @submit="submit">
        <q-card-section>
          <h2 class="dialog-title">{{ isEdit ? 'Editar libro' : 'Nuevo libro' }}</h2>
        </q-card-section>

        <q-card-section class="q-gutter-y-md">
          <q-input v-model="form.title" outlined autofocus label="Título" :rules="[required('Escribe el título')]" />
          <q-input v-model="form.author" outlined label="Autor" :rules="[required('Escribe el autor')]" />
          <div class="row q-col-gutter-md">
            <div class="col-5">
              <q-input v-model="form.year" outlined type="number" label="Año" :rules="[yearRule]" />
            </div>
            <div class="col-7">
              <q-input v-model="form.genre" outlined label="Género" list="genre-list" :rules="[required('Escribe el género')]" />
              <datalist id="genre-list"><option v-for="g in genres" :key="g" :value="g" /></datalist>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn v-close-popup flat color="primary" label="Cancelar" />
          <q-btn unelevated color="primary" type="submit" :label="isEdit ? 'Guardar cambios' : 'Agregar libro'" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>
