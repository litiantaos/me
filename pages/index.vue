<template>
  <UiLayout :hasHeader="false">
    <div class="mt-[25vh]">
      <img
        src="/images/me.webp"
        :alt="`${name}头像`"
        class="h-12 w-12 rounded-full object-cover"
      />

      <h1>
        <span class="mt-10 block text-3xl font-bold">Hello!</span>
        <span class="mt-2 block text-xl font-bold">我是{{ name }}。</span>
      </h1>

      <div class="mt-10 space-y-4 text-justify leading-7">
        <p>
          我来自甘肃一个小农村，2020年毕业于江苏科技大学工业设计专业，现在南京从事产品经理工作。热爱设计，喜欢研究
          <NuxtLink to="/ai" class="link-base">新东西</NuxtLink>
          ，偶尔写写
          <a :href="github" target="_blank" class="link-base">代码</a>
          。
        </p>

        <p>
          我今年
          <NuxtLink to="/life" class="link-base">{{ currentAge }}岁</NuxtLink>
          ，性格内敛，不喜社交，极少在网络上发布内容或与人互动，这种状态使我产生了一种空虚与不安，作为社恐的救赎，我建立了这个独特的精神角落来记录自己的
          <NuxtLink to="/note" class="link-base">想法</NuxtLink>
          ，还有看过的
          <NuxtLink to="/hobby" class="link-base">电影</NuxtLink>
          、走过的
          <NuxtLink to="/place" class="link-base">地方</NuxtLink>
          等等，幸运的话，也许能让你了解我。
        </p>

        <p>
          如果想交个朋友，欢迎通过
          <a :href="`mailto:${email}`" class="link-base">邮件</a>
          联系我。
        </p>
      </div>
    </div>
  </UiLayout>
</template>

<script setup>
const { currentAge } = useProfile()
const {
  public: { name, email, github },
} = useRuntimeConfig()

useSeoMeta({
  title: name,
})
</script>
