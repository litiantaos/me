<template>
  <div class="absolute inset-0 z-0 select-none">
    <!-- 模糊层 -->
    <div
      class="absolute inset-0 backdrop-blur-xs"
      :class="direction === 'bottom' ? 'mask-b-from-40%' : 'mask-t-from-40%'"
    ></div>

    <!-- 渐变层 -->
    <div
      class="absolute inset-0"
      :class="
        direction === 'bottom'
          ? 'bg-linear-to-b from-white from-1% to-transparent dark:from-zinc-800'
          : 'bg-linear-to-t from-white from-1% to-transparent dark:from-zinc-800'
      "
    ></div>
  </div>
</template>

<script setup>
defineProps({
  direction: {
    type: String,
    default: 'bottom', // 'bottom' | 'top'
  },
})
</script>
