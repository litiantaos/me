// POST /api/note/add
// Authorization: Bearer <NOTE_API_TOKEN>
// Body: { content: string, user_id: string }
// Returns: { id, content, created_at }

import { timingSafeEqual, createHash } from 'node:crypto'
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // 验证 API Token
  const authHeader = getHeader(event, 'authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const expected = config.noteApiToken

  if (!token || !expected) {
    throw createError({ statusCode: 401, statusMessage: '未授权' })
  }

  const tokenBuf = createHash('sha256').update(token).digest()
  const expectedBuf = createHash('sha256').update(expected).digest()
  if (!timingSafeEqual(tokenBuf, expectedBuf)) {
    throw createError({ statusCode: 401, statusMessage: '未授权' })
  }

  // 解析请求体
  const body = await readBody(event)

  if (typeof body?.content !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'content 必须为字符串',
    })
  }
  const content = body.content.trim()

  if (!content) {
    throw createError({ statusCode: 400, statusMessage: '内容不能为空' })
  }

  const userId = typeof body.user_id === 'string' ? body.user_id.trim() : ''
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      userId,
    )
  ) {
    throw createError({ statusCode: 400, statusMessage: 'user_id 格式不合法' })
  }

  if (content.length > 100000) {
    throw createError({
      statusCode: 400,
      statusMessage: '内容超出最大长度限制',
    })
  }

  // 生成语义向量（失败不阻断发布）
  let embedding = null
  try {
    embedding = await generateEmbedding(content)
  } catch {}

  // 写入 Supabase 数据库
  const client = serverSupabaseServiceRole(event)
  const { data, error } = await client
    .from('notes')
    .insert({ content, embedding, user_id: userId })
    .select('id, content, created_at')
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: '保存失败' })
  }

  return data
})
