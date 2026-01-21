const processImage = (url, size = 't_cover_big') => {
  let newUrl = url.startsWith('//') ? `https:${url}` : url
  return newUrl.replace('t_thumb', size)
}

const processDate = (timestamp) => {
  const date = new Date(timestamp * 1000)
  return date.toISOString().split('T')[0]
}

export default defineEventHandler(async (event) => {
  const path = event.context.params.path
  const query = getQuery(event)

  // 搜索
  if (path === 'search') {
    const term = query.term
    const isChinese = /[\u4e00-\u9fa5]/.test(term)

    if (isChinese) {
      const [gamesResponse, altNamesResponse] = await Promise.all([
        fetchIgdb('/games', `fields id; where name ~ *"${term}"*; limit 20;`),
        fetchIgdb(
          '/alternative_names',
          `fields game; where name ~ *"${term}"*; limit 20;`,
        ),
      ])

      const gameIds = new Set()

      if (gamesResponse) {
        gamesResponse.forEach((g) => gameIds.add(g.id))
      }

      if (altNamesResponse) {
        altNamesResponse.forEach((a) => {
          if (a.game) gameIds.add(a.game)
        })
      }

      if (gameIds.size === 0) return []

      const ids = Array.from(gameIds).join(',')
      const detailsBody = `
          fields name, cover.url, first_release_date, summary;
          where id = (${ids});
          limit 20;
        `

      const response = await fetchIgdb('/games', detailsBody)

      return response.map((item) => ({
        id: item.id,
        title: item.name,
        poster: processImage(item.cover?.url, 't_cover_big'),
        release_date: processDate(item.first_release_date),
        overview: item.summary,
        type: 'game',
      }))
    } else {
      const body = `
        fields name, cover.url, first_release_date, summary;
        search "${term}";
        limit 20;
      `

      const response = await fetchIgdb('/games', body)

      return response.map((item) => ({
        id: item.id,
        title: item.name,
        poster: processImage(item.cover?.url, 't_cover_big'),
        release_date: processDate(item.first_release_date),
        overview: item.summary,
        type: 'game',
      }))
    }
  }

  // 详情
  const gameId = parseInt(path)
  if (isNaN(gameId)) return null

  const body = `
    fields name, cover.url, summary, first_release_date, 
    genres.name, total_rating,
    involved_companies.company.name, involved_companies.developer, involved_companies.publisher,
    screenshots.url, artworks.url;
    where id = ${gameId};
  `

  const response = await fetchIgdb('/games', body)
  const data = response[0]

  if (!data) return null

  const developers = []
  const publishers = []
  if (data.involved_companies) {
    data.involved_companies.forEach((item) => {
      if (item.developer) developers.push(item.company.name)
      if (item.publisher) publishers.push(item.company.name)
    })
  }

  let backdrop = ''
  if (data.artworks && data.artworks.length > 0) {
    backdrop = processImage(data.artworks[0].url, 't_1080p')
  } else if (data.screenshots && data.screenshots.length > 0) {
    backdrop = processImage(data.screenshots[0].url, 't_1080p')
  }

  const screenshots =
    data.screenshots?.map((s) => ({
      id: s.id,
      path_thumbnail: processImage(s.url, 't_screenshot_med'),
      path_full: processImage(s.url, 't_1080p'),
    })) || []

  return {
    id: data.id,
    title: data.name,
    original_title: data.name,
    poster: processImage(data.cover?.url, 't_cover_big'),
    backdrop: backdrop,
    release_date: processDate(data.first_release_date),
    overview: data.summary,
    genres: data.genres?.map((g) => ({ id: g.id, name: g.name })),
    score: data.total_rating / 10,
    developers: developers,
    publishers: publishers,
    screenshots: screenshots,
    type: 'game',
  }
})
