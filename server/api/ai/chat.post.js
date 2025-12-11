const PROVIDERS = {
  'gemini-2.5-flash-lite': 'google/gemini-2.5-flash-lite',
  'gemini-3-pro-preview': 'google/gemini-3-pro-preview',
  'claude-3-haiku': 'anthropic/claude-3-haiku',
  'claude-sonnet-4.5': 'anthropic/claude-sonnet-4.5',
  'gpt-5-nano': 'openai/gpt-5-nano',
  'grok-4.1-fast-reasoning': 'xai/grok-4.1-fast-reasoning',
  'deepseek-v3.2': 'deepseek/deepseek-v3.2',
}

export default defineEventHandler(async (event) => {
  try {
    const { messages, model } = await readBody(event)

    // 验证输入
    if (!messages || !Array.isArray(messages)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid messages format',
      })
    }

    const config = useRuntimeConfig()
    const provider = PROVIDERS[model] ?? PROVIDERS['gemini-2.5-flash-lite']

    // 调用 AI Gateway
    const response = await fetch(
      'https://ai-gateway.vercel.sh/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.aiGatewayApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: provider,
          messages,
          stream: false,
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw createError({
        statusCode: response.status,
        message: `AI Gateway (${model}): ${errorData.error?.message || errorData.message || response.statusText}`,
      })
    }

    const data = await response.json()

    return {
      content: data.choices[0].message.content,
      model: provider,
    }
  } catch (error) {
    // 结构化错误直接抛出
    if (error.statusCode) throw error

    // 其他错误包装为 500
    throw createError({
      statusCode: 500,
      message: error.message || 'Internal server error',
    })
  }
})
