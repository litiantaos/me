<template>
  <UiLayout title="对话" :isLoading="isLoading">
    <div class="w-full">
      <!-- 消息列表 -->
      <div v-if="messages.length > 0" class="w-full space-y-4">
        <div
          v-for="(message, index) in messages"
          :key="index"
          ref="messageElements"
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

      <!-- 输入区域 -->
      <div
        class="sticky bottom-0 space-y-4 bg-linear-to-b from-transparent via-white via-15% to-white pt-8 pb-4 dark:via-zinc-800 dark:to-zinc-800"
      >
        <UiMessage type="error" :text="errorMsg" />

        <div
          class="rounded-md border border-zinc-300 transition-all duration-300 focus-within:border-blue-400! focus-within:shadow-md focus-within:ring-3 focus-within:shadow-rose-500/20 focus-within:ring-blue-400/20 dark:border-zinc-600"
        >
          <textarea
            ref="inputRef"
            v-model="input"
            placeholder="今天也要开心呀！"
            rows="3"
            class="no-scrollbar max-h-60 w-full resize-none overflow-y-auto px-3 py-2 leading-6"
            @keydown.enter="handleKeydown"
          ></textarea>

          <div class="flex items-center justify-between px-2 pb-2">
            <button
              class="btn-base h-7! w-auto! gap-2 rounded-sm! px-2 text-xs"
              @click="isModalShow = true"
            >
              <span>{{ AI_MODELS[modelType].name }}</span>
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
                  v-for="(config, id) in AI_MODELS"
                  :key="id"
                  class="flex w-full items-center gap-2"
                  :class="
                    modelType === id ? 'text-blue-500 dark:text-blue-400' : ''
                  "
                >
                  <i :class="config.logo"></i>
                  <button
                    class="btn flex-1 justify-start! px-2 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    @click="
                      () => {
                        modelType = id
                        isModalShow = false
                      }
                    "
                  >
                    {{ config.name }}
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
const { modelType, messages, sendMessage } = useChat()

const input = ref('')
const inputRef = ref(null)
const isLoading = ref(false)
const isModalShow = ref(false)
const messageElements = ref([])
const errorMsg = ref('')

// 输入框自适应高度
watch(input, async () => {
  await nextTick()

  if (inputRef.value) {
    inputRef.value.style.height = 'auto'
    inputRef.value.style.height = inputRef.value.scrollHeight + 'px'
  }
})

// 回车提交
const handleKeydown = (e) => {
  if (e.isComposing) return
  if (e.shiftKey) return
  e.preventDefault()

  handleSubmit()
}

// 滚动到最后一条用户消息位置
const scrollToLastUserMessage = async () => {
  await nextTick()

  const lastUserMessageIndex = messages.value.findLastIndex(
    (m) => m.role === 'user',
  )
  if (lastUserMessageIndex !== -1) {
    const el = messageElements.value[lastUserMessageIndex]
    if (el) {
      window.scrollTo({
        top: Math.max(0, el.offsetTop),
        behavior: 'smooth',
      })
    }
  }
}

// 提交
const handleSubmit = throttle(async () => {
  if (!input.value.trim()) return

  errorMsg.value = ''
  isLoading.value = true

  try {
    const sendPromise = sendMessage(input.value)

    input.value = ''

    // 滚动到底部显示用户消息
    await nextTick()
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    })

    // 等待 AI 回复完成
    await sendPromise

    // AI 回复后滚动到最后一条用户消息位置
    if (!errorMsg.value) await scrollToLastUserMessage()
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    isLoading.value = false
  }
})

onMounted(() => {
  inputRef.value?.focus()
})

useSeoMeta({ title: 'AI' })
</script>
