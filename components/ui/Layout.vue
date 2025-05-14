<template>
  <div class="mx-auto max-w-2xl p-4">
    <header
      v-if="hasHeader"
      class="sticky top-0 z-50 mb-4 flex h-24 items-center gap-4 bg-linear-to-b from-white to-transparent"
    >
      <UiTitle
        :class="{ 'cursor-pointer': hasBack }"
        :uiTitle="uiTitle"
        :title="title"
        @click="handleBack"
      />

      <Transition name="fade">
        <UiLoader v-if="isLoading" />
      </Transition>

      <slot name="header" />
    </header>

    <slot />
  </div>
</template>

<script setup>
const props = defineProps({
  hasHeader: {
    type: Boolean,
    default: true,
  },
  uiTitle: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    default: '',
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  hasBack: {
    type: Boolean,
    default: true,
  },
})

const handleBack = () => {
  if (!props.hasBack) return

  // 检查页面是否在顶部
  if (window.scrollY > 0) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    navigateTo('/')
  }
}
</script>
