export default defineEventHandler(async (event) => {
  const { query } = getQuery(event)
  if (typeof query !== 'string' || !query.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'query 不能为空' })
  }

  const { mapboxToken } = useRuntimeConfig()

  try {
    return await $fetch('https://api.mapbox.com/search/geocode/v6/forward', {
      query: {
        query,
        types: 'place',
        limit: 5,
        access_token: mapboxToken,
      },
    })
  } catch {
    throw createError({ statusCode: 502, statusMessage: '地理编码服务不可用' })
  }
})
