<script setup>
defineProps({
  icon: { type: String, default: 'menu_book' },
  title: { type: String, required: true },
  text: { type: String, default: '' }
})
</script>

<template>
  <div class="empty">
    <q-icon :name="icon" size="40px" />
    <h2>{{ title }}</h2>
    <p v-if="text">{{ text }}</p>
    <slot />
  </div>
</template>
