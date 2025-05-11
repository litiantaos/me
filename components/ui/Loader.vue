<template>
  <div class="flex items-center">
    <i :class="['ri-loader-4-line animate-spin', size]"></i>
  </div>
</template>

<script setup>
const props = defineProps({
  size: {
    type: String,
    default: 'text-lg',
  },
})
</script>
