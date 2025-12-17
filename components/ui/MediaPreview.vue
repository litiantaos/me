<template>
  <Teleport to="body">
    <div
      v-if="isPreviewActive"
      class="fixed inset-0 z-60 cursor-zoom-out"
      @click="closePreview"
    >
      <div
        class="absolute inset-0 transition-colors duration-300"
        :class="isZoomActive ? 'bg-white dark:bg-zinc-800' : 'bg-transparent'"
      ></div>
      <img
        :src="previewSrc"
        class="absolute top-1/2 left-1/2 h-full w-full object-contain transition-all duration-300 will-change-[transform,border-radius,opacity]"
        :class="
          isZoomActive ? 'rounded-none opacity-100' : 'rounded-md opacity-0'
        "
        :style="transformStyle"
      />
    </div>
  </Teleport>
</template>

<script setup>
const isPreviewActive = ref(false)
const isZoomActive = ref(false)
const previewSrc = ref('')
const originalRect = ref({})

const transformStyle = computed(() => {
  if (!isPreviewActive.value) return {}

  const { top, left, width, height } = originalRect.value

  const viewportCenterX = window.innerWidth / 2
  const viewportCenterY = window.innerHeight / 2

  const imageCenterX = left + width / 2
  const imageCenterY = top + height / 2

  const translateX = imageCenterX - viewportCenterX
  const translateY = imageCenterY - viewportCenterY

  const scale = width / window.innerWidth

  return {
    transform: isZoomActive.value
      ? 'translate(-50%, -50%) scale(1)'
      : `translate(calc(-50% + ${translateX}px), calc(-50% + ${translateY}px)) scale(${scale})`,
  }
})

const openPreview = (event) => {
  if (isPreviewActive.value || event.target.tagName !== 'IMG') return

  const img = event.target
  previewSrc.value = img.src
  originalRect.value = img.getBoundingClientRect()
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

// 按下 ESC 键关闭模态框
const handleEsc = (event) => {
  if (event.key === 'Escape' || event.keyCode === 27) {
    closePreview()
  }
}

onMounted(() => {
  window.addEventListener('click', openPreview)
  window.addEventListener('keydown', handleEsc)
})

onUnmounted(() => {
  window.removeEventListener('click', openPreview)
  window.removeEventListener('keydown', handleEsc)
})
</script>
