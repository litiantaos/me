<template>
  <Teleport to="body">
    <div
      v-if="isPreviewActive"
      class="fixed inset-0 z-[60] flex cursor-zoom-out items-center justify-center"
      @click="closePreview"
    >
      <div
        class="absolute top-0 left-0 h-full w-full transition-colors duration-300"
        :class="isZoomActive ? 'bg-white' : 'bg-transparent'"
      ></div>
      <img
        :src="previewSrc"
        class="absolute object-contain transition-all duration-300"
        :class="isZoomActive ? 'opacity-100' : 'opacity-0'"
        :style="containerStyle"
      />
    </div>
  </Teleport>
</template>

<script setup>
const isPreviewActive = ref(false)
const isZoomActive = ref(false)
const previewSrc = ref('')
const rect = ref({})

// 计算容器样式
const containerStyle = computed(() => ({
  top: isZoomActive.value ? '0' : `${rect.value.top || 0}px`,
  left: isZoomActive.value ? '0' : `${rect.value.left || 0}px`,
  width: isZoomActive.value ? '100%' : `${rect.value.width || 0}px`,
  height: isZoomActive.value ? '100%' : `${rect.value.height || 0}px`,
}))

const openPreview = (event) => {
  if (isPreviewActive.value) return
  if (event.target.tagName !== 'IMG') return

  const img = event.target
  previewSrc.value = img.src
  rect.value = img.getBoundingClientRect()
  isPreviewActive.value = true

  setTimeout(() => {
    isZoomActive.value = true
    document.body.style.overflow = 'hidden'
  }, 50)
}

const closePreview = (event) => {
  event?.stopPropagation()

  isZoomActive.value = false

  setTimeout(() => {
    isPreviewActive.value = false
    document.body.style.overflow = ''
  }, 350)
}

onMounted(() => {
  document.body.addEventListener('click', openPreview)
})

onUnmounted(() => {
  document.body.removeEventListener('click', openPreview)
})

defineExpose({
  openPreview,
  closePreview,
})
</script>
