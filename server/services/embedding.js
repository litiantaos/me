export async function generateEmbedding(text) {
  if (!text?.trim()) {
    throw new Error('generateEmbedding: text 不能为空')
  }

  const config = useRuntimeConfig()

  const response = await fetch('https://api.jina.ai/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.jinaApiKey}`,
    },
    body: JSON.stringify({
      model: 'jina-embeddings-v3',
      task: 'text-matching',
      truncate: true,
      dimensions: 512,
      input: [text],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Jina API 错误: ${response.status} ${errorText}`)
  }

  const data = await response.json()

  if (!data?.data?.[0]?.embedding) {
    throw new Error('Jina 返回格式异常')
  }

  return data.data[0].embedding
}
