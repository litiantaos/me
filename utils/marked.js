import { marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'

const renderer = new marked.Renderer()

renderer.link = (href, title, text) => {
  const link = marked.Renderer.prototype.link.call(renderer, href, title, text)
  return link.replace('<a', '<a target="_blank" rel="noopener noreferrer"')
}

marked.use(
  // 代码高亮
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext'
      return hljs.highlight(code, { language }).value
    },
  }),
)

marked.setOptions({
  renderer,
})

export default marked
