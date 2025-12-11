<template>
  <div
    v-if="text"
    :class="[
      'w-full rounded-md p-3 text-xs',
      type === 'success'
        ? 'bg-green-50 text-green-500 dark:bg-green-500/10 dark:text-green-400'
        : 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400',
    ]"
  >
    {{ text }}
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'error',
    validator: (value) => ['success', 'error'].includes(value),
  },
  text: {
    type: String,
    default: '',
  },
})
</script>
