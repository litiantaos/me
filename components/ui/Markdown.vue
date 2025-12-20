<template>
  <div>
    <!-- 纯文本渲染模式 -->
    <div
      v-if="md && isPlain"
      class="text-justify leading-7 whitespace-pre-wrap"
    >
      {{ plainText }}
    </div>
    <!-- 默认HTML渲染模式 -->
    <div v-else-if="md" v-html="html" class="html-style"></div>
    <!-- 空状态 -->
    <div
      v-else
      class="ri-tree-line flex h-[20vh] w-full items-center justify-center rounded-md border border-dashed border-zinc-300 text-4xl text-zinc-300 dark:border-zinc-500 dark:text-zinc-500"
    ></div>
  </div>
</template>

<script setup>
const props = defineProps({
  md: {
    type: String,
    default: '',
  },
  isPlain: {
    type: Boolean,
    default: false,
  },
})

const html = computed(() => renderToHtml(props.md))
const plainText = computed(() => renderToPlainText(props.md))
</script>
