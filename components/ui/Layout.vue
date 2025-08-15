<template>
  <div>
    <header
      v-if="hasHeader"
      class="sticky top-0 z-50 h-24 bg-linear-to-b from-white to-transparent dark:from-zinc-800"
    >
      <div class="mx-auto flex h-full max-w-2xl items-center gap-4 p-4">
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
      </div>
    </header>

    <div class="mx-auto max-w-2xl p-4">
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
