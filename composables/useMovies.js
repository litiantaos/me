export const useMovies = () => {
  const client = useSupabaseClient()
  const user = useSupabaseUser()

  const movies = useState('movies', () => [])
  const isMoviesLoading = useState('moviesLoading', () => false)
  const isSearching = useState('searching', () => false)
  const isAdding = useState('adding', () => false)
  const isDeleting = useState('deleting', () => false)

  // 获取用户电影列表
  const fetchMovies = async () => {
    isMoviesLoading.value = true

    const { data, error } = await client
      .from('movies')
      .select('*')
      .order('watch_date', { ascending: false })

    if (error) throw error

    movies.value = data

    isMoviesLoading.value = false
  }

  // 获取用户电影详情
  const fetchMovie = async (id) => {
    const { data, error } = await client
      .from('movies')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return data
  }

  // 添加电影
  const addMovie = async (movie, movieId) => {
    isAdding.value = true

    if (movieId) {
      // 更新
      const { error } = await client
        .from('movies')
        .update({
          watch_date: movie.watch_date,
          watch_channel: movie.watch_channel,
          rating: movie.rating,
        })
        .eq('id', movieId)
        .select()
        .single()

      if (error) throw error
    } else {
      // 新建
      const { error } = await client.from('movies').insert({
        user_id: user.value.sub,
        tmdb_id: movie.id,
        media_type: movie.media_type,
        title: movie.title || movie.name,
        poster_path: movie.poster_path,
        overview: movie.overview,
        watch_date: movie.watch_date,
        watch_channel: movie.watch_channel,
        rating: movie.rating,
      })

      if (error) throw error
    }

    isAdding.value = false

    fetchMovies()
  }

  // 删除电影
  const deleteMovie = async (id) => {
    isDeleting.value = true

    const { error } = await client
      .from('movies')
      .delete()
      .eq('id', id)
      .eq('user_id', user.value.sub)

    if (error) throw error

    isDeleting.value = false

    fetchMovies()
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
  const fetchMovieDetail = (id, type) => {
    try {
      return $fetch(`/api/tmdb/${type}/${id}`)
    } catch (error) {
      console.error('获取电影详情失败', error)
    }
  }

  // 获取电影演员
  const fetchMovieCredits = (id, type) => {
    try {
      return $fetch(`/api/tmdb/${type}/${id}/credits`)
    } catch (error) {
      console.error('获取电影演员失败', error)
    }
  }

  return {
    movies,
    isMoviesLoading,
    isSearching,
    isAdding,
    isDeleting,
    fetchMovies,
    fetchMovie,
    addMovie,
    deleteMovie,
    searchMovies,
    fetchMovieDetail,
    fetchMovieCredits,
  }
}
