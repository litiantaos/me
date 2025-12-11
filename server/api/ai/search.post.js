import { serverSupabaseClient } from '#supabase/server'
import { generateEmbedding } from '../../services/embedding'

export default defineEventHandler(async (event) => {
  const { query } = await readBody(event)

  if (!query?.trim()) {
    throw createError({ statusCode: 400, message: '搜索内容不能为空' })
  }

  let queryEmbedding
  try {
    queryEmbedding = await generateEmbedding(query)
  } catch (e) {
    throw createError({ statusCode: 500, message: 'Embedding 生成失败' })
  }

  const client = await serverSupabaseClient(event)

  const { data, error } = await client.rpc('hybrid_search_notes', {
    query_text: query,
    query_embedding: queryEmbedding,
    match_count: 20,
    full_text_weight: 1.0, // 全文搜索权重
    semantic_weight: 1.0, // 语义搜索权重
    rrf_k: 50, // RRF 平滑常数
  })

  if (error) {
    console.error('RPC 调用错误:', error)
    throw createError({ statusCode: 500, message: error.message })
  }

  return { results: data || [] }
})
