export const useNotes = () => {
  const client = useSupabaseClient()
  const user = useSupabaseUser()

  const notes = useState('notes', () => [])
  const hasMoreNotes = useState('hasMoreNotes', () => true)
  const page = useState('notePage', () => 0)
  const pageSize = 20

  const isNotesFetching = useState('notesFetching', () => false)
  const isNoteFetching = useState('noteFetching', () => false)
  const isSaving = useState('noteSaving', () => false)
  const isDeleting = useState('noteDeleting', () => false)

  // 获取笔记列表
  const fetchNotes = async () => {
    isNotesFetching.value = true

    try {
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
    } catch (error) {
      throw error
    } finally {
      isNotesFetching.value = false
    }
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

    try {
      const { data, error } = await client
        .from('notes')
        .select('id, content, user_id, created_at, updated_at')
        .eq('id', noteId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw error
    } finally {
      isNoteFetching.value = false
    }
  }

  // 获取所有笔记指定字段数据
  const fetchNotesData = async (fields = 'created_at') => {
    try {
      const { data, error } = await client
        .from('notes')
        .select(fields)
        .eq('user_id', user.value.sub)
        .order('created_at', { ascending: true })

      if (error) throw error

      return data
    } catch (error) {
      throw error
    }
  }

  // 保存笔记
  const saveNote = async (content, noteId = null) => {
    isSaving.value = true

    try {
      await $fetch('/api/notes/save', {
        method: 'POST',
        body: { content, noteId },
      })
    } catch (error) {
      throw error
    } finally {
      isSaving.value = false
    }
  }

  // 删除笔记
  const deleteNote = async (noteId) => {
    isDeleting.value = true

    try {
      await $fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      })

      if (notes.value.length > 0) {
        notes.value = notes.value.filter((note) => note.id !== noteId)
      }
    } catch (error) {
      throw error
    } finally {
      isDeleting.value = false
    }
  }

  return {
    notes,
    hasMoreNotes,
    isNotesFetching,
    isNoteFetching,
    isSaving,
    isDeleting,
    fetchNotes,
    refreshNotes,
    fetchNote,
    fetchNotesData,
    saveNote,
    deleteNote,
  }
}
