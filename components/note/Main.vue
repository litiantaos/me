<template>
  <div class="">
    <div class="flex items-center gap-3 text-gray-400">
      <div>{{ formatDate(note.created_at) }}</div>
      <NuxtLink
        v-if="!isPage"
        :to="`/note/${note.id}`"
        class="ri-arrow-right-line sm:hover:text-blue-500"
      ></NuxtLink>
    </div>

    <div v-if="title && !isPage" class="mt-2 space-y-2">
      <h1 class="text-base font-bold">{{ title }}</h1>
      <p class="line-clamp-3 text-justify leading-7">{{ excerpt }}</p>
    </div>

    <template v-else>
      <div v-html="noteHTML" class="html-style"></div>
    </template>
  </div>
</template>

<script setup>
import { marked } from 'marked'

const props = defineProps({
  note: Object,
  isPage: Boolean,
})

const title = computed(() => {
  if (!props.note.content) return null
  const match = props.note.content.match(/^# (.+)$/m)
  return match ? match[1] : null
})

const excerpt = computed(() => {
  if (!props.note.content || !title.value) return ''
  return props.note.content.replace(/^# .+$/m, '').trim()
})

const noteHTML = computed(() => {
  if (title.value && !props.isPage) return null
  return marked(props.note.content)
})
</script>
