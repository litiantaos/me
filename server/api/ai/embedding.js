import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '未登录' })
  }
  checkRateLimit(`ai:embedding:${user.sub}`, 30, 60000)

  const { content } = await readBody(event)
  if (
    typeof content !== 'string' ||
    !content.trim() ||
    content.length > 100000
  ) {
    throw createError({ statusCode: 400, statusMessage: 'content 不合法' })
  }

  return generateEmbedding(content)
})
