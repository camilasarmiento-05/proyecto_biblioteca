<script setup>
import { computed } from 'vue'
import { STATUS } from '@/utils/status'

const props = defineProps({ status: { type: String, required: true } })
const info = computed(() => STATUS[props.status])
</script>

<template>
  <span class="status" :class="`status--${status}`">
    <q-icon :name="info.icon" size="16px" />{{ info.label }}
  </span>
</template>
