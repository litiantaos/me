import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '未登录' })
  }
  checkRateLimit(`ai:credits:${user.sub}`, 10, 60000)

  const { aiGatewayApiKey } = useRuntimeConfig()

  try {
    return await $fetch('https://ai-gateway.vercel.sh/v1/credits', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${aiGatewayApiKey}`,
      },
    })
  } catch {
    throw createError({ statusCode: 502, statusMessage: '额度查询失败' })
  }
})
