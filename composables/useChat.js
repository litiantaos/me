export const useChat = (defaultPrompt = '') => {
  const modelType = ref(Object.keys(AI_MODELS)[0])
  const messages = ref([])
  const abortController = ref(null)

  let queue = ''
  let isTyping = false

  const typeWriter = () => {
    if (queue.length > 0) {
      const step = queue.length < 20 ? 1 : Math.ceil(queue.length / 30)

      const chunk = queue.slice(0, step)

      const currentMsg = messages.value[messages.value.length - 1]
      if (currentMsg) {
        currentMsg.content += chunk
      }

      queue = queue.slice(step)
      requestAnimationFrame(typeWriter)
    } else {
      isTyping = false
    }
  }

  const sendMessage = async (content) => {
    abortController.value = new AbortController()
    messages.value.push({ role: 'user', content })

    queue = ''
    isTyping = false

    try {
      const stream = await $fetch('/api/ai/chat', {
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
        responseType: 'stream',
        signal: abortController.value.signal,
      })

      const reader = stream.getReader()
      const decoder = new TextDecoder()

      let buffer = ''
      let hasResponseStarted = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              break
            } else if (data.trim()) {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) {
                if (!hasResponseStarted) {
                  hasResponseStarted = true
                  messages.value.push({ role: 'assistant', content: '' })
                }

                queue += content

                if (!isTyping) {
                  isTyping = true
                  typeWriter()
                }
              }
            }
          }
        }
      }
    } catch (error) {
      queue = ''
      isTyping = false

      if (error.name !== 'AbortError' && hasResponseStarted) {
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
      abortController.value = null
    }

    isTyping = false
    queue = ''
  }

  return {
    modelType,
    messages,
    sendMessage,
    stopMessage,
  }
}
