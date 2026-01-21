<template>
  <UiLayout title="搜索" :isLoading="isLoading">
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

const input = ref('')
const inputRef = ref(null)
const isLoading = ref(false)
const searchResults = ref([])

const handleSearch = (e) => {
  if (e.isComposing) return
  handleSubmit()
}

// 提交
const handleSubmit = throttle(async () => {
  const q = input.value.trim()
  if (!q) return

  router.replace({
    query: { q },
  })

  isLoading.value = true

  try {
    const response = await $fetch('/api/notes/search', {
      method: 'POST',
      body: { query: q },
    })

    searchResults.value = response.results
  } catch (error) {
    throw error
  } finally {
    isLoading.value = false
  }
})

onMounted(() => {
  const { q } = route.query

  if (q) {
    input.value = q
    handleSubmit()
  }

  inputRef.value?.focus()
})

useSeoMeta({ title: '搜索' })
</script>
