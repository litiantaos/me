<template>
  <div
    class="h-7 overflow-hidden rounded-md bg-zinc-100 transition-all dark:bg-zinc-700"
    :class="isBtnsOpen ? 'w-30' : 'w-10'"
  >
    <div
      class="flex h-full w-40 transition-transform"
      :class="{ '-translate-x-10': isDeleteConfirm }"
    >
      <button class="ri-more-line action-btn" @click="handleBtnOpen"></button>
      <button class="ri-edit-line action-btn" @click="$emit('edit')"></button>
      <button
        class="ri-delete-bin-7-line action-btn text-red-500"
        @click="handleDeleteConfirm"
      ></button>
      <button
        class="action-btn text-blue-500"
        @click="$emit('delete')"
        :disabled="isDeleting"
      >
        <UiLoader v-if="isDeleting" size="sm"></UiLoader>
        <i v-else class="ri-check-line"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isDeleting: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['edit', 'delete'])

const isDeleteConfirm = ref(false)
const isBtnsOpen = ref(false)
const btnsCloseTimer = ref(null)

const resetCloseTimer = () => {
  clearTimeout(btnsCloseTimer.value)

  btnsCloseTimer.value = setTimeout(() => {
    if (isDeleteConfirm.value) {
      isDeleteConfirm.value = false
      setTimeout(() => {
        isBtnsOpen.value = false
      }, 300)
    } else {
      isBtnsOpen.value = false
    }
  }, 3000)
}

const handleDeleteConfirm = () => {
  isDeleteConfirm.value = !isDeleteConfirm.value
  if (isBtnsOpen.value) {
    resetCloseTimer()
  }
}

const handleBtnOpen = () => {
  isBtnsOpen.value = !isBtnsOpen.value
  if (isBtnsOpen.value) {
    resetCloseTimer()
  } else {
    clearTimeout(btnsCloseTimer.value)
  }
}

onUnmounted(() => {
  clearTimeout(btnsCloseTimer.value)
})
</script>

<style scoped>
@reference "tailwindcss";

.action-btn {
  @apply flex h-full flex-1 items-center justify-center transition-colors hover:bg-zinc-200/80 dark:hover:bg-zinc-600/80;
}
</style>
