<template>
  <div class="svg-loader" :class="sizeClass">
    <svg width="100%" height="100%" viewBox="0 0 50 50">
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="currentColor"
        stroke-width="5"
        stroke-linecap="round"
        stroke-dasharray="31.416"
        stroke-dashoffset="31.416"
        class="circle-path"
      />
    </svg>
  </div>
</template>

<script setup>
const props = defineProps({
  size: {
    type: String,
    default: 'md',
  },
})

const sizeClass = computed(() => {
  const sizeMap = {
    sm: 'size-[14px]',
    md: 'size-[16px]',
    lg: 'size-[18px]',
  }
  return sizeMap[props.size]
})
</script>

<style scoped>
.svg-loader {
  animation: rotate 2s linear infinite;
}

.circle-path {
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}
</style>
