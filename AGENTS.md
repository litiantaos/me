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

- **缩进:** 2 空格
- **分号:** **禁用** (依赖 ASI)
- **引号:** 单引号 `'`
- **行宽:** Prettier 默认 (80字符软限制)
- **尾随逗号:** ES5 (对象/数组多行时)

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

- **组件:** `<script setup>` 语法。Props 定义用 `defineProps`。
- **状态:** 使用 `useState` 进行跨组件共享。局部状态用 `ref`/`reactive`。
- **数据获取:**
  - 服务端/SSR: `$fetch` 或 `useAsyncData`
  - 客户端交互: `$fetch`
  - Supabase: `useSupabaseClient()` (客户端读写), 服务端 API 处理敏感逻辑。
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

## 4. 代理行为准则 (Agent Behavior)

1.  **中文沟通:** 所有输出、注释、Git 提交信息必须使用**中文**。
2.  **极简主义:** 代码力求简洁、高效。避免过度工程化。
3.  **依赖限制:** **严禁**擅自添加 npm 依赖。仅使用 `package.json` 中已有的库。
4.  **安全:** 不要在代码中硬编码敏感信息。使用 `runtimeConfig`。
5.  **UI/UX:** 遵循现有的设计语言 (Tailwind, Remixicon)。保持视觉一致性。

## 5. 特定库使用指南

- **Tailwind v4:** 直接在 CSS 中使用 `@theme`, `@utility` 等新特性 (参考 `assets/css/main.css`)。
- **Icons:** 使用 Remixicon 类名 (如 `<i class="ri-home-line" />`)。
- **Supabase:**
  ```javascript
  const client = useSupabaseClient()
  const { data, error } = await client.from('posts').select('*')
  ```
