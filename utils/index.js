export function formatDate(date, format = 'YYYY-MM-DD HH:mm') {
  if (!date) return ''

  const d = date instanceof Date ? date : new Date(date)

  if (isNaN(d.getTime())) return ''

  const padZero = (num) => String(num).padStart(2, '0')

  const formats = {
    YYYY: d.getFullYear(),
    MM: padZero(d.getMonth() + 1),
    DD: padZero(d.getDate()),
    HH: padZero(d.getHours()),
    mm: padZero(d.getMinutes()),
    ss: padZero(d.getSeconds()),
  }

  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, (match) => formats[match])
}

export function throttle(fn, delay = 2000) {
  let lastTime = 0

  return function (...args) {
    const now = Date.now()

    if (now - lastTime >= delay) {
      lastTime = now
      return fn.apply(this, args)
    }
  }
}

export function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
}

export function copyText(text) {
  navigator.clipboard.writeText(text)
}
