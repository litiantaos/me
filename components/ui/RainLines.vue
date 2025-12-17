<template>
  <div
    class="absolute -top-[50vh] left-1/2 h-[200vh] w-[200vw] -translate-x-1/2 rotate-15 overflow-hidden"
  >
    <div
      v-for="n in 50"
      :key="n"
      class="rain-line bg-black dark:bg-white"
      :style="getRandomStyle()"
    ></div>
  </div>
</template>

<script setup>
const getRandomStyle = () => {
  const duration = 3 + Math.random() * 2 // 随机持续时间
  const delay = Math.random() * 2 // 0-2秒的随机延迟
  const left = Math.random() * 100 // 0-100%的随机水平位置
  const height = 40 + Math.random() * 60 // 40-100px的随机高度
  const opacity = 0.1 + Math.random() * 0.4 // 随机透明度

  return {
    '--duration': `${duration}s`,
    '--delay': `${delay}s`,
    '--left': `${left}%`,
    '--height': `${height}px`,
    '--opacity': opacity,
  }
}
</script>

<style scoped>
.rain-line {
  position: absolute;
  top: -100px;
  left: var(--left);
  width: 1px;
  height: var(--height);
  opacity: var(--opacity);
  animation: rain var(--duration) linear var(--delay) infinite;
}

@keyframes rain {
  0% {
    transform: translateY(0);
    opacity: 0;
  }
  10% {
    opacity: var(--opacity);
  }
  90% {
    opacity: var(--opacity);
  }
  100% {
    transform: translateY(200vh);
    opacity: 0;
  }
}
</style>
