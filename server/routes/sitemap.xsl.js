export default defineEventHandler((event) => {
  setResponseHeader(event, 'Content-Type', 'text/xsl')

  return `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>Sitemap - TaosLife</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style type="text/css">
          body {
            font-family: monospace, sans-serif;
            color: #333;
            margin: 0;
            padding: 20px;
            font-size: 14px;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin-top: 20px;
            font-size: 14px;
          }
          th, td {
            padding: 10px 0;
          }
          th {
            text-align: left;
            color: #666;
            font-size: 12px;
          }
          a {
            color: dodgerblue;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          .url {
            width: 60%;
          }
          .priority, .changefreq {
            width: 20%;
          }
        </style>
      </head>
      <body>
        <h1>Sitemap - TaosLife</h1>
        <p>此文件包含网站上所有可索引的页面，供搜索引擎抓取使用。</p>
        <table>
          <tr>
            <th class="url">网址</th>
            <th class="priority">优先级</th>
            <th class="changefreq">更新频率</th>
          </tr>
          <xsl:for-each select="sitemap:urlset/sitemap:url">
            <tr>
              <td class="url">
                <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
              </td>
              <td class="priority"><xsl:value-of select="sitemap:priority"/></td>
              <td class="changefreq"><xsl:value-of select="sitemap:changefreq"/></td>
            </tr>
          </xsl:for-each>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`
})
