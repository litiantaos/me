<template>
  <div class="flex h-screen w-screen items-center justify-center p-4">
    <div v-if="shici" class="text-center">
      <p class="text-5xl font-bold">
        {{ shici.content }}
      </p>

      <p class="mt-10 space-x-2">
        <span
          class="link-color cursor-pointer font-medium"
          @click="isModalShow = !isModalShow"
          >《{{ shici.origin?.title }}》</span
        >
        <span>{{ shici.origin?.dynasty }}</span>
        <span>{{ shici.origin?.author }}</span>
      </p>

      <UiModal
        v-model:isShow="isModalShow"
        :isSlot="true"
        :hasUiTitle="false"
        :title="shici.origin?.title"
      >
        <div class="text-center leading-7">
          <template v-for="p in shici.origin?.content" :key="p">
            <p v-html="p.replace(/。/g, '。<br>')"></p>
          </template>
        </div>
      </UiModal>
    </div>
  </div>
</template>

<script setup>
const { shici } = useShici()
const isModalShow = ref(false)
</script>
