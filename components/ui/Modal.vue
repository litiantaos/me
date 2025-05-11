<template>
  <Teleport to="body">
    <Transition name="move-up">
      <div v-if="isShow" class="fixed inset-0 z-[100] overflow-y-auto bg-white">
        <UiLayout :uiTitle="uiTitle" :title="title">
          <div class="flex items-center">
            <button
              class="ri-arrow-left-s-line -ml-1.5 text-lg"
              @click="close"
            ></button>
          </div>

          <template v-if="isSlot">
            <slot></slot>
          </template>

          <template v-else>
            <component
              :is="component"
              :data="componentData"
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
const props = defineProps([
  'component',
  'componentData',
  'isSlot',
  'uiTitle',
  'title',
])
const emit = defineEmits(['close', 'confirm'])

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
})
</script>
