<template>
  <UiLayout title="对话" :isLoading="isLoading">
    <div class="w-full">
      <!-- 消息列表 -->
      <div v-if="messages.length > 0" class="w-full space-y-4">
        <div
          v-for="message in messages"
          :key="message.id"
          ref="messageElements"
          :class="[
            'flex w-full',
            message.role === 'user' ? 'justify-end' : 'justify-start',
          ]"
        >
          <!-- 用户消息 -->
          <UiMarkdown
            v-if="message.role === 'user'"
            :md="message.displayText"
            class="max-w-4/5 rounded-md bg-zinc-100 px-3 dark:bg-zinc-700"
          />

          <!-- AI 消息 -->
          <div v-else class="w-full space-y-4">
            <Transition appear name="fade">
              <div
                v-if="
                  message.parts.some(
                    (p) =>
                      p.type === 'reasoning' || p.type === 'tool-webSearch',
                  )
                "
                class="rounded-md border border-zinc-200 text-xs text-zinc-400 dark:border-zinc-700 dark:text-zinc-500"
              >
                <button
                  class="flex w-full items-center justify-between gap-2 px-3 py-2.5 hover:text-zinc-500 dark:hover:text-zinc-400"
                  @click="toggleThinking(message.id)"
                >
                  <span
                    class="flex items-center gap-2"
                    :class="
                      isLoading &&
                      message === messages[messages.length - 1] &&
                      !message.parts.some((p) => p.type === 'text')
                        ? 'animate-pulse text-blue-400'
                        : ''
                    "
                  >
                    <i class="ri-brain-line text-sm"></i>
                    <span>
                      {{
                        isLoading &&
                        message === messages[messages.length - 1] &&
                        !message.parts.some((p) => p.type === 'text')
                          ? '思考中…'
                          : '思考过程'
                      }}
                    </span>
                  </span>
                  <i
                    class="ri-arrow-down-s-line text-sm transition-transform"
                    :class="
                      expandedThinking.has(message.id) ? 'rotate-180' : ''
                    "
                  ></i>
                </button>

                <div
                  class="grid transition-[grid-template-rows] duration-300 ease-in-out"
                  :class="
                    expandedThinking.has(message.id)
                      ? 'grid-rows-[1fr]'
                      : 'grid-rows-[0fr]'
                  "
                >
                  <div
                    class="overflow-hidden border-t transition-colors duration-300"
                    :class="
                      expandedThinking.has(message.id)
                        ? 'border-zinc-200 dark:border-zinc-700'
                        : 'border-transparent'
                    "
                  >
                    <div class="space-y-3 px-3 py-2.5">
                      <template v-for="(part, i) in message.parts" :key="i">
                        <p
                          v-if="part.type === 'reasoning'"
                          class="leading-relaxed whitespace-pre-wrap"
                        >
                          {{ part.text }}
                        </p>

                        <div
                          v-else-if="part.type === 'tool-webSearch'"
                          class="space-y-2"
                        >
                          <!-- 搜索状态行 -->
                          <div class="flex items-center gap-1.5">
                            <i
                              class="text-sm"
                              :class="
                                part.state === 'output-available'
                                  ? 'ri-check-line text-green-500'
                                  : 'ri-loader-4-line animate-spin'
                              "
                            ></i>
                            <span>
                              {{
                                part.state === 'output-available'
                                  ? `已搜索「${part.input?.query}」`
                                  : `正在搜索「${part.input?.query ?? '...'}」`
                              }}
                            </span>
                          </div>
                          <!-- 搜索结果卡片 -->
                          <div
                            v-if="
                              part.state === 'output-available' &&
                              Array.isArray(part.output) &&
                              part.output.length
                            "
                            class="grid grid-cols-2 gap-2"
                          >
                            <a
                              v-for="(result, ri) in part.output"
                              :key="ri"
                              :href="result.url"
                              target="_blank"
                              rel="noopener noreferrer"
                              class="group flex flex-col gap-0.5 rounded-sm border border-zinc-200 px-2 py-1.5 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:border-zinc-600 dark:hover:bg-zinc-700/30"
                            >
                              <span
                                class="truncate font-medium text-zinc-600 group-hover:text-zinc-800 dark:text-zinc-400 dark:group-hover:text-zinc-300"
                              >
                                {{ result.title }}
                              </span>
                              <span
                                class="truncate text-zinc-400 dark:text-zinc-600"
                              >
                                {{ getDomain(result.url) }}
                              </span>
                            </a>
                          </div>
                        </div>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>

            <UiMarkdown
              v-if="message.parts.some((p) => p.type === 'text')"
              :md="message.displayText"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div
        class="sticky bottom-0 space-y-4 bg-linear-to-b from-transparent via-white via-[32px] to-white pt-8 pb-4 dark:via-zinc-800 dark:to-zinc-800"
      >
        <UiMessage type="error" :text="errorMsg" />

        <div
          class="rounded-md border border-zinc-300 bg-white transition-all duration-300 focus-within:border-blue-400! focus-within:shadow-md focus-within:ring-3 focus-within:shadow-rose-500/20 focus-within:ring-blue-400/20 dark:border-zinc-600 dark:bg-zinc-800"
        >
          <textarea
            ref="inputRef"
            v-model="input"
            placeholder="今天也要开心呀！"
            rows="2"
            class="no-scrollbar max-h-60 w-full resize-none overflow-y-auto px-3 py-2 leading-6"
            @keydown.enter="handleKeydown"
          ></textarea>

          <div class="flex items-center gap-2 px-2 pb-2">
            <button
              class="btn-base h-7! w-auto! gap-2 rounded-sm! px-2 text-xs"
              @click="isModalShow = true"
            >
              <span>{{ AI_MODELS[modelType].name }}</span>
              <i class="ri-expand-up-down-line"></i>
            </button>

            <div
              v-if="credits"
              class="flex h-7 items-center rounded-sm bg-zinc-100 px-2 text-xs dark:bg-zinc-700"
            >
              $ {{ Number(credits.balance).toFixed(2) }}
            </div>

            <div class="flex-1"></div>

            <button
              class="h-7! w-7! rounded-sm! text-xs"
              :class="isLoading ? 'btn-base' : 'btn-primary'"
              :disabled="!isLoading && !input.trim()"
              @click="handleButtonClick"
            >
              <i
                :class="isLoading ? 'ri-stop-circle-line' : 'ri-arrow-up-line'"
              ></i>
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
const user = useSupabaseUser()

const { modelType, messages, status, chatError, sendMessage, stopMessage } =
  useChat()

// 思考块展开状态
const expandedThinking = reactive(new Set())
const toggleThinking = (id) => {
  if (expandedThinking.has(id)) {
    expandedThinking.delete(id)
  } else {
    expandedThinking.add(id)
  }
}

// 提取域名
const getDomain = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

const isLoading = computed(
  () => status.value === 'submitted' || status.value === 'streaming',
)

const input = ref('')
const inputRef = ref(null)
const isModalShow = ref(false)
const messageElements = ref([])
const errorMsg = ref('')

// 监听 AI SDK 错误
watch(chatError, (err) => {
  if (err) errorMsg.value = err.message
})

// 新消息时自动展开最新思考块（每条消息只处理一次，避免流式更新覆盖用户操作）
const seenMessages = new Set()
watch(
  messages,
  (val) => {
    const last = val[val.length - 1]
    if (last && last.role === 'assistant' && !seenMessages.has(last.id)) {
      seenMessages.add(last.id)
      expandedThinking.add(last.id)
    }
  },
  { deep: false },
)

const credits = ref(null)

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

  const lastUserMessageIndex = [...messages.value].findLastIndex(
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

// 按钮点击
const handleButtonClick = () => {
  if (isLoading.value) {
    stopMessage()
  } else {
    handleSubmit()
  }
}

// 提交
const handleSubmit = throttle(async () => {
  if (!input.value.trim() || isLoading.value) return

  errorMsg.value = ''

  const text = input.value
  input.value = ''

  // 先触发发送，用户消息会被同步加入列表
  const promise = sendMessage(text)

  // 等用户消息渲染并完成浏览器布局后再滚动到底部
  await nextTick()
  await new Promise((resolve) => requestAnimationFrame(resolve))
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: 'smooth',
  })

  // 等待 AI 回复完成
  await promise

  // AI 回复后滚动到最后一条用户消息位置
  if (!chatError.value) await scrollToLastUserMessage()
})

const getCredits = async () => {
  if (user.value?.app_metadata?.role !== 'admin') return null

  try {
    credits.value = await $fetch('/api/ai/credits', {
      method: 'GET',
    })
  } catch (error) {
    console.error('获取 AI Credits 失败', error)
  }
}

onMounted(() => {
  inputRef.value?.focus()
  getCredits()
})

useSeoMeta({ title: 'AI' })
</script>
