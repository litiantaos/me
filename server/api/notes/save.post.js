import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const { content, noteId } = await readBody(event)

  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  const embedding = await generateEmbedding(content)

  if (noteId) {
    // 更新
    const { error } = await client
      .from('notes')
      .update({ content, embedding })
      .eq('id', noteId)
      .eq('user_id', user.sub)

    if (error) throw error
  } else {
    // 新建
    const { error } = await client
      .from('notes')
      .insert({ content, embedding, user_id: user.sub })

    if (error) throw error
  }

  return { success: true }
})
