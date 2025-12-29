<template>
  <h1 class="flex items-center gap-4 font-bold">
    <button v-if="hasUiTitle" class="text-2xl" @click="handleBack">
      <span class="text-blue-500 italic">Taos</span>
      <span>Life</span>
    </button>

    <div
      v-if="title"
      class="text-xl"
      :class="handleTitle ? 'cursor-pointer select-none' : ''"
      @click="handleTitle"
    >
      {{ title }}
    </div>
  </h1>
</template>

<script setup>
const props = defineProps({
  hasUiTitle: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    default: '',
  },
  handleTitle: {
    type: Function,
  },
})

const handleBack = () => {
  // 检查页面是否在顶部
  if (window.scrollY > 0) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    navigateTo('/')
  }
}
</script>
