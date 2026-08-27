// 内存固定窗口限流：各实例独立计数（多实例部署下仅作基础防护），进程重启即清零，超限统一抛 429
const buckets = new Map()

export const checkRateLimit = (key, limit, windowMs) => {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || now >= bucket.resetAt) {
    // 顺带清理过期条目，避免不再活跃的 key 无界累积
    for (const [k, b] of buckets) {
      if (now >= b.resetAt) buckets.delete(k)
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return
  }

  bucket.count += 1
  if (bucket.count > limit) {
    throw createError({ statusCode: 429, statusMessage: '请求过于频繁' })
  }
}
