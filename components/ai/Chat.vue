<template>
  <div
    class="flex w-full flex-col gap-4 transition-[height] duration-300"
    :class="messages.length > 0 ? 'h-[calc(100vh-96px-48px)]' : 'h-[30vh]'"
  >
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
        <div v-html="parseMarkdown(message.content)" class="html-style"></div>
      </div>
    </div>

    <div class="space-y-2">
      <div v-if="error" class="text-red-500">
        {{ error }}
      </div>

      <textarea
        ref="inputRef"
        v-model="inputMessage"
        @keydown="handleKeydown"
        placeholder="今天也要开心呀！"
        :disabled="isLoading"
        class="input-base h-24! w-full resize-none px-3! py-2 leading-7 focus:border-purple-400! focus:ring-3 focus:ring-orange-400/30 dark:bg-zinc-700/30!"
      ></textarea>
    </div>
  </div>
</template>

<script setup>
import marked from '~/utils/marked'

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

// 解析 Markdown
const parseMarkdown = (content) => {
  return marked(content)
}

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
