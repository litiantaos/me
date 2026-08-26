<template>
  <div>
    <div class="fixed inset-0 z-[-1]">
      <UiRainLines />
    </div>

    <div
      v-if="shici"
      class="p-4 text-center transition-transform duration-300"
      :class="isShiciShow ? 'translate-y-[30vh]' : 'translate-y-[40vh]'"
    >
      <p class="text-2xl font-bold sm:text-5xl">
        {{ shici.content }}
      </p>

      <p class="mt-10 space-x-2">
        <button class="link-base font-medium" @click="toggleShiciShow">
          《{{ shici.origin?.title }}》
        </button>
        <span>{{ shici.origin?.dynasty }}</span>
        <span>{{ shici.origin?.author }}</span>
      </p>

      <Transition name="fade">
        <div v-if="isShiciShow" class="mt-20 leading-7">
          <p
            v-for="p in shici.origin?.content"
            :key="p"
            v-html="escapeHtml(p).replace(/。/g, '。<br>')"
          ></p>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
const { shici, fetchShici } = useShici()
const isShiciShow = ref(false)

// 转义 HTML 特殊字符，防止第三方 API 内容注入
const escapeHtml = (str) =>
  String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const toggleShiciShow = () => {
  if (window.scrollY > 0) {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  isShiciShow.value = !isShiciShow.value
}

onMounted(async () => {
  if (!shici.value) {
    await fetchShici()
  }
})

useSeoMeta({
  title: '有诗有词',
  description: '随机诗词，随机感受。',
})
</script>
