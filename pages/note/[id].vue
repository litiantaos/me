<template>
  <UiLayout :isLoading="isLoading">
    <Transition name="fade">
      <div v-if="note" class="space-y-6">
        <NoteContent :note="note" is-page />

        <UiMediaPreview />

        <div
          v-if="user && user.id === note.user_id"
          class="h-7 overflow-hidden rounded-md bg-gray-100 transition-[width,background-color] duration-200 sm:hover:bg-gray-200/80 dark:bg-zinc-700 dark:sm:hover:bg-zinc-600"
          :class="isBtnsOpen ? 'w-30' : 'w-10'"
          @mouseenter="onBtnsMouseEnter"
          @mouseleave="resetBtnsTimeout"
        >
          <div
            class="flex h-full w-40 transition-transform duration-200"
            :class="{ '-translate-x-10': isDeleteConfirm }"
          >
            <button
              class="ri-more-line h-full flex-1"
              @click="handleBtnOpen"
            ></button>
            <button
              class="ri-edit-line h-full flex-1"
              @click="handleEdit"
            ></button>
            <button
              class="ri-delete-bin-7-line h-full flex-1 text-red-600"
              @click="handleDeleteConfirm"
            ></button>
            <button
              class="ri-check-line h-full flex-1 text-blue-500"
              @click="handleDelete"
            ></button>
          </div>
        </div>
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

const isLoading = ref(false)
const isDeleteConfirm = ref(false)
const isDeleting = ref(false)

const isBtnsOpen = ref(false)
const btnsCloseTimer = ref(null)

// 获取笔记
const { data: note } = await useLazyAsyncData(async () => {
  isLoading.value = true

  try {
    const { data, error } = await client
      .from('notes')
      .select('*')
      .eq('id', route.params.id)
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('获取笔记失败', error)
  } finally {
    isLoading.value = false
  }
})

// 删除笔记
const handleDeleteConfirm = () => {
  isDeleteConfirm.value = !isDeleteConfirm.value
}

const handleDelete = async () => {
  isDeleting.value = true

  try {
    const { error: deleteError } = await client
      .from('notes')
      .delete()
      .eq('id', route.params.id)
      .eq('user_id', user.value.id)

    if (deleteError) throw new Error(deleteError.message)

    await refreshNotes()

    router.push('/note')
  } catch (err) {
    console.error('删除失败', err)
  } finally {
    isDeleting.value = false
  }
}

// 编辑笔记
const handleEdit = () => {
  router.push(`/note/new?id=${route.params.id}`)
}

// 打开更多按钮
const handleBtnOpen = () => {
  isBtnsOpen.value = !isBtnsOpen.value
}

const onBtnsMouseEnter = () => {
  clearTimeout(btnsCloseTimer.value)
}

const resetBtnsTimeout = () => {
  clearTimeout(btnsCloseTimer.value)

  btnsCloseTimer.value = setTimeout(() => {
    isBtnsOpen.value = false
    isDeleteConfirm.value = false
  }, 3000)
}

// SEO
const title = computed(() => {
  if (!note.value?.content) return null
  if (note.value.content.startsWith('#')) {
    const match = note.value.content.match(/^# (.+)$/m)
    return match ? match[1] : null
  }
  return note.value.content.substring(0, 50)
})

useSeoMeta({
  title: () => title.value,
  description: () => note.value?.content,
})

definePageMeta({
  scrollToTop: false,
})
</script>
