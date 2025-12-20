export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const path = event.context.params?.path
  const query = getQuery(event)

  // 图片请求
  if (path.startsWith('img/')) {
    // 去掉前面的 img/
    const imgPath = path.replace('img/', '')

    // 设置图片缓存头，浏览器和 Vercel 都会缓存
    setResponseHeader(
      event,
      'Cache-Control',
      'public, s-maxage=604800, stale-while-revalidate=86400',
    )

    return proxyRequest(event, `${config.public.tmdbUrl}/t/p/${imgPath}`)
  }

  // 其他请求
  try {
    return await $fetch(`${config.public.tmdbUrl}/3/${path}`, {
      query: {
        ...query,
        api_key: config.tmdbApiKey,
        language: 'zh-CN',
      },
    })
  } catch (error) {
    if (error) throw error
  }
})
