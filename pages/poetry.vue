<template>
  <div class="p-4 text-center">
    <div
      v-if="shici"
      class="mt-[40vh] transition-transform duration-500"
      :class="{ '-translate-y-20': isShiciShow }"
    >
      <div>
        <p class="text-5xl font-bold">
          {{ shici.content }}
        </p>

        <p class="mt-10 space-x-2">
          <span
            class="link-color cursor-pointer font-medium"
            @click="toggleShiciShow"
            >《{{ shici.origin?.title }}》</span
          >
          <span>{{ shici.origin?.dynasty }}</span>
          <span>{{ shici.origin?.author }}</span>
        </p>
      </div>

      <Transition name="fade">
        <div v-if="isShiciShow" class="mt-20 leading-7">
          <template v-for="p in shici.origin?.content" :key="p">
            <p v-html="p.replace(/。/g, '。<br>')"></p>
          </template>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
const { shici, fetchShici } = useShici()
const isShiciShow = ref(false)

onMounted(async () => {
  if (!shici.value) {
    await fetchShici()
  }
})

const toggleShiciShow = () => {
  if (window.scrollY > 0) {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  isShiciShow.value = !isShiciShow.value
}

useSeoMeta({
  title: '有诗有词',
  description: '随机诗词，随机感受。',
})
</script>
