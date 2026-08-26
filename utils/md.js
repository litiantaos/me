import { Marked } from 'marked'
import hljs from 'highlight.js/lib/core'

import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import bash from 'highlight.js/lib/languages/bash'
import html from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import json from 'highlight.js/lib/languages/json'
import markdown from 'highlight.js/lib/languages/markdown'
import sql from 'highlight.js/lib/languages/sql'
import rust from 'highlight.js/lib/languages/rust'
import go from 'highlight.js/lib/languages/go'
import java from 'highlight.js/lib/languages/java'
import cpp from 'highlight.js/lib/languages/cpp'
import yaml from 'highlight.js/lib/languages/yaml'
import plaintext from 'highlight.js/lib/languages/plaintext'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('py', python)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('html', html)
hljs.registerLanguage('xml', html)
hljs.registerLanguage('css', css)
hljs.registerLanguage('json', json)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('md', markdown)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('rust', rust)
hljs.registerLanguage('go', go)
hljs.registerLanguage('java', java)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('c++', cpp)
hljs.registerLanguage('c', cpp)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('plaintext', plaintext)

// 属性值编码：防止引号截断造成属性逃逸
export const escapeAttrValue = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;')

// 文本类属性 HTML 实体转义
export const escapeAttrText = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

// 链接协议白名单：http/https/mailto；相对路径与锚点默认放行
const isSafeHref = (href) => {
  const value = String(href ?? '')
    .trim()
    .toLowerCase()
  if (/^[a-z][a-z0-9+.-]*:/.test(value)) return /^(https?|mailto):/.test(value)
  return true
}

// 媒体地址校验：仅 http/https，img 额外允许 data:image/
export const isSafeMediaSrc = (src, allowDataImage = false) => {
  const value = String(src ?? '')
    .trim()
    .toLowerCase()
  if (/^https?:\/\//.test(value)) return true
  return allowDataImage && value.startsWith('data:image/')
}

// HTML 渲染器配置
const htmlRenderer = {
  link({ href, tokens }) {
    const text = this.parser.parseInline(tokens)
    // 危险协议（javascript:/data:/vbscript: 等）仅保留链接文本
    if (!isSafeHref(href)) return text
    return `<a href="${escapeAttrValue(href)}" target="_blank" rel="noopener noreferrer">${text}</a>`
  },
  image({ href, title, text }) {
    if (!isSafeMediaSrc(href, true)) return text || ''
    const titleAttr = title ? ` title="${escapeAttrText(title)}"` : ''
    return `<img src="${escapeAttrValue(href)}" alt="${escapeAttrText(text || '')}"${titleAttr} loading="lazy" />`
  },
  code({ text, lang }) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext'
    const highlighted = hljs.highlight(text, { language }).value

    return `<div class="code-wrapper">
      <div class="code-header">
        <span>${language.toUpperCase()}</span>
        <button class="code-copy ri-file-copy-line"></button>
      </div>
      <pre><code class="hljs language-${language}">${highlighted}</code></pre>
    </div>`
  },
  html({ text }) {
    return rebuildSafeHtml(text)
  },
}

// 允许的 HTML 标签及对应属性白名单
const ALLOWED_TAGS = {
  img: ['src', 'alt', 'title', 'width', 'height'],
  video: ['src', 'controls', 'width', 'height'],
  audio: ['src', 'controls', 'width', 'height'],
  br: [],
}

// 匹配单个完整标签：<name attrs...>、</name>、<name attrs... />
const TAG_RE =
  /<\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9]*)((?:"[^"]*"|'[^']*'|[^"'<>])*)>/

// 解析属性字符串为键值对（支持双引号/单引号/无引号/布尔属性）
const parseAttrs = (raw) => {
  const attrs = {}
  const attrRe =
    /([a-zA-Z][\w-]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g
  let match
  while ((match = attrRe.exec(raw))) {
    attrs[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? ''
  }
  return attrs
}

// 按白名单重建单个标签，非白名单标签返回空字符串
const rebuildTag = (rawTag) => {
  const match = rawTag.match(TAG_RE)
  if (!match) return ''

  const [, slash, rawName, rawAttrs = ''] = match
  const name = rawName.toLowerCase()
  const allowed = ALLOWED_TAGS[name]
  if (!allowed) return ''

  // 闭合标签仅放行 video/audio
  if (slash) return name === 'video' || name === 'audio' ? `</${name}>` : ''
  if (name === 'br') return '<br>'

  const attrs = parseAttrs(rawAttrs)
  const parts = [`<${name}`]
  for (const attr of allowed) {
    if (!(attr in attrs)) continue
    if (attr === 'src') {
      if (!isSafeMediaSrc(attrs.src, name === 'img')) continue
      parts.push(` src="${escapeAttrValue(attrs.src)}"`)
    } else if (attr === 'controls') {
      parts.push(' controls')
    } else {
      parts.push(` ${attr}="${escapeAttrText(attrs[attr])}"`)
    }
  }
  parts.push(name === 'img' ? ' />' : '>')
  const tag = parts.join('')
  // video/audio 自闭合时补结束标签（HTML5 中 "/" 会被忽略）
  return /\/\s*>$/.test(rawTag) && name !== 'img' ? `${tag}</${name}>` : tag
}

// 重建白名单标签并剔除危险属性；标签外的裸尖括号转义防走私；无任何白名单标签时整段丢弃
const rebuildSafeHtml = (text) => {
  let result = ''
  let hasSafeTag = false
  let last = 0
  const escapeAngle = (value) =>
    value.replace(/</g, '&lt;').replace(/>/g, '&gt;')

  for (const match of text.matchAll(new RegExp(TAG_RE.source, 'g'))) {
    if (ALLOWED_TAGS[match[2].toLowerCase()]) hasSafeTag = true
    result += escapeAngle(text.slice(last, match.index))
    result += rebuildTag(match[0])
    last = match.index + match[0].length
  }
  result += escapeAngle(text.slice(last))

  return hasSafeTag ? result : ''
}

// 纯文本渲染器配置
const plainTextRenderer = {
  // 标题直接返回文本
  heading({ tokens }) {
    return this.parser.parseInline(tokens) + ' '
  },
  // 段落返回文本加空格
  paragraph({ tokens }) {
    return this.parser.parseInline(tokens) + ' '
  },
  // 列表项返回文本
  listitem({ tokens }) {
    return this.parser.parseInline(tokens) + ' '
  },
  // 代码块忽略不显示
  code({ text }) {
    return ''
  },
  // 行内代码返回文本
  codespan({ text }) {
    return ' ' + text + ' '
  },
  // 粗体/斜体返回文本
  strong({ tokens }) {
    return this.parser.parseInline(tokens)
  },
  em({ tokens }) {
    return this.parser.parseInline(tokens)
  },
  // 删除线返回文本
  del({ tokens }) {
    return this.parser.parseInline(tokens)
  },
  // 链接返回链接文本
  link({ tokens }) {
    return this.parser.parseInline(tokens)
  },
  // 图片返回 alt 文本
  image({ text }) {
    return text || ''
  },
  // 引用返回文本
  blockquote({ tokens }) {
    return this.parser.parse(tokens) + ' '
  },
  // 水平线返回空格
  hr() {
    return ' '
  },
  // HTML 换行标签返回空格
  br() {
    return ' '
  },
  // 表格忽略不显示
  table({ header, rows }) {
    return ''
  },
  // 列表
  list({ items }) {
    return items.map((item) => this.parser.parse(item.tokens)).join('') + ' '
  },
  // 复选框返回文本
  checkbox({ checked }) {
    return checked ? '[x] ' : '[ ] '
  },
}

// HTML 渲染实例
const htmlMarked = new Marked()
htmlMarked.use({
  renderer: htmlRenderer,
})

// 纯文本渲染实例
const plainTextMarked = new Marked()
plainTextMarked.use({ renderer: plainTextRenderer })

// 将 Markdown 文本渲染为 HTML
export const renderToHtml = (md) => {
  return htmlMarked.parse(md)
}

// 将 Markdown 文本渲染为纯文本
export const renderToPlainText = (md) => {
  return plainTextMarked.parse(md)
}
