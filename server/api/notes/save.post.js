import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  const { content, noteId } = await readBody(event)

  let embedding = null

  try {
    embedding = await generateEmbedding(content)
  } catch (error) {
    if (error) throw error
  }

  if (noteId) {
    // 更新
    const { error } = await client
      .from('notes')
      .update({ content, embedding })
      .eq('id', noteId)
      .select()
      .single()

    if (error) throw error
  } else {
    // 新建
    const { error } = await client
      .from('notes')
      .insert({ content, embedding, user_id: user.sub })
      .select()
      .single()

    if (error) throw error
  }
})
