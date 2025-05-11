<template>
  <UiLayout :hasHeader="false">
    <div class="mt-64">
      <div class="space-y-10">
        <img
          src="/public/images/me.jpg"
          alt="avatar"
          class="h-12 w-12 rounded-full object-cover"
        />

        <div class="space-y-2">
          <h1 class="text-3xl font-bold">Hello!</h1>
          <h2 class="text-xl font-bold">我是李天涛。</h2>
        </div>

        <div class="space-y-4 text-justify leading-7">
          <p>
            我来自甘肃张掖的一个小农村，2020年毕业于江苏科技大学工业设计专业，现在南京从事产品经理工作。我喜欢设计，喜欢研究新东西，偶尔写写代码。
          </p>

          <p>
            我今年
            <NuxtLink to="/life" class="link-color">
              {{ getAge('1998-03-29') }}岁
            </NuxtLink>
            ，不喜社交，很少在网络上发表内容或评论，也曾努力尝试表达，但终归少些欲望。我还是想在往后的生活中尽量多记录些想法或思考，创造一个自我的
            <NuxtLink to="/note" class="link-color">精神角落</NuxtLink> 。
          </p>

          <p>
            如果你想联系我，可以给我发
            <a href="mailto:to@litiantao.com" class="link-color">邮件</a> 。
          </p>
        </div>
      </div>
    </div>
  </UiLayout>
</template>

<script setup>
useSeoMeta({
  description: '李天涛的个人网站',
})

const getAge = (birthStr) => {
  const [y, m, d] = birthStr.split('-').map(Number)
  const today = new Date()
  let age = today.getFullYear() - y
  // 如果还没到当年生日，减 1
  if (
    today.getMonth() + 1 < m ||
    (today.getMonth() + 1 === m && today.getDate() < d)
  ) {
    age--
  }
  return age
}
</script>
