<template>
  <div class="min-h-screen p-4 text-center">
    <template v-if="shici">
      <div
        class="transition-all duration-300"
        :class="isShiciShow ? 'mt-[30vh]' : 'mt-[40vh]'"
      >
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
    </template>
  </div>
</template>

<script setup>
const { shici, fetchShici } = useShici()
const isShiciShow = ref(false)

if (!shici.value) {
  useLazyAsyncData(async () => {
    await fetchShici()
  })
}

const toggleShiciShow = () => {
  if (window.scrollY > 0) {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  isShiciShow.value = !isShiciShow.value
}
</script>
