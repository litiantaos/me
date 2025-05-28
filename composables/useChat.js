export const useChat = (defaultPrompt = '') => {
  const messages = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const config = useRuntimeConfig()

  const sendMessage = async (content) => {
    try {
      isLoading.value = true
      error.value = null

      // 添加用户消息
      messages.value.push({
        role: 'user',
        content,
      })

      // 准备发送给API的消息历史
      const apiMessages = [
        ...(defaultPrompt ? [{ role: 'system', content: defaultPrompt }] : []),
        ...messages.value,
      ]

      const response = await fetch(
        'https://api.deepseek.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.public.deepseekApiKey}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: apiMessages,
            temperature: 0.7,
          }),
        },
      )

      if (!response.ok) {
        throw new Error('API请求失败')
      }

      const data = await response.json()
      const aiResponse = data.choices[0].message.content

      // 添加AI回复
      messages.value.push({
        role: 'assistant',
        content: aiResponse,
      })
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const clearMessages = () => {
    messages.value = []
    error.value = null
  }

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  }
}
