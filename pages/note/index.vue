<template>
  <UiLayout :isLoading="isLoading">
    <div class="space-y-10">
      <div class="flex gap-6">
        <NuxtLink v-if="user" to="/note/new" class="link-color">New</NuxtLink>
        <NuxtLink to="/ai?s" class="link-color ri-search-line"></NuxtLink>
      </div>

      <TransitionGroup name="list">
        <div v-if="shici">
          <NuxtLink to="/poetry" class="text-zinc-400 hover:text-blue-500">
            <span>有诗有词</span>
            <span class="ri-arrow-right-line ml-3"></span>
          </NuxtLink>
          <div class="html-style">
            <p>{{ shici.content }}</p>
          </div>
        </div>

        <NoteContent v-for="note in notes" :key="note.id" :note="note" />
      </TransitionGroup>
    </div>

    <UiMediaPreview />
  </UiLayout>
</template>

<script setup>
const user = useSupabaseUser()

const { notes, isLoading, hasMoreNotes, fetchNotes } = useNotes()
const { shici, fetchShici } = useShici()

// 监听滚动事件触底加载
const handleScroll = () => {
  // 如果正在加载或没有更多数据，则不处理
  if (isLoading.value || !hasMoreNotes.value) return

  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight

  // 当距离底部指定距离时触发加载
  if (windowHeight + scrollTop >= documentHeight - 50) {
    fetchNotes()
  }
}

onMounted(async () => {
  if (notes.value.length === 0) {
    fetchNotes()
  }

  fetchShici()

  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

useSeoMeta({
  title: '随写，我的精神角落',
  description: '记录生活，记录想法。',
})
</script>
