export default defineEventHandler(async (event) => {
  const { query } = getQuery(event)

  const config = useRuntimeConfig()

  return await $fetch(`https://api.mapbox.com/search/geocode/v6/forward`, {
    query: {
      query,
      types: 'place',
      limit: 5,
      access_token: config.mapboxToken,
    },
  })
})
