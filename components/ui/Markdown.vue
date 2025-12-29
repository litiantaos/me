<template>
  <!-- 纯文本渲染模式 -->
  <div v-if="md && isPlain" class="html-style">
    <p>{{ plainText }}</p>
  </div>

  <!-- 默认 HTML 渲染模式 -->
  <div
    v-else-if="md"
    v-html="html"
    class="html-style"
    @click="handleCopy"
  ></div>

  <!-- 空状态 -->
  <div
    v-else
    class="ri-tree-line flex h-[20vh] w-full items-center justify-center rounded-md border border-dashed border-zinc-300 text-4xl text-zinc-300 dark:border-zinc-500 dark:text-zinc-500"
  ></div>
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

const handleCopy = throttle(async (e) => {
  const btn = e.target.closest('.code-copy')
  if (!btn) return

  const code = btn.closest('.code-wrapper')?.querySelector('code')?.innerText
  if (code) {
    try {
      await navigator.clipboard.writeText(code)
      btn.classList.replace('ri-file-copy-line', 'ri-check-line')

      setTimeout(() => {
        btn.classList.replace('ri-check-line', 'ri-file-copy-line')
      }, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
})
</script>
