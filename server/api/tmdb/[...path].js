export default defineEventHandler(async (event) => {
  const path = event.context.params?.path
  const query = getQuery(event)

  const config = useRuntimeConfig()

  // 图片
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

  // 搜索
  if (path === 'search/multi') {
    const tmdbQuery = query.query
    const response = await $fetch('https://api.themoviedb.org/3/search/multi', {
      query: {
        api_key: config.tmdbApiKey,
        query: tmdbQuery,
        language: 'zh-CN',
      },
    })

    if (!response.results) return { results: [] }

    const results = response.results
      .filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
      .map((item) => ({
        id: item.id,
        title: item.title || item.name,
        poster: item.poster_path
          ? `/api/tmdb/img/w342${item.poster_path}`
          : null,
        release_date: item.release_date || item.first_air_date,
        overview: item.overview,
        type: item.media_type,
      }))

    return { results }
  }

  // 演职员
  if (path.endsWith('/credits')) {
    return await $fetch(`https://api.themoviedb.org/3/${path}`, {
      query: {
        api_key: config.tmdbApiKey,
        language: 'zh-CN',
      },
    })
  }

  // 详情
  if (path.startsWith('movie/') || path.startsWith('tv/')) {
    const response = await $fetch(`https://api.themoviedb.org/3/${path}`, {
      query: {
        api_key: config.tmdbApiKey,
        language: 'zh-CN',
      },
    })

    const type = path.startsWith('movie/') ? 'movie' : 'tv'

    const data = {
      id: response.id,
      title: response.title || response.name,
      original_title: response.original_title || response.original_name,
      poster: response.poster_path
        ? `/api/tmdb/img/w342${response.poster_path}`
        : null,
      backdrop: response.backdrop_path
        ? `/api/tmdb/img/w1280${response.backdrop_path}`
        : null,
      release_date: response.release_date || response.first_air_date,
      overview: response.overview,
      genres: response.genres,
      original_language: response.original_language,
      score: response.vote_average,
      type,
    }

    if (type === 'movie') {
      data.runtime = response.runtime
    } else {
      data.last_air_date = response.last_air_date
      data.seasons = response.seasons
      data.number_of_seasons = response.number_of_seasons
      data.number_of_episodes = response.number_of_episodes
    }

    return data
  }

  // 其他
  return await $fetch(`https://api.themoviedb.org/3/${path}`, {
    query: {
      api_key: config.tmdbApiKey,
      ...query,
      language: 'zh-CN',
    },
  })
})
