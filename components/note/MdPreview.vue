<template>
  <div>
    <div v-html="contentHTML" class="html-style"></div>
  </div>
</template>

<script setup>
import marked from '~/utils/marked'

const props = defineProps({
  content: {
    type: String,
    default: '',
  },
})

const contentHTML = computed(() => marked(props.content))
</script>
