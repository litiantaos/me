# 项目指南

本文档为在此存储库中操作的编码代理提供上下文和指南。

## 1. 项目概览 & 指令

**技术栈:**

- **框架:** Nuxt 4 (Vue 3)
- **语言:** JavaScript
- **样式:** Tailwind CSS v4 (@tailwindcss/vite)
- **后端/数据库:** Supabase (@nuxtjs/supabase)
- **图标:** Remixicon （类名方式）
- **Markdown:** marked (渲染) + highlight.js (代码高亮)
- **部署:** Vercel (Analytics, Speed Insights)

**关键指令:**

- **开发服务器:** `npm run dev`
- **生产构建:** `npm run build`
- **静态生成:** `npm run generate`
- **预览构建:** `npm run preview`
- **代码格式化:** `npx prettier --write .` 或 `npx prettier --write <文件路径>`
- **依赖更新检查:** `npm run check`
- **测试:** 项目未配置自动化测试框架

**注意事项:**

- 项目使用 Prettier 作为唯一的代码格式化工具，未配置 ESLint
- 没有测试框架，代码修改需特别谨慎
- 使用 npm 作为包管理器

## 2. 代码风格 & 规范

**通用格式:**

- **缩进:** 2 个空格。
- **分号:** **无** 分号 (依赖 ASI)。
- **引号:** 优先使用单引号 `'` 而非双引号。
- **尾随逗号:** ES5 风格 (对象, 数组)。
- **行宽:** Prettier 默认配置。

**导入规范:**

- Nuxt 自动导入: Composables、组件、Vue API (`ref`, `computed`, `onMounted` 等) 无需手动导入
- 第三方库需显式导入 (例如: `import { Analytics } from '@vercel/analytics/nuxt'`)
- 工具函数自动从 `utils/` 导入
- 服务端工具函数从 `server/utils/` 自动导入

**Vue/Nuxt 模式:**

- **Composables:** 将逻辑放置在 `composables/` 中，使用 `use[Feature]` 命名约定 (例如 `useNotes.js`)。
  - 使用 `useState` 进行跨组件共享状态管理
  - 返回包含响应式 refs 和异步函数的对象
  - 使用 try-catch-finally 模式处理异步操作
- **组件:** 单文件组件 (.vue)。
  - 使用 `<script setup>` 语法
  - 组件文件名使用 PascalCase (例如 `ScrollView.vue`)
  - Prop 定义使用 `defineProps` 宏，支持类型和默认值
  - 模板中优先使用 `:class` 数组语法结合条件判断
- **数据获取:**
  - 调用服务器 API 路由使用 `$fetch` (例如: `await $fetch('/api/notes/save', { method: 'POST', body: {...} })`)
  - 客户端数据获取使用 `useAsyncData` 或 `useFetch` 以支持 SSR
  - 直接数据库交互使用 `useSupabaseClient()` (仅在客户端简单读写场景)

**Supabase 集成:**

- 使用提供的 composables: `const client = useSupabaseClient()`, `const user = useSupabaseUser()`。
- 错误处理模式:
  ```javascript
  const { data, error } = await client.from('table').select('*')
  if (error) throw error
  ```
- 数据库操作应在服务端 API 中处理敏感逻辑，客户端处理简单的读写。

**命名约定:**

- **文件:**
  - 组件: PascalCase (`MovieCard.vue`)
  - Composables: camelCase (`useMovies.js`)
  - 页面: kebab-case 或单个单词 (`index.vue`, `movie/[id].vue`)
  - API 路由: kebab-case (`server/api/user-profile.js`)
- **变量/函数:** camelCase。
- **常量:** UPPER_SNAKE_CASE。

## 3. 架构 & 结构

- `pages/`: Nuxt 基于文件的路由。支持动态路由 `[id].vue`。
- `components/`: UI 组件。
  - `components/ui/`: 通用 UI 元素 (按钮, 输入框等)。
- `composables/`: 业务逻辑和状态管理。自动导入。
- `server/api/`: API 端点。
  - `server/utils/`: 服务端工具函数。
- `assets/css/`: 全局样式 (`main.css`), tailwind 指令。
- `utils/`: 通用工具函数。
- `public/`: 静态资源 (favicon, robots.txt)。

## 4. 代理工作规则

- **规范优先:** 在编写代码之前，阅读相邻文件以匹配确切的代码风格（分号、引号、间距）。使用 Prettier 保持一致性。
- **无不必要的依赖:** 除非绝对必要并获得批准，否则不要添加 npm 包。
- **代码质量:** 追求极致的代码洁癖和强迫症。必须使用最简洁、高效、优雅的代码实现需求，杜绝冗余。
- **Tailwind:** 使用实用类进行样式设置。除非必要，避免使用自定义 CSS。使用 v4 特性。
- **语言要求:** 所有回答、注释、文档必须严格使用**中文**。
- **服务器管理:** 代码修改或任务完成后，**禁止**主动启动开发服务器（如 `npm run dev`），除非用户明确要求。

## 5. 特定文件指南

- **API 路由 (`server/api/`)**:
  - `defineEventHandler` 是标准入口。
  - 参数从 `event.context.params` 获取，查询参数用 `getQuery(event)`。
  - 使用 `server/utils/` 中的辅助函数来封装复杂的外部 API 调用。
- **页面组件 (`pages/`)**:
  - 页面标题和元数据使用 `useSeoMeta`。
  - 路由参数通过 `useRoute()` 获取。

## 6. 错误处理模式

**Composables 中:**

```javascript
const fetchData = async () => {
  isFetching.value = true
  try {
    const { data, error } = await client.from('table').select()
    if (error) throw error
    return data
  } catch (error) {
    throw error
  } finally {
    isFetching.value = false
  }
}
```

**API 路由中:**

```javascript
export default defineEventHandler(async (event) => {
  const { data, error } = await client.from('table').select()
  if (error) throw error
  return { success: true, data }
})
```

**组件中处理异步错误:**

- 使用 try-catch 包裹 composable 调用
- 通过 loading 状态提供用户反馈

请遵循以上指南以确保代码库的一致性和高质量。
