<template>
  <div>
    <header
      v-if="hasHeader"
      class="top-0 right-0 left-0 z-50 h-24"
      :class="isFullPage ? 'fixed' : 'sticky'"
    >
      <!-- 模糊渐变背景 -->
      <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 mask-b-from-40% backdrop-blur-xs"></div>
        <div
          class="absolute inset-0 bg-linear-to-b from-white from-1% to-transparent dark:from-zinc-800"
        ></div>
      </div>

      <!-- 标题栏内容 -->
      <div
        class="relative flex h-full items-center gap-4 p-4"
        :class="[titleAlign, { 'mx-auto max-w-2xl': !isFullPage }]"
      >
        <h1 class="flex items-center gap-4 font-bold select-none">
          <button v-if="hasUiTitle" class="text-2xl" @click="handleBack">
            <span class="text-blue-500 italic">Taos</span>
            <span>Life</span>
          </button>

          <div
            v-if="title"
            class="text-xl"
            :class="handleTitle ? 'cursor-pointer' : ''"
            @click="handleTitle"
          >
            {{ title }}
          </div>
        </h1>

        <Transition name="fade">
          <UiLoader v-if="isLoading" />
        </Transition>

        <slot name="header" />
      </div>
    </header>

    <!-- 内容区域 -->
    <div class="relative" :class="{ 'mx-auto max-w-2xl p-4': !isFullPage }">
      <slot />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  hasHeader: {
    type: Boolean,
    default: true,
  },
  hasUiTitle: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    default: '',
  },
  titleAlign: {
    type: String,
    default: 'justify-start',
  },
  handleTitle: {
    type: Function,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  isFullPage: {
    type: Boolean,
    default: false,
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
