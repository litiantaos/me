<template>
  <UiLayout :hasHeader="false">
    <div class="mt-[25vh]">
      <img
        src="/public/images/me.jpg"
        alt="avatar"
        class="h-12 w-12 rounded-full object-cover"
      />

      <h1 class="mt-10 text-3xl font-bold">Hello!</h1>
      <h2 class="mt-2 text-xl font-bold">我是李天涛。</h2>

      <div class="mt-10 space-y-4 text-justify leading-7">
        <p>
          我来自甘肃的一个小农村，2020年毕业于江苏科技大学工业设计专业，现在南京从事产品经理工作。热爱设计，喜欢研究新东西，偶尔写写代码。之前为了求职整理过一些
          <a
            href="https://mp.weixin.qq.com/s/X1-h5l0-f6iN-ksMNwVWgA"
            target="_blank"
            class="link-color"
            >设计作品</a
          >
          ，现在看来虽显稚嫩，但也有可取之处。我在设计师岗位上并没有待多久，后来转向产品发展，闲暇之余也会写一些小项目，我把其中一些放在了
          <a
            href="https://github.com/litiantaos"
            target="_blank"
            class="link-color"
            >Github</a
          >
          上，希望有助于人。
        </p>

        <p>
          我今年
          <NuxtLink to="/life" class="link-color">{{ currentAge }}岁</NuxtLink>
          ，性格内敛，不喜社交，很少在网络上发表内容或与人互动，往后的日子里，我会尽量在这个独特的
          <NuxtLink to="/note" class="link-color">精神角落</NuxtLink>
          中记录自己的想法和生活，幸运的话，也许可以让你了解我。
        </p>

        <p>
          如果想交个朋友，欢迎通过
          <a href="mailto:to@litiantao.com" class="link-color">邮件</a>
          联系我。
        </p>
      </div>
    </div>
  </UiLayout>
</template>

<script setup>
const { currentAge } = useAge()
</script>
