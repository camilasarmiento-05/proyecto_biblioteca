<script setup>
import { computed, reactive, watch } from 'vue'
import { useUsersStore } from '@/stores/users'

const props = defineProps({ modelValue: Boolean, user: { type: Object, default: null } })
const emit = defineEmits(['update:modelValue', 'save'])

const users = useUsersStore()
const form = reactive({ name: '', document: '', email: '', phone: '' })
const isEdit = computed(() => !!props.user)

watch(
  () => props.modelValue,
  (open) => {
    
    if (!open) return
    Object.assign(form, {
      name: props.user?.name ?? '',
      document: props.user?.document ?? '',
      email: props.user?.email ?? '',
      phone: props.user?.phone ?? ''
    })
  }
)

const required = (msg) => (v) => !!String(v ?? '').trim() || msg
const documentRules = [
  required('Escribe el documento'),
  (v) => /^\d{5,15}$/.test(String(v).trim()) || 'Solo números, entre 5 y 15 dígitos',
  (v) => !users.documentTaken(String(v), props.user?.id) || 'Ya existe un usuario con ese documento'
]
const emailRule = (v) => !v || /^\S+@\S+\.\S+$/.test(v) || 'Escribe un correo válido'

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
          <h2 class="dialog-title">{{ isEdit ? 'Editar usuario' : 'Nuevo usuario' }}</h2>
        </q-card-section>

        <q-card-section class="q-gutter-y-md">
          <q-input v-model="form.name" outlined autofocus label="Nombre completo" :rules="[required('Escribe el nombre')]" />
          <q-input v-model="form.document" outlined inputmode="numeric" label="Documento" :rules="documentRules" />
          <q-input v-model="form.email" outlined type="email" label="Correo (opcional)" :rules="[emailRule]" />
          <q-input v-model="form.phone" outlined inputmode="tel" label="Teléfono (opcional)" />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn v-close-popup flat color="primary" label="Cancelar" />
          <q-btn unelevated color="primary" type="submit" :label="isEdit ? 'Guardar cambios' : 'Agregar usuario'" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>
