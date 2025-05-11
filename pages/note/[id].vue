<template>
  <UiLayout>
    <div v-if="note">
      <UiNote :note="note" />

      <div v-if="user && user.id === note.user_id" class="mt-6">
        <div
          class="flex h-7 w-fit items-center gap-4 rounded-md bg-gray-100 px-3"
        >
          <button
            class="ri-more-line h-full"
            @click="isOpen = !isOpen"
          ></button>

          <div v-if="isOpen" class="h-full space-x-4">
            <button class="ri-edit-line h-full" @click="handleEdit"></button>
            <button
              class="ri-delete-bin-7-line h-full text-red-600"
              @click="handleDelete"
            ></button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex items-center">
      <UiLoader />
    </div>
  </UiLayout>
</template>

<script setup>
const client = useSupabaseClient()
const user = useSupabaseUser()
const route = useRoute()
const router = useRouter()

const isLoading = ref(false)
const isDeleting = ref(false)

const isOpen = ref(false)

// 获取笔记
const { data: note } = await useAsyncData(async () => {
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
const handleDelete = async () => {
  if (!confirm('确定要删除吗？')) return

  isDeleting.value = true

  try {
    const { error: deleteError } = await client
      .from('notes')
      .delete()
      .eq('id', route.params.id)
      .eq('user_id', user.value.id)

    if (deleteError) throw new Error(deleteError.message)

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

useSeoMeta({
  title: note.value.content,
  description: note.value.content,
})
</script>
