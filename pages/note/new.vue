<template>
  <UiLayout
    :title="isEditMode ? '编辑想法' : '新想法'"
    :isLoading="isNoteFetching"
  >
    <textarea
      class="field-sizing-content min-h-[60vh] w-full resize-none leading-7"
      placeholder="心有从容，向阳而生"
      v-model="input"
      ref="textareaRef"
    ></textarea>

    <UiMessage v-if="errorMsg" type="error" :text="errorMsg" />

    <div class="sticky bottom-0 flex gap-3 bg-white py-4 dark:bg-zinc-800">
      <button
        class="ri-ai-generate btn-base"
        aria-label="AI 对话"
        @click="handleChat"
      ></button>

      <button
        class="ri-search-line btn-base"
        aria-label="搜索"
        @click="handleSearch"
      ></button>

      <button
        class="ri-sticky-note-line btn-base"
        aria-label="Markdown 文档"
        @click="handleDoc"
      ></button>

      <button
        class="ri-folder-line btn-base"
        aria-label="资源库"
        @click="handleLibrary"
      ></button>

      <button
        class="ri-stacked-view btn-base"
        aria-label="预览"
        @click="handlePreview"
      ></button>

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

const { isNoteFetching, fetchNote, saveNote, refreshNotes } = useNotes()

const input = ref('')
const textareaRef = ref(null)
const isSaving = ref(false)
const errorMsg = ref('')

// 自动保存草稿
const autoSave = debounce((val) => {
  if (!val) return
  localStorage.setItem('note-draft', val)
}, 5000)

watch(input, (newVal) => {
  // 编辑模式不写草稿，避免污染全局草稿键
  if (isEditMode.value) return

  if (newVal) {
    autoSave(newVal)
  } else {
    localStorage.removeItem('note-draft')
  }
})

// 判断是否为编辑模式
const isEditMode = computed(() => {
  return route.query.id ? true : false
})

// 编辑模式获取笔记
const fetchEditingNote = async () => {
  if (isEditMode.value) {
    const note = await fetchNote(route.query.id)
    input.value = note.content
  }
}

// 保存笔记
const handleSubmit = throttle(async () => {
  isSaving.value = true
  errorMsg.value = ''

  try {
    const processedContent = await processContentWithDimensions(input.value)
    input.value = processedContent

    await saveNote(input.value, isEditMode.value ? route.query.id : null)
    await refreshNotes()

    localStorage.removeItem('note-draft')

    if (isEditMode.value) {
      router.push(`/note/${route.query.id}`)
    } else {
      router.push(`/note`)
    }
  } catch (error) {
    errorMsg.value = isEditMode.value ? '更新失败' : '保存失败'
  } finally {
    isSaving.value = false
  }
})

const modalState = reactive({
  isShow: false,
  component: null,
  data: {},
  title: '',
  isLoading: false,
})

const handleChat = () => {
  navigateTo('/ai')
}

const handleSearch = () => {
  navigateTo('/note/search')
}

const handleDoc = async () => {
  const mdDoc = await $fetch('/docs/md.md')

  modalState.isShow = true
  modalState.component = markRaw(UiMarkdown)
  modalState.data = {
    md: mdDoc,
  }
  modalState.title = 'Markdown Doc'
}

const handleLibrary = () => {
  modalState.isShow = true
  modalState.component = markRaw(FileLibrary)
  modalState.title = '资源'
  modalState.data = {
    setIsLoading: (val) => (modalState.isLoading = val),
  }
}

const handlePreview = () => {
  modalState.isShow = true
  modalState.component = markRaw(UiMarkdown)
  modalState.data = {
    md: input.value,
  }
  modalState.title = '预览'
}

const handleModalClose = () => {
  modalState.component = null
  modalState.data = {}
  modalState.title = ''
  modalState.isLoading = false
}

onMounted(async () => {
  if (isEditMode.value) {
    await fetchEditingNote()
  } else {
    const draft = localStorage.getItem('note-draft')
    if (draft) {
      input.value = draft
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
