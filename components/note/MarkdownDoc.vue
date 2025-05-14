<template>
  <div>
    <div v-html="mdDocHTML" class="html-style"></div>
  </div>
</template>

<script setup>
import marked from '~/utils/marked'

const mdDocHTML = ref('')

onMounted(async () => {
  const res = await fetch('/docs/md.md')
  const mdDoc = await res.text()

  mdDocHTML.value = marked(mdDoc)
})
</script>
