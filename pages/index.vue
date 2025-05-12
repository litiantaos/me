<template>
  <UiLayout :hasHeader="false">
    <div class="mt-[25vh]">
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
            我来自甘肃张掖的一个小农村，2020年毕业于江苏科技大学工业设计专业，现居南京从事产品经理工作。热爱设计，喜欢研究新事物，偶尔写写代码。
          </p>

          <p>
            我今年
            <NuxtLink to="/life" class="link-color"
              >{{ getAge('1998-03-29') }}岁</NuxtLink
            >
            ，性格内敛，不喜社交，很少在网络上发表内容或与人互动，我希望在往后的日子里能通过这个独特的
            <NuxtLink to="/note" class="link-color">精神角落</NuxtLink>
            记录自己的生活和想法，幸运的话，也许可以让远方的你了解我。
          </p>

          <p>
            如果想交个朋友，欢迎通过
            <a href="mailto:to@litiantao.com" class="link-color">邮件</a>
            联系我。
          </p>
        </div>
      </div>
    </div>
  </UiLayout>
</template>

<script setup>
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
