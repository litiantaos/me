<template>
  <UiLayout title="搜索" :isLoading="isNotesFetching">
    <div class="w-full">
      <input
        ref="inputRef"
        v-model="input"
        placeholder="搜索笔记"
        class="input-base mb-10 w-full"
        @keydown.enter="handleSearch"
      />

      <div v-if="searchResults.length > 0" class="w-full space-y-10">
        <TransitionGroup name="list">
          <NoteContent
            v-for="note in searchResults"
            :key="note.id"
            :note="note"
          />
        </TransitionGroup>

        <UiMediaPreview />
      </div>
    </div>
  </UiLayout>
</template>

<script setup>
const route = useRoute()
const router = useRouter()

const { isNotesFetching, searchNotes } = useNotes()

const input = ref('')
const inputRef = ref(null)
const searchResults = ref([])

const handleSearch = (e) => {
  if (e.isComposing) return
  handleSubmit()
}

// 提交
const handleSubmit = throttle(async () => {
  const query = input.value.trim()
  if (!query) return

  router.replace({
    query: { query },
  })

  searchResults.value = await searchNotes(query)
})

onMounted(() => {
  const { query } = route.query

  if (query) {
    input.value = query
    handleSubmit()
  }

  inputRef.value?.focus()
})

useSeoMeta({ title: '搜索' })
</script>
