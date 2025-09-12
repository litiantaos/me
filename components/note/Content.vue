<template>
  <div>
    <div class="flex h-6 items-center gap-3 text-zinc-400">
      <ClientOnly>
        <div>{{ formatDate(note.created_at) }}</div>
        <NuxtLink
          v-if="!isPage"
          :to="`/note/${note.id}`"
          class="ri-arrow-right-line sm:hover:text-blue-500"
        ></NuxtLink>
      </ClientOnly>
    </div>

    <div v-if="title && !isPage" class="mt-3 space-y-2">
      <p class="text-lg font-bold">{{ title }}</p>
      <NoteMdRenderer :md="excerpt" :isPlain="true" />
    </div>

    <template v-else>
      <NoteMdRenderer :md="note.content" />
    </template>
  </div>
</template>

<script setup>
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
</script>
