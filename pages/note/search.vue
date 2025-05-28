<template>
  <UiLayout :isLoading="isLoading">
    <div class="space-y-10">
      <form @submit.prevent="handleSearch">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="搜索"
          class="w-full border-b border-b-gray-200 py-2 transition-colors focus:border-blue-500 dark:border-zinc-600"
          autofocus
        />
      </form>

      <TransitionGroup name="list">
        <NoteContent
          v-for="note in searchResults"
          :key="note.id"
          :note="note"
        />
      </TransitionGroup>

      <div
        v-if="searchResults?.length === 0"
        class="ri-cloudy-2-line text-center text-2xl text-gray-300 dark:text-zinc-600"
      ></div>
    </div>
  </UiLayout>
</template>

<script setup>
const client = useSupabaseClient()
const route = useRoute()
const router = useRouter()

const searchQuery = ref('')
const searchResults = ref(null)
const isLoading = ref(false)

onMounted(() => {
  // 从 URL 参数获取初始搜索词
  const { q } = route.query
  if (q) {
    searchQuery.value = q
    handleSearch()
  }
})

// 搜索
const handleSearch = throttle(async () => {
  if (!searchQuery.value) {
    searchResults.value = null
    // 清空搜索参数
    updateSearchParam('')
    return
  }

  isLoading.value = true

  try {
    const { data, error } = await client
      .from('notes')
      .select('*')
      .ilike('content', `%${searchQuery.value}%`)
      .order('created_at', { ascending: false })

    if (error) throw error

    searchResults.value = data

    // 更新 URL 参数
    updateSearchParam(searchQuery.value)
  } catch (error) {
    console.error('搜索失败', error)
  } finally {
    isLoading.value = false
  }
})

// 更新 URL 搜索参数
const updateSearchParam = (query) => {
  router.replace({
    query: {
      ...route.query,
      q: query || undefined, // 如果 query 为空，则移除参数
    },
  })
}

useSeoMeta({
  title: '搜索',
})
</script>
