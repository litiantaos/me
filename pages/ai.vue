<template>
  <UiLayout :title="mode === 'chat' ? '对话' : '搜索'">
    <div class="w-full">
      <!-- 消息列表 -->
      <div
        v-if="mode === 'chat' && messages.length > 0"
        ref="messagesRef"
        class="flex flex-1 flex-col gap-4 overflow-y-auto"
      >
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="
            message.role === 'user'
              ? 'max-w-4/5 self-end rounded-md bg-zinc-100 px-3 dark:bg-zinc-700'
              : 'self-start'
          "
        >
          <NoteMdRenderer :md="message.content" />
        </div>
      </div>

      <!-- 搜索结果 -->
      <div
        v-if="mode === 'search' && searchResults.length > 0"
        class="space-y-10"
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
            placeholder="今天也要开心呀！"
            class="h-20 w-full resize-none px-3 pt-2 leading-6"
            @keydown="handleKeydown"
          ></textarea>

          <div class="flex items-center gap-2 p-2 text-xs">
            <!-- 模式切换 -->
            <button
              class="flex h-7 cursor-pointer items-center justify-center gap-1 rounded-sm bg-blue-100 px-2 text-blue-500 transition-colors hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30"
              @click="mode = mode === 'chat' ? 'search' : 'chat'"
            >
              <i
                :class="
                  mode === 'chat' ? 'ri-chat-3-line' : 'ri-search-ai-2-line'
                "
              ></i>
              <span>{{ mode === 'chat' ? '对话' : '搜索' }}</span>
              <i class="ri-expand-up-down-line"></i>
            </button>

            <div class="flex-1"></div>

            <!-- 模型选择 -->
            <div
              v-if="mode === 'chat'"
              class="flex h-7 items-center gap-1 rounded-sm bg-zinc-100 px-2 text-xs transition-colors hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600"
            >
              <select
                v-model="modelType"
                class="field-sizing-content cursor-pointer"
              >
                <option v-for="(name, id) in models" :key="id" :value="id">
                  {{ name }}
                </option>
              </select>
              <i class="ri-expand-up-down-line"></i>
            </div>

            <!-- 提交按钮 -->
            <button
              class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-sm bg-blue-500 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="!input.trim() || isLoading"
              @click="handleSubmit"
            >
              <UiLoader v-if="isLoading" size="xs" />
              <i
                v-else
                :class="[
                  'text-xs',
                  mode === 'chat' ? 'ri-arrow-up-line' : 'ri-search-2-line',
                ]"
              ></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </UiLayout>
</template>

<script setup>
const route = useRoute()
const router = useRouter()

const input = ref('')
const inputRef = ref(null)
const mode = ref('chat')
const messagesRef = ref(null)

const error = ref('')
const isLoading = ref(false)

const { models, modelType, messages, sendMessage } = useChat()
const searchResults = ref([])

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

  // 自动聚焦输入框
  inputRef.value?.focus()
})

const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSubmit()
  }
}

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

const handleSubmit = throttle(async () => {
  error.value = ''
  isLoading.value = true

  const query = input.value

  // 仅搜索模式更新 URL
  if (mode.value === 'search') {
    router.replace(`/ai?s=${encodeURIComponent(query)}`)
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

useSeoMeta({ title: 'AI' })
</script>
