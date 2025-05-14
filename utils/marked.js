import { marked } from 'marked'

const renderer = new marked.Renderer()

renderer.link = (href, title, text) => {
  const link = marked.Renderer.prototype.link.call(renderer, href, title, text)
  return link.replace('<a', '<a target="_blank" rel="noopener noreferrer"')
}

marked.setOptions({ renderer })

export default marked
