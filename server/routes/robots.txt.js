export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl

  setResponseHeader(event, 'Content-Type', 'text/plain')

  return `User-Agent: *
Allow: /
Allow: /note/
Allow: /life/
Allow: /poetry/
Allow: /ai/
Allow: /hobby/
Disallow: /login/
Disallow: /note/new/
Disallow: /hobby/add/

Sitemap: ${siteUrl}/sitemap.xml
`
})
