export const useChat = (defaultPrompt = '') => {
  const modelType = ref(Object.keys(AI_MODELS)[0])
  const messages = ref([])
  const abortController = ref(null)

  const sendMessage = async (content) => {
    abortController.value = new AbortController()
    messages.value.push({ role: 'user', content })

    let assistantIndex = -1
    const pendingQueue = []
    let isStreaming = false

    // 平滑输出函数
    const processQueue = () => {
      if (pendingQueue.length === 0) {
        isStreaming = false
        return
      }

      isStreaming = true
      // 动态调整每次输出的字符数，队列越长输出越快，避免堆积
      const count = Math.max(1, Math.floor(pendingQueue.length / 60))
      const chunk = pendingQueue.splice(0, count).join('')

      if (assistantIndex === -1) {
        assistantIndex = messages.value.length
        messages.value.push({ role: 'assistant', content: chunk })
      } else {
        messages.value[assistantIndex].content += chunk
      }

      requestAnimationFrame(processQueue)
    }

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelType.value,
          messages: [
            ...(defaultPrompt
              ? [{ role: 'system', content: defaultPrompt }]
              : []),
            ...messages.value,
          ],
        }),
        signal: abortController.value.signal,
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk
        const lines = buffer.split('\n')

        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            const json = JSON.parse(data)
            const delta = json.choices?.[0]?.delta?.content
            if (delta) {
              pendingQueue.push(...delta.split(''))
              if (!isStreaming) processQueue()
            }
          }
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError' && assistantIndex !== -1) {
        messages.value.pop()
      }
      throw error
    } finally {
      abortController.value = null
    }
  }

  const stopMessage = () => {
    if (abortController.value) {
      abortController.value.abort()
    }
  }

  return {
    modelType,
    messages,
    sendMessage,
    stopMessage,
  }
}
