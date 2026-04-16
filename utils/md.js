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

// HTML 渲染器配置
const htmlRenderer = {
  link({ href, tokens }) {
    const text = this.parser.parseInline(tokens)
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`
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
    const whitelist = ['img', 'video', 'audio', 'br', 'iframe']
    const tagRegex = new RegExp(
      `^<\\/?(${whitelist.join('|')})(\\s+[^>]*)?>$`,
      'i',
    )

    if (tagRegex.test(text.trim())) return text

    return `<p>${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`
  },
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
