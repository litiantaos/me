export const useShici = () => {
  const shici = useState('shici', () => null)

  const fetchShiciToken = async () => {
    try {
      const localToken = localStorage.getItem('shici_token')
      if (localToken) {
        return localToken
      }

      const response = await fetch('https://v2.jinrishici.com/token')
      const data = await response.json()

      const token = data.data
      localStorage.setItem('shici_token', token)
      return token
    } catch (error) {
      console.error('Failed to fetch shici token:', error)
    }
  }

  const fetchShici = async () => {
    try {
      const token = await fetchShiciToken()

      const response = await fetch(
        `https://v2.jinrishici.com/sentence?client=npm-sdk/1.0&X-User-Token=${encodeURIComponent(token)}`,
      )
      const data = await response.json()

      shici.value = data.data
    } catch (error) {
      console.error('Failed to fetch shici:', error)
    }
  }

  return {
    shici,
    fetchShici,
  }
}
