import { AI_MODELS } from '~/utils/ai'

export default defineEventHandler(async (event) => {
  const { model, messages } = await readBody(event)

  const config = useRuntimeConfig()
  const provider = AI_MODELS[model]?.provider

  const response = await $fetch(
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
    model: provider,
    content: response.choices[0].message.content,
  }
})
