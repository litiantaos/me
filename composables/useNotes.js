export const useNotes = () => {
  const client = useSupabaseClient()
  const user = useSupabaseUser()

  const notes = useState('notes', () => [])
  const hasMoreNotes = useState('hasMoreNotes', () => true)
  const page = useState('notePage', () => 0)
  const pageSize = 20

  const isNotesFetching = useState('notesFetching', () => false)
  const isNoteFetching = useState('noteFetching', () => false)
  const isDeleting = useState('noteDeleting', () => false)

  // 获取笔记列表
  const fetchNotes = async () => {
    isNotesFetching.value = true

    const from = page.value * pageSize
    const to = from + pageSize - 1

    const { data, error } = await client
      .from('notes')
      .select('id, content, user_id, created_at, updated_at')
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    notes.value = [...notes.value, ...data]
    hasMoreNotes.value = data.length === pageSize
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

  // 获取单个笔记
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

  // 获取所有笔记指定字段数据
  const fetchNotesData = async (fields = 'created_at') => {
    const { data, error } = await client
      .from('notes')
      .select(fields)
      .eq('user_id', user.value.sub)
      .order('created_at', { ascending: true })

    if (error) throw error

    return data
  }

  // 保存笔记
  const saveNote = async (content, noteId) => {
    try {
      const embedding = await $fetch('/api/ai/embedding', {
        method: 'POST',
        body: { content },
      })

      if (noteId) {
        // 更新
        const { error } = await client
          .from('notes')
          .update({ content, embedding })
          .eq('id', noteId)
          .eq('user_id', user.value.sub)

        if (error) throw error
      } else {
        // 新建
        const { error } = await client
          .from('notes')
          .insert({ content, embedding, user_id: user.value.sub })

        if (error) throw error
      }
    } catch (error) {
      throw error
    }
  }

  // 搜索笔记
  const searchNotes = async (query) => {
    isNotesFetching.value = true

    try {
      const embedding = await $fetch('/api/ai/embedding', {
        method: 'POST',
        body: { content: query },
      })

      const { data, error } = await client.rpc('hybrid_search_notes', {
        query_text: query,
        query_embedding: embedding,
        match_count: 20,
        full_text_weight: 1.0, // 全文搜索权重
        semantic_weight: 1.0, // 语义搜索权重
        rrf_k: 50, // RRF 平滑常数
      })

      if (error) throw error

      return data
    } catch (error) {
      throw error
    } finally {
      isNotesFetching.value = false
    }
  }

  // 删除笔记
  const deleteNote = async (noteId) => {
    isDeleting.value = true

    const { error } = await client
      .from('notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', user.value.sub)

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
    fetchNotesData,
    saveNote,
    searchNotes,
    deleteNote,
  }
}
