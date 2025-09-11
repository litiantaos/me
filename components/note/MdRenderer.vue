<template>
  <div>
    <div v-if="md" v-html="html" class="html-style"></div>
    <div
      v-else
      class="ri-tree-line flex h-[20vh] w-full items-center justify-center rounded-md border border-dashed border-zinc-300 text-4xl text-zinc-300"
    ></div>
  </div>
</template>

<script setup>
import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'

const props = defineProps({
  md: {
    type: String,
    default: '',
  },
})

const renderer = {
  link({ href, tokens }) {
    const text = this.parser.parseInline(tokens)
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`
  },
}

const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext'
      return hljs.highlight(code, { language }).value
    },
  }),
)

marked.use({ renderer })

const html = computed(() => marked.parse(props.md))
</script>
