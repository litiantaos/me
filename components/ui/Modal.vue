<template>
  <Teleport to="body">
    <Transition name="move-up">
      <div
        v-if="isShow"
        class="fixed inset-0 z-100 overflow-y-auto bg-white dark:bg-zinc-800"
      >
        <UiLayout
          :hasUiTitle="hasUiTitle"
          :title="title"
          :hasBack="false"
          :isLoading="isLoading"
        >
          <template #header>
            <div class="flex flex-1 items-center justify-end">
              <button
                class="ri-arrow-down-s-line text-lg"
                @click="close"
              ></button>
            </div>
          </template>

          <template v-if="isSlot">
            <slot></slot>
          </template>

          <template v-else>
            <component
              :is="component"
              v-bind="componentData"
              @close="close"
              @confirm="handleComponentConfirm"
            ></component>
          </template>
        </UiLayout>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const isShow = defineModel('isShow', { default: false })
const isLoading = defineModel('isLoading', { default: false })
const props = defineProps([
  'component',
  'componentData',
  'isSlot',
  'hasUiTitle',
  'title',
])
const emit = defineEmits(['close', 'confirm'])

// 控制页面滚动
const toggleBodyScroll = (isLock) => {
  document.body.style.overflow = isLock ? 'hidden' : ''
}

watch(isShow, (newVal) => {
  toggleBodyScroll(newVal)
})

const close = () => {
  isShow.value = false
  emit('close')
}

const handleComponentConfirm = (data) => {
  emit('confirm', data)
  close()
}

// 按下 ESC 键关闭模态框
const handleEsc = (event) => {
  if (event.key === 'Escape' || event.keyCode === 27) {
    close()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleEsc)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEsc)

  toggleBodyScroll(false)
})
</script>
