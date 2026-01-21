export const useChat = (defaultPrompt = '') => {
  const modelType = ref(Object.keys(AI_MODELS)[0])
  const messages = ref([])
  const abortController = ref(null)

  const sendMessage = async (content) => {
    abortController.value = new AbortController()
    messages.value.push({ role: 'user', content })

    try {
      const response = await $fetch('/api/ai/chat', {
        method: 'POST',
        body: {
          model: modelType.value,
          messages: [
            ...(defaultPrompt
              ? [{ role: 'system', content: defaultPrompt }]
              : []),
            ...messages.value,
          ],
        },
        signal: abortController.value.signal,
      })

      messages.value.push({
        role: 'assistant',
        content: response.content,
      })
    } catch (error) {
      throw error
    } finally {
      abortController.value = null
    }
  }

  return {
    modelType,
    messages,
    sendMessage,
  }
}
