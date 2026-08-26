// 调用 AI Gateway 生成 512 维语义向量，供 /api/ai/embedding 与笔记发布共用
export const generateEmbedding = async (content) => {
  const { aiGatewayApiKey } = useRuntimeConfig()

  let response
  try {
    response = await $fetch('https://ai-gateway.vercel.sh/v1/embeddings', {
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
  } catch {
    throw createError({ statusCode: 502, statusMessage: '向量服务不可用' })
  }

  const embedding = response.data?.[0]?.embedding
  if (!embedding) {
    throw createError({ statusCode: 502, statusMessage: '向量生成失败' })
  }

  return embedding
}
