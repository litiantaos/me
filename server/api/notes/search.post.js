import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const { query } = await readBody(event)

  const client = await serverSupabaseClient(event)
  const queryEmbedding = await generateEmbedding(query)

  const { data, error } = await client.rpc('hybrid_search_notes', {
    query_text: query,
    query_embedding: queryEmbedding,
    match_count: 20,
    full_text_weight: 1.0, // 全文搜索权重
    semantic_weight: 1.0, // 语义搜索权重
    rrf_k: 50, // RRF 平滑常数
  })

  if (error) throw error

  return { results: data }
})
