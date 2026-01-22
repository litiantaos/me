# 项目指南

本文档为在此存储库中操作的编码代理提供上下文和指南。

## 1. 项目概览 & 指令

**技术栈:**

- **框架:** Nuxt 4 (Vue 3)
- **语言:** TypeScript & JavaScript (混合)
- **样式:** Tailwind CSS v4 (@tailwindcss/vite)
- **后端/数据库:** Supabase (@nuxtjs/supabase)
- **图标:** Remixicon
- **部署:** Vercel (Analytics, Speed Insights)

**关键指令:**

- **开发服务器:** `npm run dev` (运行 `nuxt dev`)
- **生产构建:** `npm run build` (运行 `nuxt build`)
- **静态生成:** `npm run generate`
- **预览:** `npm run preview`
- **类型检查:** `npx nuxi typecheck` (若适用)
- **Lint/格式化:** `npx prettier --write .` (Prettier 是主要的格式化工具，包含 Tailwind 插件)
- **依赖检查:** `npm run check` (npm-check-updates)
- **测试:** `package.json` 中目前未配置自动化测试框架 (Vitest/Jest)。

## 2. 代码风格 & 规范

**通用格式:**

- **缩进:** 2 个空格。
- **分号:** **无** 分号 (依赖 ASI)。
- **引号:** 优先使用单引号 `'` 而非双引号。
- **尾随逗号:** ES5 风格 (对象, 数组)。
- **行宽:** Prettier 默认配置。

**Vue/Nuxt 模式:**

- **Composables:** 将逻辑放置在 `composables/` 中，使用 `use[Feature]` 命名约定 (例如 `useMovies.js`)。
  - 在 composables 中使用 `useState` 进行共享状态管理。
  - 返回包含响应式 refs 和异步函数的对象。
- **组件:** 单文件组件 (.vue)。
  - 使用 `<script setup>` 语法。
  - 组件文件名使用 PascalCase (例如 `ScrollView.vue`)。
  - Prop 定义优先使用 `defineProps` 宏。
- **数据获取:**
  - 服务器 API 路由 (`/api/...`) 使用 `$fetch`。
  - 客户端数据获取使用 `useAsyncData` 或 `useFetch` 以支持 SSR。
  - 直接数据库交互使用 `useSupabaseClient()`。

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
- **常量:** UPPER_SNAKE_CASE (仅针对真正的常量)。

**语言 & 注释:**

- **注释:** 注释通常为 **中文** (例如 `// 获取全部笔记`)。修改现有注释块时请保持此风格。
- **字符串:** 硬编码的 UI 字符串通常为中文。
- **文档:** 保持主要文档（如本文件）使用中文。

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

## 4. 代理工作流规则

1.  **规范优先:** 在编写代码之前，阅读相邻文件以匹配确切的代码风格（分号、引号、间距）。使用 Prettier 保持一致性。
2.  **无不必要的依赖:** 除非绝对必要并获得批准，否则不要添加 npm 包。
3.  **Supabase:** 修改数据库查询时，确保处理客户端返回的 `error` 对象。
4.  **Tailwind:** 使用实用类进行样式设置。除非必要，避免使用自定义 CSS。使用 v4 特性。
5.  **安全:** 由于没有自动化测试，更改逻辑时要格外小心。仔细检查类型和空值检查。
6.  **AI 交互:**
    - 语言要求：所有交流、解释、回答以及代码注释必须严格使用**中文**。
    - 代码质量：追求极致的代码洁癖和强迫症。必须使用最简洁、高效、优雅的代码实现需求，杜绝冗余。
    - 服务器管理：代码修改或任务完成后，**禁止**主动启动开发服务器（如 `npm run dev`），除非用户明确要求。
7.  **环境:** 注意 `.env` 文件中的配置，如密钥，开发时确保本地环境配置正确。

## 5. 特定文件指南

- **API 路由 (`server/api/`)**:
  - `defineEventHandler` 是标准入口。
  - 参数从 `event.context.params` 获取，查询参数用 `getQuery(event)`。
  - 使用 `server/utils/` 中的辅助函数来封装复杂的外部 API 调用。
- **页面组件 (`pages/`)**:
  - 页面标题和元数据使用 `useSeoMeta`。
  - 路由参数通过 `useRoute()` 获取。

## 6. 工具与库

- **Tailwind CSS v4:** 使用最新的 v4 语法和配置。
- **Remixicon:** 图标库，直接在类名中使用（如 `ri-home-line`）。
- **Markdown:** 使用 `marked` 库渲染 Markdown 内容。
- **代码高亮:** 使用 `highlight.js`。

请遵循以上指南以确保代码库的一致性和高质量。
