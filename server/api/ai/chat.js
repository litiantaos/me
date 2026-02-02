import { AI_MODELS } from '~/utils/ai'

export default defineEventHandler(async (event) => {
  const { model, messages } = await readBody(event)
  const { aiGatewayApiKey } = useRuntimeConfig()

  const response = await $fetch(
    'https://ai-gateway.vercel.sh/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${aiGatewayApiKey}`,
      },
      body: {
        model: AI_MODELS[model]?.provider,
        messages,
        stream: true,
      },
      responseType: 'stream',
    },
  )

  return sendStream(event, response)
})
