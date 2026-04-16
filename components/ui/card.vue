<template>
  <div
    class="group relative overflow-hidden rounded-md border border-zinc-100 dark:border-zinc-700"
  >
    <div
      ref="cardRef"
      class="relative aspect-1200/630 w-full overflow-hidden bg-white backdrop-blur-xl transition-all duration-500 dark:bg-zinc-800"
    >
      <!-- 模糊渐变流动背景 -->
      <div
        class="pointer-events-none absolute inset-0 -z-10 opacity-60 transition-opacity duration-500 dark:opacity-40"
      >
        <div
          class="animate-blob absolute top-8 left-1/2 h-48 w-48 rounded-full bg-blue-300/50 mix-blend-multiply blur-2xl dark:bg-blue-600/30 dark:mix-blend-lighten"
        ></div>
        <div
          class="animate-blob animation-delay-2000 absolute top-24 left-[55%] h-48 w-48 rounded-full bg-cyan-300/50 mix-blend-multiply blur-2xl dark:bg-cyan-600/30 dark:mix-blend-lighten"
        ></div>
        <div
          class="animate-blob animation-delay-4000 absolute -bottom-16 left-[45%] h-48 w-48 rounded-full bg-teal-300/50 mix-blend-multiply blur-2xl dark:bg-teal-600/30 dark:mix-blend-lighten"
        ></div>
      </div>

      <!-- 内容 -->
      <div
        class="relative z-10 flex h-full w-full flex-col items-center justify-center text-center"
      >
        <div
          class="text-[34px] font-bold tracking-tight text-zinc-800 dark:text-zinc-100"
        >
          <span class="text-blue-500 italic">Taos</span>
          <span>Life</span>
        </div>

        <p class="mt-1 font-light text-zinc-400">松花酿酒，春水煎茶</p>

        <p class="absolute bottom-5 text-sm text-zinc-400">litiantao.com</p>
      </div>
    </div>

    <!-- 下载按钮 -->
    <button
      @click="saveAsImage"
      class="btn-base absolute top-2 right-2 opacity-0 group-hover:opacity-100"
    >
      <i class="ri-arrow-down-line"></i>
    </button>
  </div>
</template>

<script setup>
import { toPng } from 'html-to-image'

const cardRef = ref(null)

const saveAsImage = async () => {
  if (!cardRef.value) return

  try {
    const dataUrl = await toPng(cardRef.value, {
      quality: 1,
      pixelRatio: 2, // 清晰度
    })

    const link = document.createElement('a')
    link.download = 'card.png'
    link.href = dataUrl
    link.click()
  } catch (error) {
    console.error('导出图片失败:', error)
  }
}
</script>

<style scoped>
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(15px, -20px) scale(1.1);
  }
  66% {
    transform: translate(-10px, 10px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 8s infinite ease-in-out;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>
