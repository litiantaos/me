<template>
  <div class="w-full space-y-4">
    <div
      ref="containerRef"
      @scroll="handleScroll"
      :class="['no-scrollbar flex overflow-x-auto', customClass]"
    >
      <slot />
    </div>

    <div
      v-if="totalPages > 1"
      class="flex h-2 w-full items-center justify-center gap-2"
    >
      <div
        v-for="(_, index) in totalPages"
        :key="index"
        @click="scrollToPage(index)"
        :class="[
          'h-full cursor-pointer rounded-full transition-all duration-300',
          currentPage === index
            ? 'w-10 bg-zinc-400 dark:bg-zinc-500'
            : 'w-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600',
        ]"
      ></div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  customClass: {
    type: String,
    default: '',
  },
})

const containerRef = ref(null)
const currentPage = ref(0)
const totalPages = ref(0)
let resizeObserver = null
let mutationObserver = null

const calculatePages = () => {
  if (!containerRef.value) return
  const { scrollWidth, clientWidth } = containerRef.value
  if (clientWidth === 0) return

  if (scrollWidth <= clientWidth) {
    totalPages.value = 1
    return
  }

  const pageWidth = clientWidth * 0.9
  totalPages.value = Math.ceil(scrollWidth / pageWidth)
}

const handleScroll = () => {
  if (!containerRef.value) return

  const { scrollLeft, scrollWidth, clientWidth } = containerRef.value

  if (scrollLeft + clientWidth >= scrollWidth - 5) {
    currentPage.value = totalPages.value - 1
    return
  }

  const pageWidth = clientWidth * 0.9
  currentPage.value = Math.round(scrollLeft / pageWidth)
}

const scrollToPage = (page) => {
  if (!containerRef.value) return

  const { clientWidth } = containerRef.value
  const pageWidth = clientWidth * 0.9

  containerRef.value.scrollTo({
    left: page * pageWidth,
    behavior: 'smooth',
  })
}

onMounted(() => {
  calculatePages()

  if (containerRef.value) {
    resizeObserver = new ResizeObserver(calculatePages)
    resizeObserver.observe(containerRef.value)

    mutationObserver = new MutationObserver(calculatePages)
    mutationObserver.observe(containerRef.value, {
      childList: true,
      subtree: true,
    })
  }
})

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect()
  if (mutationObserver) mutationObserver.disconnect()
})

defineExpose({ calculatePages })
</script>
