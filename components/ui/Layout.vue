<template>
  <div>
    <header v-if="hasHeader" class="sticky top-0 z-50 h-24">
      <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 mask-b-from-40% backdrop-blur-xs"></div>
        <div
          class="absolute inset-0 bg-linear-to-b from-white from-1% to-transparent dark:from-zinc-800"
        ></div>
      </div>

      <div
        class="relative mx-auto flex h-full max-w-2xl items-center gap-4 p-4"
      >
        <UiTitle
          :hasUiTitle="hasUiTitle"
          :title="title"
          :handleTitle="handleTitle"
        />

        <Transition name="fade">
          <UiLoader v-if="isLoading" />
        </Transition>

        <slot name="header" />
      </div>
    </header>

    <div class="relative mx-auto max-w-2xl p-4">
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
  handleTitle: {
    type: Function,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})
</script>
