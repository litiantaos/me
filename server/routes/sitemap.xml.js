import { serverSupabaseClient } from '#supabase/server'

const routes = ['', '/life', '/poetry', '/hobby', '/note']

export default defineCachedEventHandler(
  async (event) => {
    const client = await serverSupabaseClient(event)
    const siteUrl = getRequestURL(event).origin

    setResponseHeader(event, 'Content-Type', 'application/xml')

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]

    // 添加所有静态路由
    for (const route of routes) {
      xml.push(
        '  <url>',
        `    <loc>${siteUrl}${route}</loc>`,
        '    <changefreq>weekly</changefreq>',
        '    <priority>0.8</priority>',
        '  </url>',
      )
    }

    try {
      // 获取所有笔记 ID
      const { data: notes, error } = await client
        .from('notes')
        .select('id, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error

      // 添加笔记动态路由
      for (const note of notes) {
        const lastmod = new Date(note.created_at).toISOString().split('T')[0]

        xml.push(
          '  <url>',
          `    <loc>${siteUrl}/note/${note.id}</loc>`,
          `    <lastmod>${lastmod}</lastmod>`,
          '    <changefreq>weekly</changefreq>',
          '    <priority>0.6</priority>',
          '  </url>',
        )
      }
    } catch (error) {
      console.error('获取笔记数据失败', error)
    }

    xml.push('</urlset>')

    return xml.join('\n')
  },
  {
    maxAge: 60 * 60, // 1小时缓存
    name: 'sitemap',
  },
)
