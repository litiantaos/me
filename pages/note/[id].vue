<template>
  <UiLayout :isLoading="isNoteFetching">
    <Transition name="fade">
      <div v-if="note" class="space-y-6">
        <NoteContent :note="note" isPage />

        <UiMediaPreview />

        <UiActions
          v-if="user && user.sub === note.user_id"
          :isDeleting="isDeleting"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>
    </Transition>
  </UiLayout>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const user = useSupabaseUser()

const { isNoteFetching, isDeleting, fetchNote, deleteNote } = useNotes()

// 获取笔记
const { data: note } = await useLazyAsyncData(async () => {
  return await fetchNote(route.params.id)
})

// 检查笔记是否存在
watchEffect(() => {
  if (note.value === null && !isNoteFetching.value) {
    showError({
      statusCode: 404,
      message: '页面不存在',
    })
  }
})

// 编辑笔记
const handleEdit = () => {
  router.push(`/note/new?id=${route.params.id}`)
}

// 删除笔记
const handleDelete = throttle(async () => {
  await deleteNote(route.params.id, user.value.sub)

  router.push('/note')
})

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
</script>
