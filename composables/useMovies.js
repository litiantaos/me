export const useMovies = () => {
  const client = useSupabaseClient()
  const user = useSupabaseUser()

  const movies = useState('movies', () => [])

  const isFetching = useState('fetching', () => false)
  const isSearching = useState('searching', () => false)
  const isAdding = useState('adding', () => false)
  const isDeleting = useState('deleting', () => false)

  // 获取全部电影的观影记录
  const fetchMovieRecords = async () => {
    isFetching.value = true

    const { data, error } = await client
      .from('movies')
      .select('*')
      .order('watch_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error

    movies.value = data
    isFetching.value = false
  }

  // 获取单个电影的观影记录
  const fetchMovieRecordsByTmdbId = async (tmdbId) => {
    const { data, error } = await client
      .from('movies')
      .select('*')
      .eq('tmdb_id', tmdbId)
      .order('watch_date', { ascending: false })

    if (error) throw error

    return data
  }

  // 获取观影记录
  const fetchMovieRecord = async (recordId) => {
    const { data, error } = await client
      .from('movies')
      .select('*')
      .eq('id', recordId)
      .single()

    if (error) throw error

    return data
  }

  // 添加电影
  const addMovieRecord = async (record, recordId) => {
    isAdding.value = true

    if (recordId) {
      // 更新
      const { error } = await client
        .from('movies')
        .update({
          watch_date: record.watch_date,
          watch_channel: record.watch_channel,
          rating: record.rating,
          season_number: record.season_number,
        })
        .eq('id', recordId)
        .select()
        .single()

      if (error) throw error
    } else {
      // 新建
      const { error } = await client.from('movies').insert({
        user_id: user.value.sub,
        tmdb_id: record.tmdb_id,
        media_type: record.media_type,
        title: record.title,
        poster_path: record.poster_path,
        watch_date: record.watch_date,
        watch_channel: record.watch_channel,
        rating: record.rating,
        season_number: record.season_number,
      })

      if (error) throw error
    }

    isAdding.value = false

    fetchMovieRecords()
  }

  // 删除电影
  const deleteMovieRecord = async (recordId) => {
    isDeleting.value = true

    const { error } = await client
      .from('movies')
      .delete()
      .eq('id', recordId)
      .eq('user_id', user.value.sub)

    if (error) throw error

    isDeleting.value = false
  }

  // 搜索电影
  const searchMovies = async (query) => {
    isSearching.value = true

    try {
      const data = await $fetch(`/api/tmdb/search/multi?query=${query}`)
      return data.results
    } catch (error) {
      console.error('搜索失败', error)
    } finally {
      isSearching.value = false
    }
  }

  // 获取电影详情
  const fetchMovieDetail = (type, tmdbId) => {
    try {
      return $fetch(`/api/tmdb/${type}/${tmdbId}`)
    } catch (error) {
      console.error('获取电影详情失败', error)
    }
  }

  // 获取电影演职员
  const fetchMovieCredits = (type, tmdbId) => {
    try {
      return $fetch(`/api/tmdb/${type}/${tmdbId}/credits`)
    } catch (error) {
      console.error('获取电影演职员失败', error)
    }
  }

  return {
    movies,
    isFetching,
    isSearching,
    isAdding,
    isDeleting,
    fetchMovieRecords,
    fetchMovieRecordsByTmdbId,
    fetchMovieRecord,
    addMovieRecord,
    deleteMovieRecord,
    searchMovies,
    fetchMovieDetail,
    fetchMovieCredits,
  }
}
