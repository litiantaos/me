<template>
  <UiLayout title="嘟嘟">
    <UiMediaPreview />

    <p class="mb-6 text-justify leading-7">
      这是嘟嘟，一只乖巧的布偶公猫，今年 {{ duduAge }} 岁了。
    </p>

    <div class="grid gap-3">
      <div
        v-for="photo in photos"
        :key="photo"
        class="aspect-square overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-700"
      >
        <img
          :src="photo"
          alt="嘟嘟"
          class="h-full w-full cursor-zoom-in object-cover"
        />
      </div>
    </div>
  </UiLayout>
</template>

<script setup>
// 新增照片时，将图片放至 public/images/dudu/ 并在此数组中追加路径
const photos = ['/images/dudu/dudu.webp']

const duduBirthDate = '2023-06-12'

const duduAge = computed(() => {
  const today = new Date()
  const birthday = parseLocalDate(duduBirthDate)
  let age = today.getFullYear() - birthday.getFullYear()
  const monthDiff = today.getMonth() - birthday.getMonth()

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthday.getDate())
  ) {
    age--
  }

  return age
})

useSeoMeta({
  title: '嘟嘟',
  description: '我的布偶猫嘟嘟。',
})
</script>
