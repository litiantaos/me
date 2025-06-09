<template>
  <div>
    <div v-html="htmlContent" class="html-style"></div>
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

const htmlContent = computed(() => marked(props.content))
</script>
