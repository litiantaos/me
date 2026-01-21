export async function generateEmbedding(text) {
  const config = useRuntimeConfig()

  const response = await $fetch('https://api.jina.ai/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.jinaApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'jina-embeddings-v3',
      task: 'text-matching',
      truncate: true,
      dimensions: 512,
      input: [text],
    }),
  })

  return response.data[0].embedding
}
