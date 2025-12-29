<template>
  <UiLayout :title="isEditMode ? '编辑' : '想法'" :isLoading="isNoteFetching">
    <textarea
      class="field-sizing-content min-h-[60vh] w-full resize-none leading-7"
      placeholder="心有从容，向阳而生"
      v-model="input"
      ref="textareaRef"
    ></textarea>

    <div class="sticky bottom-0 flex gap-4 bg-white py-4 dark:bg-zinc-800">
      <button class="ri-ai-generate btn-base" @click="handleChat"></button>

      <button class="ri-sticky-note-line btn-base" @click="handleDoc"></button>

      <button class="ri-folder-line btn-base" @click="handleLibrary"></button>

      <button class="ri-stacked-view btn-base" @click="handlePreview"></button>

      <button
        v-if="input.trim()"
        class="btn-primary w-20!"
        :disabled="isSaving"
        @click="handleSubmit"
      >
        <UiLoader v-if="isSaving" size="sm" />
        <i v-else class="ri-arrow-right-line"></i>
      </button>
    </div>

    <UiModal
      v-model:isShow="modalState.isShow"
      :component="modalState.component"
      :componentData="modalState.data"
      :title="modalState.title"
      :isLoading="modalState.isLoading"
      @close="handleModalClose"
    />
  </UiLayout>
</template>

<script setup>
import UiMarkdown from '@/components/ui/Markdown.vue'
import FileLibrary from '@/components/note/FileLibrary.vue'

const route = useRoute()
const router = useRouter()

const { isNoteFetching, fetchNote, refreshNotes } = useNotes()

const input = ref('')
const textareaRef = ref(null)

const isSaving = ref(false)

// 判断是否为编辑模式
const isEditMode = computed(() => {
  return route.query.id ? true : false
})

// 编辑模式 - 获取笔记
const fetchEditingNote = async () => {
  if (isEditMode.value) {
    const note = await fetchNote(route.query.id)

    input.value = note.content
  }
}

// 保存笔记
const handleSubmit = throttle(async () => {
  isSaving.value = true

  try {
    await $fetch('/api/notes/save', {
      method: 'POST',
      body: {
        content: input.value,
        noteId: isEditMode.value ? route.query.id : null,
      },
    })

    await refreshNotes()

    if (isEditMode.value) {
      router.push(`/note/${route.query.id}`)
    } else {
      sessionStorage.removeItem('note-draft-content')
      router.push(`/note`)
    }
  } catch (error) {
    console.error(isEditMode.value ? '更新失败' : '保存失败', error)
  } finally {
    isSaving.value = false
  }
})

// 模态框
const modalState = reactive({
  isShow: false,
  component: null,
  data: {},
  title: '',
  isLoading: false,
})

// 进入 AI 对话
const handleChat = () => {
  // 保存当前输入内容到 sessionStorage
  if (input.value.trim() && !isEditMode.value) {
    sessionStorage.setItem('note-draft-content', input.value)
  }
  navigateTo('/ai')
}

// 查看 Markdown 文档
const handleDoc = async () => {
  const mdDoc = await $fetch('/docs/md.md')

  modalState.isShow = true
  modalState.component = markRaw(UiMarkdown)
  modalState.data = {
    md: mdDoc,
  }
  modalState.title = 'Markdown Doc'
}

// 查看文件库
const handleLibrary = () => {
  modalState.isShow = true
  modalState.component = markRaw(FileLibrary)
  modalState.title = '资源'
  modalState.data = {
    setIsLoading: (val) => (modalState.isLoading = val),
  }
}

// 预览笔记
const handlePreview = () => {
  modalState.isShow = true
  modalState.component = markRaw(UiMarkdown)
  modalState.data = {
    md: input.value,
  }
  modalState.title = '预览'
}

// 关闭模态框
const handleModalClose = () => {
  modalState.component = null
  modalState.data = {}
  modalState.title = ''
  modalState.isLoading = false
}

onMounted(async () => {
  // 编辑模式 - 获取笔记
  if (isEditMode.value) {
    await fetchEditingNote()
  } else {
    // 新建模式 - 恢复已保存内容
    const savedContent = sessionStorage.getItem('note-draft-content')
    if (savedContent) {
      input.value = savedContent
    }
  }

  nextTick(() => {
    textareaRef.value?.focus()
  })
})

useSeoMeta({
  title: () => (isEditMode.value ? '编辑想法' : '新想法'),
})
</script>
