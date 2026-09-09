export default defineCachedEventHandler(
  (event) => {
    const siteUrl = useRuntimeConfig(event).public.siteUrl

    setResponseHeader(event, 'Content-Type', 'text/plain')

    const rules = [
      'User-Agent: *',
      '',
      'Disallow: /login/',
      'Disallow: /note/new/',
      'Disallow: /hobby/add/',
      // 简历页与数据接口不对爬虫开放（页面本身可正常访问）
      'Disallow: /resume',
      'Disallow: /api/',
      '',
      `Sitemap: ${siteUrl}/sitemap.xml`,
    ]

    return rules.join('\n')
  },
  {
    maxAge: 60 * 60 * 24, // 24小时缓存
    name: 'robots',
  },
)
