// 格式化日期时间
export const formatDate = (date, format = 'YYYY-MM-DD HH:mm') => {
  if (!date) return ''

  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return ''

  const padZero = (num) => String(num).padStart(2, '0')
  const formatMap = {
    YYYY: () => d.getFullYear(),
    MM: () => padZero(d.getMonth() + 1),
    DD: () => padZero(d.getDate()),
    HH: () => padZero(d.getHours()),
    mm: () => padZero(d.getMinutes()),
    ss: () => padZero(d.getSeconds()),
  }

  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, (match) => formatMap[match]())
}

// 解析本地日期，避免 new Date('YYYY-MM-DD') 导致 UTC 偏移；畸形输入返回 null 而非 Invalid Date
export const parseLocalDate = (dateString) => {
  if (!dateString) return null
  const [year, month, day] = String(dateString)
    .slice(0, 10)
    .split('-')
    .map(Number)
  const d = new Date(year, month - 1, day)
  return Number.isNaN(d.getTime()) ? null : d
}

// 节流函数
export const throttle = (fn, delay = 2000) => {
  let lastTime = 0

  return function (...args) {
    const now = Date.now()

    if (now - lastTime >= delay) {
      lastTime = now
      return fn.apply(this, args)
    }
  }
}

// 防抖函数
export const debounce = (fn, delay = 500) => {
  let timer = null

  return function (...args) {
    if (timer) clearTimeout(timer)

    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// 格式化文件大小
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
}

export const copyText = (text) => {
  navigator.clipboard.writeText(text)
}
