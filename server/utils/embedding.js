export async function generateEmbedding(text) {
  try {
    const config = useRuntimeConfig()

    const data = await $fetch('https://api.jina.ai/v1/embeddings', {
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

    return data.data[0].embedding
  } catch (error) {
    if (error) throw error
  }
}
