export default defineEventHandler(async (event) => {
  const { aiGatewayApiKey } = useRuntimeConfig()

  const response = await $fetch('https://ai-gateway.vercel.sh/v1/credits', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${aiGatewayApiKey}`,
    },
  })

  return response
})
