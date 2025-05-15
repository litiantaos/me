<template>
  <UiLayout :hasHeader="false" :isLoading="isLoading">
    <div class="mt-64 space-y-10">
      <div class="flex items-center gap-4">
        <NuxtLink to="/">
          <UiTitle :title="isLogin ? '登录' : '注册'" />
        </NuxtLink>
      </div>

      <form class="mt-6 w-full space-y-6" @submit.prevent="handleSubmit">
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="邮箱"
          required
          class="input-base w-full"
        />

        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="密码"
          required
          class="input-base w-full"
        />

        <!-- 提示信息 -->
        <div
          v-if="message"
          :class="[
            'w-full rounded-md p-3',
            message.type === 'success'
              ? 'bg-green-50 text-green-500'
              : 'bg-red-50 text-red-500',
          ]"
        >
          {{ message.text }}
        </div>

        <button
          type="submit"
          class="btn-base w-full bg-blue-500! text-white sm:hover:bg-blue-500/90!"
          :disabled="isLoading"
        >
          {{ isLogin ? '登录' : '注册' }}
        </button>

        <div class="text-center text-sm">
          <button
            @click="toggleAuthMode"
            class="text-blue-500 sm:hover:underline"
          >
            {{ isLogin ? '注册' : '登录' }}
          </button>
        </div>
      </form>
    </div>
  </UiLayout>
</template>

<script setup>
const client = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

const email = ref('')
const password = ref('')
const isLogin = ref(true)
const isLoading = ref(false)
const message = ref(null)

// 如果用户已登录，重定向到首页
watchEffect(() => {
  if (user.value) {
    router.push('/')
  }
})

// 切换登录/注册模式
const toggleAuthMode = () => {
  isLogin.value = !isLogin.value
  message.value = null
}

// 处理登录或注册
const handleSubmit = async () => {
  isLoading.value = true
  message.value = null

  try {
    if (isLogin.value) {
      // 登录
      const { error } = await client.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      })

      if (error) throw error
    } else {
      // 注册
      const { error } = await client.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      })

      if (error) throw error

      message.value = {
        type: 'success',
        text: '注册邮件已发送，请查收邮箱并点击验证链接完成注册',
      }
    }
  } catch (error) {
    message.value = {
      type: 'error',
      text: error.message || '操作失败，请重试',
    }
  } finally {
    isLoading.value = false
  }
}
</script>
