const processImage = (url, size = 't_cover_big') => {
  if (!url) return null
  const newUrl = url.startsWith('//') ? `https:${url}` : url
  return newUrl.replace('t_thumb', size)
}

const processDate = (timestamp) => {
  if (!timestamp) return null
  const date = new Date(timestamp * 1000)
  return date.toISOString().split('T')[0]
}

export default defineEventHandler(async (event) => {
  const { path } = event.context.params
  const { term } = getQuery(event)

  // 搜索
  if (path === 'search') {
    let searchCondition = `search "${term}";`

    // 中文模糊匹配
    if (/[\u4e00-\u9fa5]/.test(term)) {
      const [games, alts] = await Promise.all([
        fetchIgdb('/games', `fields id; where name ~ *"${term}"*; limit 20;`),
        fetchIgdb(
          '/alternative_names',
          `fields game; where name ~ *"${term}"*; limit 20;`,
        ),
      ])

      const ids = new Set([
        ...(games || []).map((g) => g.id),
        ...(alts || []).map((a) => a.game).filter(Boolean),
      ])

      if (!ids.size) return []
      searchCondition = `where id = (${Array.from(ids).join(',')});`
    }

    const response = await fetchIgdb(
      '/games',
      `fields name, cover.url, first_release_date, summary; ${searchCondition} limit 20;`,
    )

    return response.map((item) => ({
      id: item.id,
      title: item.name,
      poster: processImage(item.cover?.url, 't_cover_big'),
      release_date: processDate(item.first_release_date),
      overview: item.summary,
      type: 'game',
    }))
  }

  // 详情
  const gameId = parseInt(path)
  if (isNaN(gameId)) return null

  const [data] = await fetchIgdb(
    '/games',
    `
    fields name, cover.url, summary, first_release_date, 
    genres.name, total_rating,
    involved_companies.company.name, involved_companies.developer, involved_companies.publisher,
    screenshots.url, artworks.url;
    where id = ${gameId};
  `,
  )

  if (!data) return null

  const getCompanies = (role) =>
    data.involved_companies
      ?.filter((c) => c[role])
      .map((c) => c.company.name) || []

  const getBigImage = (arr) =>
    arr?.[0]?.url ? processImage(arr[0].url, 't_1080p') : null

  return {
    id: data.id,
    title: data.name,
    original_title: data.name,
    poster: processImage(data.cover?.url, 't_cover_big'),
    backdrop: getBigImage(data.artworks) || getBigImage(data.screenshots),
    release_date: processDate(data.first_release_date),
    overview: data.summary,
    genres: data.genres?.map((g) => ({ id: g.id, name: g.name })),
    score: data.total_rating ? data.total_rating / 10 : null,
    developers: getCompanies('developer'),
    publishers: getCompanies('publisher'),
    screenshots:
      data.screenshots?.map((s) => ({
        id: s.id,
        path_thumbnail: processImage(s.url, 't_screenshot_med'),
        path_full: processImage(s.url, 't_1080p'),
      })) || [],
    type: 'game',
  }
})
