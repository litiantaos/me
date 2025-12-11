import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { generateEmbedding } from '../../services/embedding'

// 保存笔记并生成 embedding
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: '请先登录' })
  }

  const { content, noteId } = await readBody(event)
  if (!content?.trim()) {
    throw createError({ statusCode: 400, message: '内容不能为空' })
  }

  const client = await serverSupabaseClient(event)

  // 生成 embedding，失败时记录警告但不阻止保存
  let embedding = null
  try {
    embedding = await generateEmbedding(content)
  } catch (e) {
    console.warn('Embedding 生成失败：', e.message)
  }

  if (noteId) {
    // 编辑模式：验证笔记所有权
    const { data: existing } = await client
      .from('notes')
      .select('user_id')
      .eq('id', noteId)
      .single()

    if (!existing || existing.user_id !== user.id) {
      throw createError({ statusCode: 403, message: '无权编辑内容' })
    }

    const { data, error } = await client
      .from('notes')
      .update({ content, embedding })
      .eq('id', noteId)
      .select()
      .single()

    if (error) throw createError({ statusCode: 500, message: error.message })
    return { note: data }
  } else {
    // 新建模式
    const { data, error } = await client
      .from('notes')
      .insert({ content, embedding, user_id: user.id })
      .select()
      .single()

    if (error) throw createError({ statusCode: 500, message: error.message })
    return { note: data }
  }
})
