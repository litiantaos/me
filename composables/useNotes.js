export const useNotes = () => {
  const client = useSupabaseClient()

  const notes = useState('notes', () => [])
  const hasMoreNotes = useState('hasMoreNotes', () => true)
  const page = useState('notePage', () => 0)
  const pageSize = 20

  const isNotesFetching = useState('notesFetching', () => false)
  const isNoteFetching = useState('noteFetching', () => false)
  const isDeleting = useState('deleting', () => false)

  // 获取笔记列表
  const fetchNotes = async () => {
    isNotesFetching.value = true

    const { data, error } = await client
      .from('notes')
      .select('id, content, user_id, created_at, updated_at')
      .order('created_at', { ascending: false })
      .range(page.value * pageSize, (page.value + 1) * pageSize - 1)

    if (error) throw error

    // 如果返回数据少于页大小，则无更多数据
    if (data.length < pageSize) {
      hasMoreNotes.value = false
    }

    // 追加数据
    notes.value = [...notes.value, ...data]

    // 更新页码
    page.value++

    isNotesFetching.value = false
  }

  // 刷新笔记列表
  const refreshNotes = async () => {
    notes.value = []
    hasMoreNotes.value = true
    page.value = 0

    await fetchNotes()
  }

  // 获取笔记
  const fetchNote = async (noteId) => {
    isNoteFetching.value = true

    const { data, error } = await client
      .from('notes')
      .select('id, content, user_id, created_at, updated_at')
      .eq('id', noteId)
      .single()

    if (error) throw error

    isNoteFetching.value = false

    return data
  }

  // 删除笔记
  const deleteNote = async (noteId, userId) => {
    isDeleting.value = true

    const { error } = await client
      .from('notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', userId)

    if (error) throw error

    if (notes.value.length > 0) {
      notes.value = notes.value.filter((note) => note.id !== noteId)
    }

    isDeleting.value = false
  }

  return {
    notes,
    hasMoreNotes,
    isNotesFetching,
    isNoteFetching,
    isDeleting,
    fetchNotes,
    refreshNotes,
    fetchNote,
    deleteNote,
  }
}
