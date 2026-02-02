export default defineEventHandler(async (event) => {
  const { content } = await readBody(event)
  const { aiGatewayApiKey } = useRuntimeConfig()

  const response = await $fetch('https://ai-gateway.vercel.sh/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${aiGatewayApiKey}`,
    },
    body: {
      model: 'openai/text-embedding-3-small',
      input: content,
      dimensions: 512,
    },
  })

  return response.data[0].embedding
})
