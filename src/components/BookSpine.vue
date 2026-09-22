<script setup>
import { genreColor } from '@/utils/genres'
defineProps({ genre: { type: String, default: '' }, large: Boolean })
</script>

<template>
  <span class="spine" :class="{ 'spine--lg': large }" :style="{ '--c': genreColor(genre) }" aria-hidden="true" />
</template>
