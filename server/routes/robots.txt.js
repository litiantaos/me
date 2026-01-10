export default defineEventHandler((event) => {
  const config = useRuntimeConfig()

  setResponseHeader(event, 'Content-Type', 'text/plain')

  const siteUrl = config.public.siteUrl

  // 生成robots.txt内容
  const robotsTxt = `User-Agent: *
Allow: /
Allow: /note/
Allow: /life/
Allow: /poetry/
Allow: /ai/
Allow: /movie/
Disallow: /login/
Disallow: /note/new/
Disallow: /movie/add/

Sitemap: ${siteUrl}/sitemap.xml
`

  return robotsTxt
})
