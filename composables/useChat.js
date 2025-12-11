const MODELS = {
  'gemini-2.5-flash-lite': 'Gemini 2.5 Flash Lite',
  'gemini-3-pro-preview': 'Gemini 3 Pro Preview',
  'claude-3-haiku': 'Claude 3 Haiku',
  'claude-sonnet-4.5': 'Claude Sonnet 4.5',
  'gpt-5-nano': 'GPT 5 Nano',
  'grok-4.1-fast-reasoning': 'Grok 4.1 Fast Reasoning',
  'deepseek-v3.2': 'DeepSeek 3.2',
}

export const useChat = (defaultPrompt = '') => {
  const models = MODELS
  const modelType = ref(Object.keys(MODELS)[0])
  const messages = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const abortController = ref(null)

  const sendMessage = async (content) => {
    error.value = null
    abortController.value = new AbortController()

    const userMessage = { role: 'user', content }

    messages.value.push(userMessage)

    try {
      isLoading.value = true

      const response = await $fetch('/api/ai/chat', {
        method: 'POST',
        body: {
          messages: [
            ...(defaultPrompt
              ? [{ role: 'system', content: defaultPrompt }]
              : []),
            ...messages.value,
          ],
          model: modelType.value,
        },
        signal: abortController.value.signal,
      })

      // 成功后添加 AI 回复
      messages.value.push({
        role: 'assistant',
        content: response.content,
      })
    } catch (err) {
      // 失败时移除用户消息
      messages.value.pop()
      error.value =
        err.name === 'AbortError'
          ? '请求已取消'
          : err.data?.message || err.message || '请求失败'
    } finally {
      isLoading.value = false
      abortController.value = null
    }
  }

  const clearMessages = () => {
    messages.value = []
    error.value = null
  }

  return {
    models,
    modelType,
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  }
}
