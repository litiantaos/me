<template>
  <UiLayout
    :title="mode === 'chat' ? '对话' : '搜索'"
    :isLoading="isLoading"
    :handleTitle="toggleMode"
  >
    <div class="w-full">
      <!-- 消息列表 -->
      <div
        v-if="mode === 'chat' && messages.length > 0"
        ref="messagesRef"
        class="w-full space-y-4"
      >
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="[
            'flex w-full',
            message.role === 'user' ? 'justify-end' : 'justify-start',
          ]"
        >
          <UiMarkdown
            :md="message.content"
            :class="
              message.role === 'user'
                ? 'max-w-4/5 rounded-md bg-zinc-100 px-3 dark:bg-zinc-700'
                : 'w-full'
            "
          />
        </div>
      </div>

      <!-- 搜索结果 -->
      <div
        v-if="mode === 'search' && searchResults.length > 0"
        class="w-full space-y-10"
      >
        <TransitionGroup name="list">
          <NoteContent
            v-for="note in searchResults"
            :key="note.id"
            :note="note"
          />
        </TransitionGroup>

        <UiMediaPreview />
      </div>

      <!-- 输入区域 -->
      <div
        class="sticky bottom-0 space-y-4 bg-linear-to-b from-transparent via-white via-10% to-white pt-8 pb-4 dark:via-zinc-800! dark:to-zinc-800!"
      >
        <UiMessage type="error" :text="error" />

        <div
          class="rounded-md border border-zinc-300 transition-all duration-300 focus-within:border-blue-400! focus-within:shadow-md focus-within:ring-3 focus-within:shadow-rose-500/20 focus-within:ring-blue-400/20 dark:border-zinc-600"
        >
          <textarea
            ref="inputRef"
            v-model="input"
            :placeholder="mode === 'chat' ? '今天也要开心呀！' : '搜索笔记'"
            :rows="mode === 'chat' ? '3' : '1'"
            class="no-scrollbar max-h-60 w-full resize-none overflow-y-auto px-3 py-2 leading-6"
            @keydown="handleKeydown"
          ></textarea>

          <div
            v-if="mode === 'chat'"
            class="flex items-center justify-between px-2 pb-2"
          >
            <button
              class="btn-base h-7! w-auto! gap-2 rounded-sm! px-2 text-xs"
              @click="isModalShow = true"
            >
              <span>{{ models[modelType] }}</span>
              <i class="ri-expand-up-down-line"></i>
            </button>

            <button
              class="btn-primary h-7! w-7! rounded-sm! text-xs"
              :disabled="!input.trim() || isLoading"
              @click="handleSubmit"
            >
              <UiLoader v-if="isLoading" size="xs" />
              <i v-else class="ri-arrow-up-line"></i>
            </button>

            <UiModal
              v-model:isShow="isModalShow"
              title="选择模型"
              :isSlot="true"
            >
              <div class="space-y-2">
                <div
                  v-for="(name, id) in models"
                  :key="id"
                  class="flex w-full items-center gap-2"
                  :class="
                    modelType === id ? 'text-blue-500 dark:text-blue-400' : ''
                  "
                >
                  <i :class="modelsLogoMap[id.split('-')[0]]"></i>
                  <button
                    class="btn flex-1 justify-start! px-2 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    @click="
                      () => {
                        modelType = id
                        isModalShow = false
                      }
                    "
                  >
                    {{ name }}
                  </button>
                </div>
              </div>
            </UiModal>
          </div>
        </div>
      </div>
    </div>
  </UiLayout>
</template>

<script setup>
const route = useRoute()
const router = useRouter()

const { models, modelType, messages, sendMessage } = useChat()

const mode = ref('chat')
const input = ref('')
const inputRef = ref(null)
const isLoading = ref(false)
const isModalShow = ref(false)
const messagesRef = ref(null)
const searchResults = ref([])
const error = ref('')
const searchQuery = ref('')

const modelsLogoMap = {
  gemini: 'ri-gemini-fill',
  claude: 'ri-claude-fill',
  gpt: 'ri-openai-fill',
  grok: 'ri-twitter-x-fill',
  deepseek: 'ri-deepseek-fill',
}

// 切换模式
const toggleMode = () => {
  mode.value = mode.value === 'chat' ? 'search' : 'chat'
  inputRef.value?.focus()

  if (mode.value === 'search') {
    router.replace({ query: { s: searchQuery.value } })
  } else {
    router.replace({ query: {} })
  }
}

// 输入框自适应高度
watch([input, mode], async () => {
  await nextTick()

  if (inputRef.value) {
    inputRef.value.style.height = 'auto'
    inputRef.value.style.height = inputRef.value.scrollHeight + 'px'
  }
})

// 回车提交
const handleKeydown = (e) => {
  if (e.isComposing) return
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSubmit()
  }
}

// 滚动到最后一条用户消息位置
const scrollToLastUserMessage = async () => {
  await nextTick()

  // 找到最后一条用户消息的元素
  const messageElements = messagesRef.value?.querySelectorAll(
    '[class*="self-end"]',
  )

  if (messageElements && messageElements.length > 0) {
    const lastUserMessage = messageElements[messageElements.length - 1]
    const elementTop = lastUserMessage.offsetTop

    window.scrollTo({
      top: Math.max(0, elementTop),
      behavior: 'smooth',
    })
  }
}

// 提交
const handleSubmit = throttle(async () => {
  if (!input.value.trim()) return

  error.value = ''
  isLoading.value = true

  const query = input.value

  // 仅搜索模式更新 URL
  if (mode.value === 'search') {
    searchQuery.value = query
    router.replace({ query: { s: searchQuery.value } })
  }

  try {
    if (mode.value === 'chat') {
      input.value = ''

      const sendPromise = sendMessage(query)

      // 滚动到底部显示用户消息
      await nextTick()
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth',
      })

      // 等待 AI 回复完成
      await sendPromise

      // AI 回复后滚动到最后一条用户消息位置
      if (!error.value) {
        await scrollToLastUserMessage()
      }
    } else {
      const response = await $fetch('/api/ai/search', {
        method: 'POST',
        body: { query },
      })
      searchResults.value = response.results

      await nextTick()
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  } catch (e) {
    error.value = e.data?.message || e.message || '未知错误'
  } finally {
    isLoading.value = false
  }
})

onMounted(() => {
  // 从 URL 获取参数：/ai?c 对话，ai?s 搜索
  const { c, s } = route.query
  const query = c || s || ''

  // 只要 s 参数存在就切换到搜索模式
  if ('s' in route.query) mode.value = 'search'

  if (query) {
    input.value = query
    handleSubmit()
  }

  inputRef.value?.focus()
})

useSeoMeta({ title: 'AI' })
</script>
