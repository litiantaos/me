export const useNotes = () => {
  const notes = useState('notes', () => [])
  const isLoading = useState('isLoading', () => false)
  const hasMoreNotes = useState('hasMoreNotes', () => true)
  const page = useState('notePage', () => 0)
  const pageSize = 20

  // 获取笔记列表
  const fetchNotes = async () => {
    // 首次加载或刷新时重置page
    if (notes.value.length === 0) {
      page.value = 0
    }

    if (!hasMoreNotes.value && notes.value.length > 0) return notes.value

    isLoading.value = true

    try {
      const client = useSupabaseClient()
      const { data, error } = await client
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false })
        .range(page.value * pageSize, (page.value + 1) * pageSize - 1)

      if (error) throw error

      // 如果返回的数据少于页大小，说明没有更多数据了
      if (data.length < pageSize) {
        hasMoreNotes.value = false
      }

      // 如果是第一页，直接替换；否则追加
      if (page.value === 0) {
        notes.value = data
      } else {
        notes.value = [...notes.value, ...data]
      }

      // 更新页码
      page.value++
    } catch (error) {
      console.error('获取笔记失败', error)
      if (page.value === 0) {
        notes.value = []
      }
    } finally {
      isLoading.value = false
    }

    return notes.value
  }

  // 刷新笔记列表
  const refreshNotes = () => {
    notes.value = []
    hasMoreNotes.value = true
    page.value = 0
    return fetchNotes()
  }

  return {
    notes,
    isLoading,
    hasMoreNotes,
    fetchNotes,
    refreshNotes,
  }
}
