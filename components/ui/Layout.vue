<template>
  <div class="mx-auto max-w-2xl p-4">
    <header v-if="hasHeader" class="mb-4 flex h-24 items-center gap-4">
      <NuxtLink to="/">
        <UiTitle :uiTitle="uiTitle" :title="title" />
      </NuxtLink>

      <div>
        <slot name="header" />
      </div>
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
})
</script>
