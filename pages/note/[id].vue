<template>
  <UiLayout :isLoading="isLoading">
    <Transition name="fade">
      <div v-if="note" class="space-y-6">
        <NoteContent :note="note" isPage />

        <UiMediaPreview />

        <ClientOnly>
          <div
            v-if="isOwner"
            class="h-7 overflow-hidden rounded-md bg-zinc-100 transition-all duration-200 hover:bg-zinc-200/80 dark:bg-zinc-700 dark:hover:bg-zinc-600/80"
            :class="isBtnsOpen ? 'w-30' : 'w-10'"
          >
            <div
              class="flex h-full w-40 transition-transform duration-200"
              :class="{ '-translate-x-10': isDeleteConfirm }"
            >
              <button
                class="ri-more-line btns-item"
                @click="handleBtnOpen"
              ></button>
              <button
                class="ri-edit-line btns-item"
                @click="handleEdit"
              ></button>
              <button
                class="ri-delete-bin-7-line btns-item text-red-600"
                @click="handleDeleteConfirm"
              ></button>
              <button
                class="btns-item text-blue-500"
                @click="handleDelete"
                :disabled="isDeleting"
              >
                <UiLoader v-if="isDeleting" size="sm"></UiLoader>
                <i v-else class="ri-check-line"></i>
              </button>
            </div>
          </div>
        </ClientOnly>
      </div>
    </Transition>
  </UiLayout>
</template>

<script setup>
const client = useSupabaseClient()
const user = useSupabaseUser()
const route = useRoute()
const router = useRouter()

const { refreshNotes } = useNotes()

const isDeleteConfirm = ref(false)
const isDeleting = ref(false)

const isBtnsOpen = ref(false)
const btnsCloseTimer = ref(null)

// 判断当前用户是否是笔记作者
const isOwner = computed(() => {
  return (
    user.value?.sub &&
    note.value?.user_id &&
    user.value.sub === note.value.user_id
  )
})

// 获取笔记
const { data: note, pending: isLoading } = await useLazyAsyncData(async () => {
  const { data, error } = await client
    .from('notes')
    .select('*')
    .eq('id', route.params.id)
    .single()

  if (error) throw error

  return data
})

// 检查笔记是否存在
watch(isLoading, (loading) => {
  if (!loading && !note.value) {
    showError({
      statusCode: 404,
      message: '页面不存在',
    })
  }
})

const resetCloseTimer = () => {
  clearTimeout(btnsCloseTimer.value)

  btnsCloseTimer.value = setTimeout(() => {
    isBtnsOpen.value = false
    isDeleteConfirm.value = false
  }, 3000)
}

// 删除笔记
const handleDeleteConfirm = () => {
  isDeleteConfirm.value = !isDeleteConfirm.value
  if (isBtnsOpen.value) {
    resetCloseTimer()
  }
}

const handleDelete = throttle(async () => {
  isDeleting.value = true

  try {
    await $fetch('/api/notes/delete', {
      method: 'POST',
      body: { noteId: route.params.id },
    })

    await refreshNotes()

    router.push('/note')
  } catch (err) {
    console.error('删除失败', err)
  } finally {
    isDeleting.value = false
  }
})

// 编辑笔记
const handleEdit = () => {
  router.push(`/note/new?id=${route.params.id}`)
}

// 打开更多按钮
const handleBtnOpen = () => {
  isBtnsOpen.value = !isBtnsOpen.value
  if (isBtnsOpen.value) {
    resetCloseTimer()
  } else {
    clearTimeout(btnsCloseTimer.value)
  }
}

// SEO
const title = computed(() => {
  if (!note.value?.content) return null
  const match = note.value.content.match(/^# (.+)$/m)
  return match ? match[1] : null
})

const description = computed(() => {
  if (!note.value?.content) return null
  return renderToPlainText(note.value.content)
})

useSeoMeta({
  title: () => title.value || description.value?.substring(0, 50),
  description: () => description.value || '',
})

definePageMeta({
  scrollToTop: false,
})
</script>

<style scoped>
.btns-item {
  @apply flex h-full flex-1 items-center justify-center;
}
</style>
