export const useNotes = () => {
  const client = useSupabaseClient()

  const notes = useState('notes', () => [])
  const isLoading = useState('isLoading', () => false)
  const hasMoreNotes = useState('hasMoreNotes', () => true)
  const page = useState('notePage', () => 0)
  const pageSize = 20

  // 获取笔记列表
  const fetchNotes = async () => {
    isLoading.value = true

    try {
      const { data, error } = await client
        .from('notes')
        .select('*')
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
    } catch (error) {
      console.error('获取笔记失败', error)
    } finally {
      isLoading.value = false
    }
  }

  // 刷新笔记列表
  const refreshNotes = async () => {
    notes.value = []
    hasMoreNotes.value = true
    page.value = 0

    await fetchNotes()
  }

  return {
    notes,
    isLoading,
    hasMoreNotes,
    fetchNotes,
    refreshNotes,
  }
}
