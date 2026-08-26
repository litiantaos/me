import { Chat } from '@ai-sdk/vue'
import { DefaultChatTransport } from 'ai'

export const useChat = (defaultPrompt = '') => {
  const modelType = ref(Object.keys(AI_MODELS)[0])

  const chat = new Chat({
    transport: new DefaultChatTransport({
      api: '/api/ai/chat',
      body: () => ({
        model: modelType.value,
        ...(defaultPrompt ? { systemPrompt: defaultPrompt } : {}),
      }),
    }),
  })

  // 打字机效果
  const typedTexts = ref({}) // messageId -> 已显示文本
  const queues = {} // messageId -> 待显示文本
  const typing = new Set()

  const getFullText = (msg) =>
    msg.parts
      .filter((p) => p.type === 'text')
      .map((p) => p.text)
      .join('')

  const typeWriter = (id) => {
    const pending = queues[id]
    if (!pending?.length) {
      typing.delete(id)
      return
    }
    const step = pending.length < 20 ? 1 : Math.ceil(pending.length / 30)
    typedTexts.value[id] = (typedTexts.value[id] ?? '') + pending.slice(0, step)
    queues[id] = pending.slice(step)
    requestAnimationFrame(() => typeWriter(id))
  }

  // 流式传输时逐字追加队列
  watch(
    () => chat.messages,
    (msgs) => {
      if (chat.status !== 'streaming') return
      msgs.forEach((msg) => {
        if (msg.role !== 'assistant') return
        const full = getFullText(msg)
        const shown = typedTexts.value[msg.id] ?? ''
        const queued = queues[msg.id] ?? ''
        const newText = full.slice(shown.length + queued.length)
        if (!newText) return
        queues[msg.id] = queued + newText
        if (!typing.has(msg.id)) {
          typing.add(msg.id)
          requestAnimationFrame(() => typeWriter(msg.id))
        }
      })
    },
    { deep: true },
  )

  // 流结束后立即补全剩余文本
  watch(
    () => chat.status,
    (status) => {
      if (status !== 'ready' && status !== 'error') return
      chat.messages.forEach((msg) => {
        if (msg.role !== 'assistant') return
        typedTexts.value[msg.id] = getFullText(msg)
        // 清理已完成的打字队列，避免键随会话无限累积
        delete queues[msg.id]
        typing.delete(msg.id)
      })
    },
  )

  const messages = computed(() =>
    chat.messages.map((msg) => ({
      ...msg,
      displayText:
        msg.role === 'user'
          ? getFullText(msg)
          : (typedTexts.value[msg.id] ?? getFullText(msg)),
    })),
  )

  return {
    modelType,
    messages,
    status: computed(() => chat.status),
    chatError: computed(() => chat.error),
    sendMessage: (content) => chat.sendMessage({ text: content }),
    stopMessage: () => chat.stop(),
  }
}
