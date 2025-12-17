import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: '请先登录' })
  }

  const { noteId } = await readBody(event)
  if (!noteId) {
    throw createError({ statusCode: 400, message: '笔记 ID 不能为空' })
  }

  const client = await serverSupabaseClient(event)

  // 验证笔记所有权并删除
  const { error } = await client
    .from('notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', user.sub)

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return { success: true }
})
