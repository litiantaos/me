<template>
  <UiLayout :isLoading="isLoading">
    <div class="space-y-10">
      <div v-if="user">
        <NuxtLink to="/note/new" class="link-color">New</NuxtLink>
      </div>

      <TransitionGroup name="list">
        <NoteContent v-for="note in notes" :key="note.id" :note="note" />
      </TransitionGroup>

      <UiMediaPreview />
    </div>
  </UiLayout>
</template>

<script setup>
const user = useSupabaseUser()

const { notes, isLoading, hasMoreNotes, fetchNotes } = useNotes()

// 监听滚动事件，实现触底加载
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

onMounted(() => {
  if (notes.value.length === 0) {
    fetchNotes()
  }

  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
