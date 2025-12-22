<template>
  <div
    class="flex h-7 overflow-hidden transition-all"
    :class="[
      customClass?.base,
      isBtnsOpen ? 'w-30' : 'w-10',
      direction === 'left' ? 'justify-end' : '',
    ]"
  >
    <div
      class="flex h-full w-40 flex-none transition-transform"
      :class="[
        {
          '-translate-x-10': isDeleteConfirm && direction === 'right',
          'translate-x-10': isDeleteConfirm && direction === 'left',
          'flex-row-reverse': direction === 'left',
        },
      ]"
    >
      <button
        class="ri-more-line action-btn"
        :class="customClass.hover"
        @click="handleBtnOpen"
      ></button>
      <button
        class="ri-edit-line action-btn"
        :class="customClass.hover"
        @click="$emit('edit')"
      ></button>
      <button
        class="ri-delete-bin-7-line action-btn text-red-500 dark:text-red-400"
        :class="customClass.hover"
        @click="handleDeleteConfirm"
      ></button>
      <button
        class="action-btn text-blue-500"
        :class="customClass.hover"
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
  direction: {
    type: String,
    default: 'right',
  },
  customClass: {
    type: Object,
    default: () => ({
      base: 'bg-zinc-100 dark:bg-zinc-700 rounded-md',
      hover: 'hover:bg-zinc-200/80 dark:hover:bg-zinc-600/80',
    }),
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
  @apply flex h-full flex-1 items-center justify-center transition-colors;
}
</style>
