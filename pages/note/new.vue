<template>
  <div class="h-screen overflow-hidden">
    <UiLayout
      :title="isEditMode ? '编辑' : '想法'"
      :class="[
        isPreview ? '-translate-y-[80vh]' : 'translate-y-0',
        'transition-transform duration-300',
      ]"
    >
      <template #header>
        <UiLoader v-if="isLoading" />
      </template>

      <div class="flex h-[calc(100vh-144px-128px)] flex-col space-y-4">
        <textarea
          class="w-full flex-1 resize-none leading-7"
          placeholder="心有从容，向阳而生"
          v-model="input"
          ref="textareaRef"
        ></textarea>

        <div class="flex gap-4">
          <button
            class="ri-sticky-note-line btn-base"
            @click="handleDoc"
          ></button>

          <button
            class="ri-folder-line btn-base"
            @click="handleLibrary"
          ></button>

          <button
            class="ri-stacked-view btn-base"
            @click="handlePreview"
          ></button>

          <button
            class="btn-base bg-slate-200! px-8! sm:hover:bg-slate-300/80!"
            :disabled="isSaving"
            @click="handleSubmit"
          >
            <UiLoader v-if="isSaving" size="text-sm" />
            <i v-else class="ri-arrow-right-line"></i>
          </button>
        </div>
      </div>

      <Transition name="fade">
        <div v-if="isPreview" class="mt-8 h-[80vh] overflow-y-auto">
          <div v-html="output" class="html-style"></div>
        </div>
      </Transition>
    </UiLayout>

    <Transition name="fade">
      <div
        v-if="isPreview"
        class="fixed top-0 right-0 left-0 z-10 h-32 cursor-pointer bg-linear-to-b from-white to-transparent"
        @click="handlePreview"
      ></div>
    </Transition>

    <UiModal
      v-model:isShow="isShowModal"
      :component="modalComponent"
      :uiTitle="false"
      :title="modalTitle"
    />
  </div>
</template>

<script setup>
import { marked } from 'marked'
import NoteMarkdownDoc from '@/components/note/MarkdownDoc.vue'
import NoteFileLibrary from '@/components/note/FileLibrary.vue'

const input = ref('')
const textareaRef = ref(null)
const output = computed(() => marked(input.value))

const isPreview = ref(false)

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
  }

  nextTick(() => {
    textareaRef.value?.focus()
  })
})

const handleDoc = () => {
  isShowModal.value = true
  modalComponent.value = markRaw(NoteMarkdownDoc)
  modalTitle.value = 'Markdown Doc'
}

const handleLibrary = () => {
  isShowModal.value = true
  modalComponent.value = markRaw(NoteFileLibrary)
  modalTitle.value = '资源'
}

const handlePreview = () => {
  isPreview.value = !isPreview.value
}

const handleSubmit = throttle(async () => {
  if (!input.value.trim()) return

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

      await refreshNotes()

      router.push(`/note`)
    }
  } catch (error) {
    console.error(isEditMode.value ? '更新失败' : '保存失败', error)
  } finally {
    isSaving.value = false
  }
})

// MdDoc 模态框
const isShowModal = ref(false)
const modalComponent = ref(null)
const modalTitle = ref('')

// 按下 ESC 键关闭预览
const handleEsc = (event) => {
  if (event.key === 'Escape' || event.keyCode === 27) {
    isPreview.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleEsc)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEsc)
})
</script>
