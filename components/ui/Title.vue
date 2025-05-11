<template>
  <h1 class="flex items-center gap-4 font-bold">
    <span v-if="uiTitle" class="text-2xl">
      <span class="text-blue-500 italic">Taos</span>
      <span>Life</span>
    </span>

    <span v-if="title" class="text-xl">{{ title }}</span>
  </h1>
</template>

<script setup>
const props = defineProps({
  uiTitle: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    default: '',
  },
})
</script>
