import { AI_MODELS } from '~/utils/ai'

export default defineEventHandler(async (event) => {
  const { model, messages } = await readBody(event)

  const config = useRuntimeConfig()
  const provider = AI_MODELS[model]?.provider

  setResponseStatus(event, 200)
  setHeader(event, 'Content-Type', 'text/event-stream')
  setHeader(event, 'Cache-Control', 'no-cache')
  setHeader(event, 'Connection', 'keep-alive')

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
        stream: true,
      }),
    },
  )

  return sendStream(event, response.body)
})
