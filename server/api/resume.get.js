// 简历内容存于 Supabase resume 表（单行 JSONB，id=main），服务端读取后经 /api/resume 下发
// 表未开放匿名/用户策略，须以 service role（绕过 RLS）读取，密钥经 NUXT_SUPABASE_SECRET_KEY 注入
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // 数据含个人信息，禁止搜索引擎索引缓存此 JSON 响应
  setResponseHeader(event, 'X-Robots-Tag', 'noindex')

  const client = serverSupabaseServiceRole(event)
  const { data, error } = await client
    .from('resume')
    .select('data')
    .eq('id', 'main')
    .maybeSingle()

  if (error) {
    console.error('读取简历数据失败', error)
    throw createError({ statusCode: 500, statusMessage: '简历数据读取失败' })
  }

  return data?.data ?? null
})
