import {
  streamText,
  convertToModelMessages,
  createGateway,
  tool,
  stepCountIs,
  jsonSchema,
} from 'ai'
import { AI_MODELS } from '~/utils/ai'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '未登录' })
  }
  checkRateLimit(`ai:chat:${user.sub}`, 10, 60000)

  const { messages, model, systemPrompt } = await readBody(event)

  // SDK 7 的 UIMessage 以 parts 承载内容，content-only 形态会在转换层抛错，此处直接 400
  if (
    !Array.isArray(messages) ||
    !messages.length ||
    !messages.every((m) => m?.role && Array.isArray(m.parts) && m.parts.length)
  ) {
    throw createError({ statusCode: 400, statusMessage: 'messages 格式不合法' })
  }
  const { aiGatewayApiKey, tavilyApiKey } = useRuntimeConfig()

  const provider =
    AI_MODELS[model]?.provider ?? Object.values(AI_MODELS)[0].provider

  const result = streamText({
    model: createGateway({ apiKey: aiGatewayApiKey })(provider),
    messages: await convertToModelMessages(messages),
    system: systemPrompt || undefined,
    maxOutputTokens: 16000,
    stopWhen: stepCountIs(10),
    // 搜索达到 5 次后移除工具使模型基于已有结果输出最终回复
    prepareStep: ({ steps }) => {
      const searchCount = steps.reduce(
        (n, s) =>
          n +
          (s.toolCalls?.filter((c) => c.toolName === 'webSearch').length ?? 0),
        0,
      )
      if (searchCount >= 5) return { activeTools: [] }
    },
    tools: {
      webSearch: tool({
        description:
          '仅在用户明确询问实时信息、近期新闻、当前数据（如天气、股价、最新事件）时才调用。对于通用知识、推理、写作等问题，不要调用此工具。',
        inputSchema: jsonSchema({
          type: 'object',
          properties: {
            query: { type: 'string', description: '搜索查询词' },
          },
          required: ['query'],
        }),
        execute: async ({ query }) => {
          try {
            const data = await $fetch('https://api.tavily.com/search', {
              method: 'POST',
              body: {
                api_key: tavilyApiKey,
                query,
                max_results: 10,
                search_depth: 'basic',
              },
            })
            return (
              data.results?.map((r) => ({
                title: r.title,
                url: r.url,
                content: r.content?.slice(0, 500),
              })) ?? []
            )
          } catch {
            return { error: '搜索请求失败' }
          }
        },
      }),
    },
  })

  return result.toUIMessageStreamResponse()
})
