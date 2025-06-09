import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  setResponseHeader(event, 'Content-Type', 'application/xml')

  const baseUrl = config.public.siteUrl

  // 静态路由列表
  const routes = ['', '/life', '/poetry', '/note', '/chat']

  // 生成sitemap XML内容
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'

  // 添加XML样式表引用
  xml += '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n'

  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

  // 添加所有静态路由
  for (const route of routes) {
    xml += '  <url>\n'
    xml += `    <loc>${baseUrl}${route}</loc>\n`
    xml += '    <changefreq>weekly</changefreq>\n'
    xml += '    <priority>0.8</priority>\n'
    xml += '  </url>\n'
  }

  const client = await serverSupabaseClient(event)

  try {
    // 从数据库中获取所有笔记的ID
    const { data: notes, error } = await client
      .from('notes')
      .select('id, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error

    // 将笔记动态路由添加到sitemap
    for (const note of notes) {
      const lastmod = new Date(note.created_at).toISOString().split('T')[0]

      xml += '  <url>\n'
      xml += `    <loc>${baseUrl}/note/${note.id}</loc>\n`
      xml += `    <lastmod>${lastmod}</lastmod>\n`
      xml += '    <changefreq>weekly</changefreq>\n'
      xml += '    <priority>0.6</priority>\n'
      xml += '  </url>\n'
    }
  } catch (error) {
    console.error('获取笔记数据失败', error)
  }

  xml += '</urlset>'

  return xml
})
