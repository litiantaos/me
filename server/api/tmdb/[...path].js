export default defineEventHandler(async (event) => {
  const path = event.context.params?.path
  const query = getQuery(event)

  const { tmdbApiKey } = useRuntimeConfig()

  // 图片路径仅允许 尺寸/文件名.扩展名，拒绝 ".." 等路径注入
  if (path.startsWith('img/')) {
    if (!/^img\/[a-z0-9]+\/[a-z0-9_-]+\.[a-z0-9]+$/i.test(path)) {
      throw createError({ statusCode: 400, statusMessage: '路径不合法' })
    }
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

  const fetchTmdb = (endpoint, params = {}) =>
    $fetch(`https://api.themoviedb.org/3/${endpoint}`, {
      query: { api_key: tmdbApiKey, language: 'zh-CN', ...params },
    })

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

  // 详情仅放行 {type}/{数字id}，防止 ".." 逃出 /3/ 前缀
  if (/^(movie|tv)\/\d+$/.test(path)) {
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

  // 兜底仅放行演员表请求，正则白名单同时天然拒绝 ".." 等路径注入
  if (!/^(movie|tv)\/\d+\/credits$/.test(path)) {
    throw createError({ statusCode: 400, statusMessage: '路径不合法' })
  }

  const SAFE_QUERY_KEYS = ['query', 'language', 'page', 'include_adult']
  const safeQuery = Object.fromEntries(
    SAFE_QUERY_KEYS.filter((key) => key in query).map((key) => [
      key,
      query[key],
    ]),
  )
  return fetchTmdb(path, safeQuery)
})
