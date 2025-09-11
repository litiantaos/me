<template>
  <UiLayout title="聊天">
    <div class="w-full">
      <div
        class="flex flex-1 flex-col gap-4 overflow-y-auto"
        ref="messagesContainer"
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

      <div
        class="sticky bottom-0 space-y-2 bg-linear-to-b from-transparent via-white via-10% to-white pt-8 pb-4 dark:via-zinc-800! dark:to-zinc-800!"
      >
        <div v-if="error" class="text-xs text-red-500">
          {{ error }}
        </div>

        <div
          class="rounded-md border border-zinc-300 transition-all duration-300 focus-within:border-purple-400! focus-within:shadow-md focus-within:ring-3 focus-within:shadow-indigo-500/30 focus-within:ring-orange-400/30 dark:border-zinc-600"
        >
          <textarea
            ref="inputRef"
            v-model="inputMessage"
            @keydown="handleKeydown"
            placeholder="今天也要开心呀！"
            class="h-24 w-full resize-none px-3 pt-2 leading-6 disabled:cursor-not-allowed"
          ></textarea>

          <div class="flex justify-between p-2">
            <button
              class="flex gap-1 rounded-sm bg-zinc-100 px-2 py-1 text-xs sm:hover:bg-zinc-200 dark:bg-zinc-700 dark:sm:hover:bg-zinc-600"
              @click="
                switchModel(modelType === 'deepseek' ? 'gemini' : 'deepseek')
              "
            >
              {{ modelType === 'deepseek' ? 'DeepSeek' : 'Gemini' }}
              <i class="ri-expand-up-down-line"></i>
            </button>

            <button
              class="flex w-8 items-center justify-center rounded-sm text-white"
              :class="
                inputMessage
                  ? 'bg-blue-500 sm:hover:bg-blue-500/80'
                  : 'bg-blue-500/50'
              "
              :disabled="isLoading"
              @click="handleSend"
            >
              <UiLoader v-if="isLoading" size="xs"></UiLoader>
              <i v-else class="ri-arrow-up-line text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </UiLayout>
</template>

<script setup>
const inputRef = ref(null)
const inputMessage = ref('')
const messagesContainer = ref(null)

const defaultPrompt = ''

const { messages, isLoading, error, sendMessage, modelType, switchModel } =
  useChat(defaultPrompt)

const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

const handleSend = async () => {
  if (!inputMessage.value.trim()) return

  const message = inputMessage.value
  inputMessage.value = ''

  // 滚动页面到底部
  await nextTick()
  setTimeout(() => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    })
  }, 100)

  // 发送消息
  await sendMessage(message)
}

// 监听AI回复完成，滚动到最后一条用户消息位置
watch(isLoading, async (newVal, oldVal) => {
  if (oldVal && !newVal) {
    // AI回复完成
    await nextTick()

    // 找到最后一条用户消息的元素
    const messageElements = messagesContainer.value?.querySelectorAll(
      '[class*="self-end"]',
    )
    if (messageElements && messageElements.length > 0) {
      const lastUserMessage = messageElements[messageElements.length - 1]
      const elementTop = lastUserMessage.offsetTop
      const scrollPosition = elementTop - 96

      window.scrollTo({
        top: Math.max(0, scrollPosition),
        behavior: 'smooth',
      })
    }
  }
})

onMounted(() => {
  inputRef.value?.focus()
})

useSeoMeta({
  title: 'AI Chat',
  description: 'Chat With DeepSeek and Gemini',
})
</script>
