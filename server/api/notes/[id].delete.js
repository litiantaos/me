import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const noteId = getRouterParam(event, 'id')

  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  const { error } = await client
    .from('notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', user.sub)

  if (error) throw error

  return { success: true }
})
