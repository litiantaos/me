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
      class="sticky bottom-0 space-y-2 bg-linear-to-t from-white via-white via-80% to-transparent py-4 dark:from-zinc-800! dark:via-zinc-800!"
    >
      <div v-if="error" class="text-red-500">
        {{ error }}
      </div>

      <textarea
        ref="inputRef"
        v-model="inputMessage"
        @keydown="handleKeydown"
        placeholder="今天也要开心呀！"
        :disabled="isLoading"
        class="input-base h-24! w-full resize-none bg-white! px-3! py-2 leading-7 focus:border-purple-400! focus:shadow-md focus:ring-3 focus:shadow-indigo-500/30 focus:ring-orange-400/30 disabled:cursor-not-allowed dark:bg-zinc-800!"
      ></textarea>
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

const { messages, isLoading, error, sendMessage } = useChat(props.defaultPrompt)

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
