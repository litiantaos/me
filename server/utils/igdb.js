let accessToken = null
let tokenExpiry = 0

const getAccessToken = async () => {
  const config = useRuntimeConfig()
  const clientId = config.igdbClientId
  const clientSecret = config.igdbClientSecret

  if (accessToken && Date.now() < tokenExpiry - 60000) {
    return accessToken
  }

  const response = await $fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    params: {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    },
  })

  accessToken = response.access_token
  tokenExpiry = Date.now() + response.expires_in * 1000 // 秒转毫秒

  return accessToken
}

export const fetchIgdb = async (endpoint, body) => {
  const token = await getAccessToken()
  const config = useRuntimeConfig()

  return $fetch(`https://api.igdb.com/v4${endpoint}`, {
    method: 'POST',
    headers: {
      'Client-ID': config.igdbClientId,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'text/plain',
    },
    body,
  })
}
