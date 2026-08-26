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

    try {
      const { data, error } = await client
        .from('hobbies')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error

      hobbies.value = data
    } finally {
      isFetching.value = false
    }
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

    try {
      if (recordId) {
        const { error } = await client
          .from('hobbies')
          .update({
            date: record.date,
            channel: record.channel,
            rating: record.rating,
          })
          .eq('id', recordId)
          .eq('user_id', user.value.sub)

        if (error) throw error
      } else {
        const { error } = await client.from('hobbies').insert({
          user_id: user.value.sub,
          ...record,
        })

        if (error) throw error
      }
    } finally {
      isAdding.value = false
    }

    fetchHobbyRecords().catch(() => {})
  }

  const deleteHobbyRecord = async (recordId) => {
    isDeleting.value = true

    try {
      const { error } = await client
        .from('hobbies')
        .delete()
        .eq('id', recordId)
        .eq('user_id', user.value.sub)

      if (error) throw error
    } finally {
      isDeleting.value = false
    }
  }

  const searchHobbies = async (type = 'video', query) => {
    isSearching.value = true

    try {
      if (type === 'game') {
        return await $fetch(
          `/api/igdb/search?term=${encodeURIComponent(query ?? '')}`,
        )
      }

      const { results } = await $fetch(
        `/api/tmdb/search/multi?query=${encodeURIComponent(query ?? '')}`,
      )
      return results
    } catch (error) {
      console.error('搜索失败', error)
      return []
    } finally {
      isSearching.value = false
    }
  }

  const fetchHobbyDetail = (type, id) => {
    if (type === 'game') {
      return $fetch(`/api/igdb/${encodeURIComponent(id)}`)
    }
    return $fetch(
      `/api/tmdb/${encodeURIComponent(type)}/${encodeURIComponent(id)}`,
    )
  }

  const fetchHobbyCredits = async (type, id) => {
    if (type === 'game') return []

    try {
      const { cast = [], crew = [] } = await $fetch(
        `/api/tmdb/${type}/${id}/credits`,
      )

      const directors = crew
        .filter((item) => item.job === 'Director')
        .map((item) => ({ ...item, job: '导演' }))

      return [...directors, ...cast.slice(0, 10)]
    } catch (error) {
      console.error('获取演职员失败', error)
      return []
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
