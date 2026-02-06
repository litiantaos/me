export default defineCachedEventHandler(
  (event) => {
    const siteUrl = getRequestURL(event).origin

    setResponseHeader(event, 'Content-Type', 'text/plain')

    const rules = [
      'User-Agent: *',
      '',
      'Allow: /',
      'Allow: /note/',
      'Allow: /life/',
      'Allow: /poetry/',
      'Allow: /hobby/',
      'Disallow: /login/',
      'Disallow: /note/new/',
      'Disallow: /hobby/add/',
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
