// 内存固定窗口限流，进程重启即清零，超限统一抛 429
const buckets = new Map()

export const checkRateLimit = (key, limit, windowMs) => {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return
  }

  bucket.count += 1
  if (bucket.count > limit) {
    throw createError({ statusCode: 429, statusMessage: '请求过于频繁' })
  }
}
