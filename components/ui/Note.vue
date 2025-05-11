<template>
  <div class="space-y-2">
    <div class="text-gray-400">{{ formatDate(note.created_at) }}</div>
    <div v-html="noteHTML" class="html-style"></div>
  </div>
</template>

<script setup>
import { marked } from 'marked'

const props = defineProps({
  note: Object,
})

const noteHTML = computed(() => {
  return marked(props.note.content)
})
</script>
