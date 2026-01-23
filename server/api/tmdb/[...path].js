export default defineEventHandler(async (event) => {
  const path = event.context.params?.path
  const query = getQuery(event)

  const { tmdbApiKey } = useRuntimeConfig()

  // 图片代理
  if (path.startsWith('img/')) {
    setResponseHeader(
      event,
      'Cache-Control',
      'public, s-maxage=604800, stale-while-revalidate=86400',
    )
    return proxyRequest(
      event,
      `https://image.tmdb.org/t/p/${path.replace('img/', '')}`,
    )
  }

  // 统一 Fetch 方法
  const fetchTmdb = (endpoint, params = {}) =>
    $fetch(`https://api.themoviedb.org/3/${endpoint}`, {
      query: { api_key: tmdbApiKey, language: 'zh-CN', ...params },
    })

  // 搜索
  if (path === 'search/multi') {
    const { results = [] } = await fetchTmdb(path, { query: query.query })
    return {
      results: results
        .filter((i) => ['movie', 'tv'].includes(i.media_type))
        .map((i) => ({
          id: i.id,
          title: i.title || i.name,
          poster: i.poster_path,
          release_date: i.release_date || i.first_air_date,
          overview: i.overview,
          type: i.media_type,
        })),
    }
  }

  // 详情
  if (
    (path.startsWith('movie/') || path.startsWith('tv/')) &&
    !path.endsWith('/credits')
  ) {
    const data = await fetchTmdb(path)
    const isMovie = path.startsWith('movie/')

    return {
      id: data.id,
      title: data.title || data.name,
      original_title: data.original_title || data.original_name,
      poster: data.poster_path,
      backdrop: data.backdrop_path,
      release_date: data.release_date || data.first_air_date,
      overview: data.overview,
      genres: data.genres,
      original_language: data.original_language,
      score: data.vote_average,
      type: isMovie ? 'movie' : 'tv',
      ...(isMovie
        ? { runtime: data.runtime }
        : {
            last_air_date: data.last_air_date,
            seasons: data.seasons,
            number_of_seasons: data.number_of_seasons,
            number_of_episodes: data.number_of_episodes,
          }),
    }
  }

  // 其他
  return fetchTmdb(path, query)
})
