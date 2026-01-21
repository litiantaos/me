export const useHobby = () => {
  const client = useSupabaseClient()
  const user = useSupabaseUser()

  const hobbies = useState('hobbies', () => [])

  const isFetching = useState('fetching', () => false)
  const isSearching = useState('searching', () => false)
  const isAdding = useState('adding', () => false)
  const isDeleting = useState('deleting', () => false)

  const fetchHobbyRecords = async () => {
    isFetching.value = true

    const { data, error } = await client
      .from('hobbies')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error

    hobbies.value = data
    isFetching.value = false
  }

  const fetchHobbyRecordsByHobbyId = async (hobbyId) => {
    const { data, error } = await client
      .from('hobbies')
      .select('*')
      .eq('hobby_id', hobbyId)
      .order('date', { ascending: false })

    if (error) throw error

    return data
  }

  const addHobbyRecord = async (record, recordId) => {
    isAdding.value = true

    if (recordId) {
      // 更新
      const { error } = await client.from('hobbies').update({
        date: record.date,
        channel: record.channel,
        rating: record.rating,
      })

      if (error) throw error
    } else {
      // 新增
      const { error } = await client.from('hobbies').insert({
        user_id: user.value.sub,
        ...record,
      })

      if (error) throw error
    }

    isAdding.value = false

    fetchHobbyRecords()
  }

  const deleteHobbyRecord = async (recordId) => {
    isDeleting.value = true

    const { error } = await client
      .from('hobbies')
      .delete()
      .eq('id', recordId)
      .eq('user_id', user.value.sub)

    if (error) throw error

    isDeleting.value = false
  }

  const searchHobbies = async (type = 'video', query) => {
    isSearching.value = true

    try {
      if (type === 'game') {
        return await $fetch(`/api/igdb/search?term=${query}`)
      }

      const { results } = await $fetch(`/api/tmdb/search/multi?query=${query}`)
      return results
    } catch (error) {
      console.error('搜索失败', error)
      return []
    } finally {
      isSearching.value = false
    }
  }

  const fetchHobbyDetail = (type, id) => {
    try {
      if (type === 'game') {
        return $fetch(`/api/igdb/${id}`)
      }
      return $fetch(`/api/tmdb/${type}/${id}`)
    } catch (error) {
      console.error('获取失败', error)
    }
  }

  const fetchHobbyCredits = (type, id) => {
    if (type === 'game') return {}

    try {
      return $fetch(`/api/tmdb/${type}/${id}/credits`)
    } catch (error) {
      console.error('获取演职员失败', error)
    }
  }

  return {
    hobbies,
    isFetching,
    isSearching,
    isAdding,
    isDeleting,
    fetchHobbyRecords,
    fetchHobbyRecordsByHobbyId,
    addHobbyRecord,
    deleteHobbyRecord,
    searchHobbies,
    fetchHobbyDetail,
    fetchHobbyCredits,
  }
}
