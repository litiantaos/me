<template>
  <div class="flex h-screen w-screen items-center justify-center p-4">
    <div v-if="shiciData" class="text-center">
      <p class="text-5xl font-bold">
        {{ shiciData.content }}
      </p>

      <p class="mt-10 space-x-2">
        <span
          class="link-color cursor-pointer font-medium"
          @click="isModalShow = !isModalShow"
          >《{{ shiciData.origin?.title }}》</span
        >
        <span>{{ shiciData.origin?.dynasty }}</span>
        <span>{{ shiciData.origin?.author }}</span>
      </p>

      <UiModal
        v-model:isShow="isModalShow"
        :isSlot="true"
        :hasUiTitle="false"
        :title="shiciData.origin?.title"
      >
        <div class="text-center leading-7">
          <template v-for="p in shiciData.origin?.content" :key="p">
            <p v-html="addLineBreakAfterDots(p)"></p>
          </template>
        </div>
      </UiModal>
    </div>
  </div>
</template>

<script setup>
const shiciData = ref(null)
const isModalShow = ref(false)

const addLineBreakAfterDots = (str) => {
  // 找到最后一个句号的位置
  const lastDotIndex = str.lastIndexOf('。')

  // 如果没有句号或只有一个句号，直接返回原字符串
  if (lastDotIndex === -1 || str.indexOf('。') === lastDotIndex) {
    return str
  }

  // 将除最后一个句号外的所有句号替换为"。\n"
  return (
    str.slice(0, lastDotIndex).replace(/。/g, '。<br>') +
    str.slice(lastDotIndex)
  )
}

onMounted(async () => {
  shiciData.value = await getShici()
})
</script>
