// 将 data/resume.local.js 推送到云端 Supabase resume 表（id=main）
// 用法：npm run resume:push（由 package.json 注入 --env-file=.env）
const required = (data) =>
  data?.basics?.host &&
  Array.isArray(data.strengths) &&
  Array.isArray(data.jobs) &&
  Array.isArray(data.achievements)

const { default: data } = await import('../data/resume.local.js')

if (!required(data)) {
  console.error(
    '简历数据结构不完整（basics/strengths/jobs/achievements），中止推送',
  )
  process.exit(1)
}

// PATCH 同时刷新 updated_at（列仅有 INSERT 默认值，不随更新变化）
const body = JSON.stringify({ data, updated_at: new Date().toISOString() })
if (body.includes('\ufffd')) {
  console.error('数据含损坏字符（U+FFFD），中止推送')
  process.exit(1)
}

const url = `${process.env.SUPABASE_URL}/rest/v1/resume?id=eq.main`
const headers = {
  apikey: process.env.SUPABASE_SECRET_KEY,
  Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
  'Content-Type': 'application/json',
}

const res = await fetch(url, { method: 'PATCH', headers, body })
if (!res.ok) {
  console.error(`推送失败：HTTP ${res.status}`, await res.text())
  process.exit(1)
}
console.log(
  `已推送至云端（${data.basics.intention} · ${data.jobs.length} 段经历）`,
)
