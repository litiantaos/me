# 项目开发指南

本文档为在此存储库中操作的 AI 代理提供关键上下文和规则。必须严格遵守以下指南。

## 1. 核心指令 & 环境

**环境:**

- **框架:** Nuxt 4 (Vue 3)
- **语言:** JavaScript (ES Modules)
- **样式:** Tailwind CSS v4 (@tailwindcss/vite)
- **后端:** Supabase (@nuxtjs/supabase)
- **包管理:** npm

**构建/运行指令:**

- **开发服务器:** `npm run dev` (除非用户明确要求预览，否则不要主动启动)
- **生产构建:** `npm run build`
- **类型/依赖检查:** `npm run check`
- **格式化:** `npx prettier --write <文件相对路径>`
- **测试:** 本项目未配置自动化测试框架

## 2. 代码风格规范

**格式:**

- **代码格式化:** 使用项目根目录的 `.prettierrc` 配置文件，其他保持 Prettier 默认。

**导入/导出:**

- **自动导入:** Nuxt 自动导入 `components/`, `composables/`, `utils/`, `server/utils/` 及 Vue 核心 API (`ref`, `computed` 等)。**不要**手动导入这些。
- **显式导入:** 第三方库 (如 `@vercel/analytics/nuxt`) 或类型定义需显式导入。
- **默认导出:** 组件和 API 处理程序使用 `export default`。

**命名:**

- **文件名:**
  - 组件: PascalCase (`MovieCard.vue`)
  - 页面/路由: kebab-case (`user-profile.vue`, `note/[id].vue`)
  - Composables: camelCase (`useAuth.js`)
  - API: kebab-case (`server/api/auth/login.js`)
- **变量/函数:** camelCase
- **常量:** UPPER_SNAKE_CASE
- **类:** PascalCase (仅 CSS 类名为 kebab-case)

**Vue/Nuxt 模式:**

- **组件:** `<script setup>` 语法。Props 定义用 `defineProps`，双向绑定优先使用 Vue 3.4+ 的 `defineModel()`。
- **路由导航:** 必须使用 `<NuxtLink to="...">`，避免使用原生 `<a>` 标签。
- **状态:** 使用 `useState` 进行跨组件共享。局部状态用 `ref`/`reactive`。
- **数据获取:**
  - 服务端/SSR: `$fetch` 或 `useAsyncData`
  - 客户端交互: `$fetch`
- **样式:** 优先使用 Tailwind Utility Classes。
  - 避免 `<style scoped>` 除非绝对必要。
  - 动态类: `:class="['base-class', condition && 'active-class']"`

**错误处理:**

- **Composables:** 使用 `try-catch-finally` 包装异步操作，管理 `loading` 和 `error` 状态。

## 3. 文件结构参考

- `pages/` - 页面路由 (如 `login.vue`, `note/index.vue`)
- `components/` - Vue 组件 (如 `note/Content.vue`)
- `composables/` - 组合式函数 (如 `useNotes.js`)
- `server/api/` - 后端 API 路由 (如 `server/api/tmdb/`)
- `server/utils/` - 服务端专用工具 (如 `server/utils/igdb.js`)
- `assets/css/` - 全局样式 (`main.css` 含 Tailwind 指令)
- `utils/` - 通用工具函数

## 4. 代理行为准则

1.  **中文沟通:** 所有输出、注释、Git 提交信息必须使用**中文**。
2.  **极简主义:** 代码力求简洁、高效。避免过度工程化。
3.  **依赖限制:** **严禁**擅自添加 npm 依赖。仅使用 `package.json` 中已有的库。**不要**假设存在现成库。
4.  **安全:** 不要在代码中硬编码敏感信息。使用 `useRuntimeConfig()`（客户端仅可读 public 字段，私钥必须仅在服务端调用）。
5.  **UI/UX:** 遵循现有的设计语言 (Tailwind, Remixicon)。保持视觉一致性。
6.  **修改前确认:** 在编辑已有文件之前，必须先读取或检索文件内容，**禁止**臆测代码结构或直接覆盖整个文件。

## 5. 特定库使用指南

- **Tailwind v4:** 直接在 CSS 中使用 `@theme`, `@utility` 等新特性 (参考 `assets/css/main.css`)。
- **Icons:** 使用 Remixicon 类名 (如 `<i class="ri-home-line" />`)。
- **Supabase:**
  ```javascript
  // 客户端
  const client = useSupabaseClient()
  const { data, error } = await client.from('notes').select('*')

  // 服务端 server/api/
  import { serverSupabaseClient } from '#supabase/server'
  export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const body = await readBody(event)

    const client = await serverSupabaseClient(event)
    const { data } = await client.from('notes').select('*')
  })
  ```
