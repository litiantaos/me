<template>
  <div>
    <UiLayout :title="isEditMode ? '编辑' : '想法'" :isLoading="isLoading">
      <textarea
        class="field-sizing-content min-h-[60vh] w-full resize-none leading-7"
        placeholder="心有从容，向阳而生"
        v-model="input"
        ref="textareaRef"
      ></textarea>

      <div class="sticky bottom-0 flex gap-4 bg-white py-4 dark:bg-zinc-800">
        <button class="ri-ai-generate btn-base" @click="handleChat"></button>

        <button
          class="ri-sticky-note-line btn-base"
          @click="handleDoc"
        ></button>

        <button class="ri-folder-line btn-base" @click="handleLibrary"></button>

        <button
          class="ri-stacked-view btn-base"
          @click="handlePreview"
        ></button>

        <Transition name="fade">
          <button
            v-if="input.trim()"
            class="btn-base w-20! bg-slate-200! sm:hover:bg-slate-300/80! dark:bg-zinc-600! dark:sm:hover:bg-zinc-500!"
            :disabled="isSaving"
            @click="handleSubmit"
          >
            <UiLoader v-if="isSaving" size="sm" />
            <i v-else class="ri-arrow-right-line"></i>
          </button>
        </Transition>
      </div>
    </UiLayout>

    <UiModal
      v-model:isShow="isModalShow"
      :component="modalComponent"
      :componentData="modalComponentData"
      :hasUiTitle="false"
      :title="modalTitle"
      @close="handleModalClose"
    />
  </div>
</template>

<script setup>
import NoteMdRenderer from '@/components/note/MdRenderer.vue'
import FileLibrary from '@/components/note/FileLibrary.vue'

const input = ref('')
const textareaRef = ref(null)

const client = useSupabaseClient()
const user = useSupabaseUser()
const route = useRoute()
const router = useRouter()

const { refreshNotes } = useNotes()

const isSaving = ref(false)
const isLoading = ref(false)

// 判断是否为编辑模式
const isEditMode = computed(() => {
  return route.query.id ? true : false
})

// 获取笔记内容（编辑模式）
const fetchNote = async () => {
  if (!isEditMode.value) return

  isLoading.value = true

  try {
    const { data, error } = await client
      .from('notes')
      .select('*')
      .eq('id', route.query.id)
      .single()

    if (error) throw error

    input.value = data.content
  } catch (error) {
    console.error('获取笔记失败', error)
    router.push('/note')
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  // 如果是编辑模式，获取笔记内容
  if (isEditMode.value) {
    await fetchNote()
  } else {
    // 非编辑模式下，尝试恢复之前保存的内容
    const savedContent = sessionStorage.getItem('note-draft-content')
    if (savedContent) {
      input.value = savedContent
    }
  }

  nextTick(() => {
    textareaRef.value?.focus()
  })
})

// 模态框
const isModalShow = ref(false)
const modalComponent = ref(null)
const modalComponentData = ref({})
const modalTitle = ref('')

const handleChat = () => {
  // 保存当前输入内容到 sessionStorage
  if (input.value.trim() && !isEditMode.value) {
    sessionStorage.setItem('note-draft-content', input.value)
  }
  navigateTo('/chat')
}

const handleDoc = async () => {
  const res = await fetch('/docs/md.md')
  const mdDoc = await res.text()

  isModalShow.value = true
  modalComponent.value = markRaw(NoteMdRenderer)
  modalComponentData.value = {
    md: mdDoc,
  }
  modalTitle.value = 'Markdown Doc'
}

const handleLibrary = () => {
  isModalShow.value = true
  modalComponent.value = markRaw(FileLibrary)
  modalTitle.value = '资源'
}

const handlePreview = () => {
  isModalShow.value = true
  modalComponent.value = markRaw(NoteMdRenderer)
  modalComponentData.value = {
    md: input.value,
  }
  modalTitle.value = '预览'
}

const handleModalClose = () => {
  modalComponent.value = null
  modalComponentData.value = {}
  modalTitle.value = ''
}

const handleSubmit = throttle(async () => {
  isSaving.value = true

  try {
    // 编辑模式
    if (isEditMode.value) {
      const { error } = await client
        .from('notes')
        .update({
          content: input.value,
          updated_at: new Date(),
        })
        .eq('id', route.query.id)
        .eq('user_id', user.value.id)

      if (error) throw error

      await refreshNotes()

      router.push(`/note/${route.query.id}`)
    }
    // 新建模式
    else {
      const { data, error } = await client
        .from('notes')
        .insert({
          content: input.value,
          user_id: user.value.id,
        })
        .select()

      if (error) throw error

      // 清除保存的草稿内容
      sessionStorage.removeItem('note-draft-content')

      await refreshNotes()

      router.push(`/note`)
    }
  } catch (error) {
    console.error(isEditMode.value ? '更新失败' : '保存失败', error)
  } finally {
    isSaving.value = false
  }
})

useSeoMeta({
  title: () => (isEditMode.value ? '编辑想法' : '新想法'),
})
</script>
