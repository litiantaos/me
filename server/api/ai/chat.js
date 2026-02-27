import {
  streamText,
  convertToModelMessages,
  createGateway,
  tool,
  stepCountIs,
  jsonSchema,
} from 'ai'
import { AI_MODELS } from '~/utils/ai'

export default defineEventHandler(async (event) => {
  const { messages, model, systemPrompt } = await readBody(event)
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
