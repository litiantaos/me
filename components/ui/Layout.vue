<template>
  <div
    class="mx-auto max-w-2xl p-4"
    :class="{ 'flex h-screen flex-col': isHScreen }"
  >
    <header
      v-if="hasHeader"
      class="sticky top-0 z-50 mb-4 flex h-24 items-center gap-4 bg-linear-to-b from-white to-transparent dark:from-zinc-800"
      :class="{ 'flex-none': isHScreen }"
    >
      <UiTitle
        :class="{ 'cursor-pointer': hasBack }"
        :hasUiTitle="hasUiTitle"
        :title="title"
        @click="handleBack"
      />

      <Transition name="fade">
        <UiLoader v-if="isLoading" />
      </Transition>

      <slot name="header" />
    </header>

    <div :class="{ 'flex-1': isHScreen }">
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
  isLoading: {
    type: Boolean,
    default: false,
  },
  hasBack: {
    type: Boolean,
    default: true,
  },
  isHScreen: {
    type: Boolean,
    default: false,
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
