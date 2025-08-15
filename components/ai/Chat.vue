<template>
  <div class="w-full">
    <div
      class="flex flex-1 flex-col gap-4 overflow-y-auto"
      ref="messagesContainer"
    >
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="[
          'rounded-md px-3',
          message.role === 'user'
            ? 'max-w-4/5 self-end bg-blue-50 dark:bg-gray-700'
            : 'self-start bg-gray-100 dark:bg-zinc-700',
        ]"
      >
        <MdRenderer :md="message.content" />
      </div>
    </div>

    <div
      class="sticky bottom-0 space-y-2 bg-linear-to-b from-transparent via-white via-10% to-white pt-8 pb-4 dark:via-zinc-800! dark:to-zinc-800!"
    >
      <div v-if="error" class="text-xs text-red-500">
        {{ error }}
      </div>

      <div
        class="rounded-md border border-gray-300 transition-all duration-300 focus-within:border-purple-400! focus-within:shadow-md focus-within:ring-3 focus-within:shadow-indigo-500/30 focus-within:ring-orange-400/30 dark:border-zinc-600"
      >
        <textarea
          ref="inputRef"
          v-model="inputMessage"
          @keydown="handleKeydown"
          placeholder="今天也要开心呀！"
          :disabled="isLoading"
          class="h-24 w-full resize-none px-3 pt-2 leading-7 disabled:cursor-not-allowed"
        ></textarea>

        <div class="flex justify-between p-2">
          <button
            class="flex gap-1 rounded-sm bg-gray-100 px-2 py-1 text-xs sm:hover:bg-gray-200 dark:bg-zinc-700 dark:sm:hover:bg-zinc-600"
            @click="
              switchModel(modelType === 'deepseek' ? 'gemini' : 'deepseek')
            "
          >
            {{ modelType === 'deepseek' ? 'DeepSeek' : 'Gemini' }}
            <i class="ri-expand-up-down-line"></i>
          </button>

          <button
            class="ri-arrow-up-line rounded-sm px-2 py-1 text-xs text-white"
            :class="
              inputMessage
                ? 'bg-blue-500 sm:hover:bg-blue-500/80'
                : 'bg-blue-500/50'
            "
            @click="handleSend"
          ></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  defaultPrompt: {
    type: String,
    default: '',
  },
})

const inputRef = ref(null)
const inputMessage = ref('')
const messagesContainer = ref(null)

const { messages, isLoading, error, sendMessage, modelType, switchModel } =
  useChat(props.defaultPrompt)

// 监听消息变化，自动滚动到底部
watch(messages, () => {
  setTimeout(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }, 100)
})

const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

const handleSend = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return

  const message = inputMessage.value
  inputMessage.value = ''
  await sendMessage(message)
}

onMounted(() => {
  inputRef.value?.focus()
})
</script>
