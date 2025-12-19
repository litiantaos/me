<template>
  <UiLayout :hasHeader="false">
    <div class="mt-[25vh]">
      <img
        src="/public/images/me.jpg"
        alt="avatar"
        class="h-12 w-12 rounded-full object-cover"
      />

      <h1 class="mt-10 text-3xl font-bold">Hello!</h1>
      <h2 class="mt-2 text-xl font-bold">我是{{ name }}。</h2>

      <div class="mt-10 space-y-4 text-justify leading-7">
        <p>
          我来自甘肃一个小农村，2020年毕业于江苏科技大学工业设计专业，现在南京从事产品经理工作。热爱设计，喜欢研究新东西，偶尔写写
          <a :href="github" target="_blank" class="link-color">代码</a>
          。
        </p>

        <p>
          我今年
          <NuxtLink to="/life" class="link-color">{{ currentAge }}岁</NuxtLink>
          ，性格内敛，不喜社交，极少在网络上发表内容或与人互动，这自然而然的出现了一种边缘与落寞感，也源于作为社恐的挣扎与救赎，我建立了这个独特的
          <NuxtLink to="/note" class="link-color">精神角落</NuxtLink>
          来记录自己的想法和生活，还有看过的
          <NuxtLink to="/movie" class="link-color">电影</NuxtLink>
          等等，幸运的话，也许能让你了解我。
        </p>

        <p>
          如果想交个朋友，欢迎通过
          <a :href="`mailto:${email}`" class="link-color">邮件</a>
          联系我。
        </p>
      </div>
    </div>
  </UiLayout>
</template>

<script setup>
const { currentAge } = useAge()
const {
  public: { name, email, github },
} = useRuntimeConfig()
</script>
