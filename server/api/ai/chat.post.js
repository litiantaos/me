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
    const config = useRuntimeConfig()

    const { messages, model } = await readBody(event)

    const provider = PROVIDERS[model] ?? PROVIDERS['gemini-2.5-flash-lite']

    const data = await $fetch(
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

    return {
      content: data.choices[0].message.content,
      model: provider,
    }
  } catch (error) {
    if (error) throw error
  }
})
