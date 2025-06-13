<template>
  <div class="rain-container">
    <div
      v-for="n in 50"
      :key="n"
      class="rain-line"
      :style="getRandomStyle()"
    ></div>
  </div>
</template>

<script setup>
const getRandomStyle = () => {
  const duration = 2 + Math.random() * 2 // 2-4秒的随机持续时间
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
.rain-container {
  position: absolute;
  top: calc(-100vh * 0.3);
  width: 130vw;
  height: 130vh;
  overflow: hidden;
  transform: rotate(15deg);
  transform-origin: top left;
}

.rain-line {
  position: absolute;
  top: -100px;
  left: var(--left);
  width: 1px;
  height: var(--height);
  background: black;
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
    transform: translateY(130vh);
    opacity: 0;
  }
}
</style>
