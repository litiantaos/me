# TaosLife

![TaosLife](public/images/card.png)

个人网站，记录想法与生活。支持 Markdown 笔记、语义搜索、爱好（电影/游戏）、足迹地图、人生时间线。简洁、轻快、优雅。

## 技术栈

- Nuxt
- TailwindCSS
- Supabase (Auth, Database, Storage, Vectors)
- Vercel (Deployment, Web Analytic, AI Gateway)

## 编辑器

- Zed
- VS Code (Vue, Tailwind CSS IntelliSense, Prettier, Iconify IntelliSense)

## 开始

```bash
npm install       # 安装依赖
npm run dev       # 开发服务器
npm run check     # 检查依赖更新
```

## 笔记 API

Token 鉴权的开放接口，可接入快捷指令等外部工具快速记笔记（自动生成语义向量）。

```bash
curl -X POST <SITE_URL>/api/note/add \
  -H "Authorization: Bearer <NUXT_NOTE_API_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"content": "想法", "user_id": "<Supabase 用户 UUID>"}'
```

## Supabase 配置

完整数据库结构定义见 `supabase/schema.sql`。

### 初始化数据库

1. 进入 [Supabase Dashboard](https://supabase.com/dashboard)，在 Database → Extensions 中启用 `pgroonga` 和 `vector` 扩展。
2. 在 SQL Editor 中粘贴 `schema.sql` 内容并运行，以创建所有必要的表、索引和函数。

### 核心表结构

- `notes`: 笔记表，支持向量搜索。
- `hobbies`: 爱好记录表。
- `places`: 足迹记录表。

### 核心函数

- `hybrid_search_notes`: 实现了基于 `pgroonga` (全文检索) 和 `pgvector` (语义搜索) 的混合检索算法 (RRF 融合)。

## 部署

1. 进入 [Vercel](https://vercel.com) 创建项目并导入 GitHub 仓库以部署。
2. 根据 `.env.example` 配置环境变量。
3. 推送 GitHub 触发自动部署。
