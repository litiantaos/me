export const useChat = (defaultPrompt = '') => {
  const messages = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const modelType = ref('deepseek')

  const config = useRuntimeConfig()

  // 角色映射配置
  const ROLE_MAPPINGS = {
    deepseek: {
      prompt: 'system',
      user: 'user',
      model: 'assistant',
    },
    gemini: {
      prompt: 'user',
      user: 'user',
      model: 'model',
    },
  }

  // 切换模型类型
  const switchModel = (model) => {
    modelType.value = model
  }

  const sendMessage = async (content) => {
    try {
      isLoading.value = true
      error.value = null

      // 添加用户消息
      messages.value.push({
        role: 'user',
        content,
      })

      // 准备消息历史
      const historyMessages = [
        ...(defaultPrompt ? [{ role: 'prompt', content: defaultPrompt }] : []),
        ...messages.value,
      ]

      // 统一消息格式转换
      const formatMessages = (targetModel) => {
        return historyMessages.map((msg) => {
          const mappedRole = ROLE_MAPPINGS[targetModel][msg.role] || msg.role

          if (targetModel === 'deepseek') {
            return {
              role: mappedRole,
              content: msg.content,
            }
          } else if (targetModel === 'gemini') {
            return {
              role: mappedRole,
              parts: [{ text: msg.content }],
            }
          }
        })
      }

      // 根据不同模型构造请求参数
      const requestConfig = {
        deepseek: {
          url: 'https://api.deepseek.com/v1/chat/completions',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.public.deepseekApiKey}`,
          },
          body: {
            model: 'deepseek-chat',
            messages: formatMessages('deepseek'),
          },
        },
        gemini: {
          url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': config.public.geminiApiKey,
          },
          body: {
            contents: formatMessages('gemini'),
          },
        },
      }

      const currentConfig = requestConfig[modelType.value]
      const response = await fetch(currentConfig.url, {
        method: 'POST',
        headers: currentConfig.headers,
        body: JSON.stringify(currentConfig.body),
      })

      if (!response.ok) {
        throw new Error(`${modelType.value.toUpperCase()} API 请求失败`)
      }

      const data = await response.json()
      const aiResponse =
        modelType.value === 'deepseek'
          ? data.choices[0].message.content
          : data.candidates[0].content.parts[0].text

      // 添加AI回复
      messages.value.push({
        role: 'model',
        content: aiResponse,
      })

      console.log(messages.value)
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
    modelType,
    sendMessage,
    clearMessages,
    switchModel,
  }
}
