# AGENTS.md — AI 可读的项目技术文档

> 本文档描述 `my-todolist` 项目的完整技术细节，供 AI Agent / LLM 在编辑代码时参考。

---

## 1. 项目概要

- **名称**: my-todolist
- **类型**: 全栈待办事项应用（单用户，无认证）
- **运行时**: Cloudflare Workers Edge Runtime
- **框架**: Next.js 16 (App Router) + React 19
- **存储**: Cloudflare KV（单键存储整个 todo 数组）
- **部署方式**: OpenNext (`@opennextjs/cloudflare`) 打包为 Workers 格式
- **UI**: shadcn/ui (Radix Nova 风格) + Tailwind CSS 4

## 2. 常用命令

```bash
npm run dev         # 本地开发（next dev + miniflare 模拟 KV）
npm run build       # 生产构建（next build）
npm run lint        # ESLint（next/core-web-vitals + next/typescript）
npm run deploy      # 构建并部署到 Cloudflare Workers
npm run preview     # 构建并本地预览 Workers 环境
npm run cf-typegen  # 生成 Cloudflare 绑定类型声明
```

## 3. 目录结构

```
my-todolist/
├── AGENTS.md                        # 本文件
├── package.json                     # 依赖 & 脚本
├── tsconfig.json                    # TypeScript 配置（路径别名 @/* → src/*）
├── next.config.ts                   # Next.js 配置 + initOpenNextCloudflareForDev()
├── postcss.config.mjs               # PostCSS（仅 @tailwindcss/postcss 插件）
├── eslint.config.mjs                # ESLint flat config（next/core-web-vitals）
├── components.json                  # shadcn/ui 配置（radix-nova 风格）
├── wrangler.jsonc                   # Cloudflare Wrangler 配置
├── cloudflare-env.d.ts              # Wrangler 自动生成的 Cloudflare 环境类型
├── public/
│   └── favicon.svg                  # 网站图标
├── .env.local                       # 环境变量（已 gitignore，需自行创建）
└── src/
    ├── app/
    │   ├── globals.css              # Tailwind v4 入口 + shadcn 主题 CSS 变量
    │   ├── layout.tsx               # 根布局（Geist 字体、favicon、元数据）
    │   ├── page.tsx                 # 首页：Field 组件完整 Demo 页面
    │   ├── todoList/
    │   │   └── page.tsx             # 待办事项主页面
    │   └── api/todos/
    │       └── route.ts             # Todo CRUD API
    ├── components/ui/               # shadcn/ui 组件（17 个）
    │   ├── accordion.tsx
    │   ├── alert.tsx
    │   ├── aspect-ratio.tsx
    │   ├── avatar.tsx
    │   ├── badge.tsx
    │   ├── breadcrumb.tsx
    │   ├── button.tsx
    │   ├── card.tsx
    │   ├── checkbox.tsx
    │   ├── field.tsx
    │   ├── input.tsx
    │   ├── label.tsx
    │   ├── scroll-area.tsx
    │   ├── separator.tsx
    │   ├── sonner.tsx
    │   ├── tabs.tsx
    │   └── textarea.tsx
    └── lib/
        ├── todo-api.ts              # 前端 fetch 封装
        └── utils.ts                 # cn() 工具函数
```

## 4. 路由表

| 文件路径 | URL | 渲染模式 | 说明 |
|---------|-----|---------|------|
| `src/app/layout.tsx` | `/` (所有路径) | Server Component | 根布局，包裹所有页面 |
| `src/app/page.tsx` | `/` | Client Component | Field 组件 Demo 页 |
| `src/app/todoList/page.tsx` | `/todoList` | Client Component | 待办事项 CRUD 主页面 |
| `src/app/api/todos/route.ts` | `/api/todos` | Edge Runtime | RESTful API（所有方法） |

> 约定：目录层级决定 URL 路径。`route.ts` 导出的函数名决定 HTTP 方法（GET、POST、PATCH、DELETE）。

## 5. 架构与数据流

### 5.1 请求路径

```
浏览器 → /api/todos → route.ts → KVNamespace.get/put → JSON 响应
                ↑
         getCloudflareContext()
         → env.MY_TODOLIST_KV

浏览器 → /todoList → page.tsx → todo-api.ts (fetch) → /api/todos
```

### 5.2 数据模型

```typescript
type TodoItem = {
  text: string;     // 待办事项内容
  checked: boolean; // 是否已完成
};
```

整个 todo 列表以 `TodoItem[]` 数组形式存储，在 KV 中以 key `"todos"` 保存为 JSON 字符串。

### 5.3 KV 存储模式

- **Key**: 固定值 `"todos"`
- **Value**: `JSON.stringify(TodoItem[])`
- **写入方式**: 每个 CRUD 操作都读取整个数组 → 修改 → 写回整个数组
- **获取 KV 实例**: 通过 `getCloudflareContext({ async: true })` 动态导入，获取 `env.MY_TODOLIST_KV`

```
本地开发: miniflare 模拟 KV → 数据存内存
生产环境: 连接 Cloudflare 真实 KV namespace (id: f5e1c2f6e1d441a8a2276ed50e9e9a56)
```

### 5.4 获取 Cloudflare 上下文的模式

```typescript
// src/app/api/todos/route.ts 中的标准模式
async function getKv() {
  const { env } = await import("@opennextjs/cloudflare").then((m) =>
    m.getCloudflareContext({ async: true })
  );
  return env.MY_TODOLIST_KV as KVNamespace;
}
```

必需配置：
1. `next.config.ts` 中调用 `initOpenNextCloudflareForDev()` 使本地开发可访问绑定
2. `tsconfig.json` 中 `types` 包含 `"./cloudflare-env.d.ts"` 提供 `KVNamespace` 等类型

## 6. API 接口规范

**Base URL**: `/api/todos`

| HTTP 方法 | 请求体 | 响应体 | 状态码 | 说明 |
|-----------|--------|--------|--------|------|
| `GET` | 无 | `TodoItem[]` | 200 | 获取所有 todo |
| `GET` | 无 | `{ error: string }` | 500 | KV 读取失败 |
| `POST` | `{ text: string }` | `TodoItem[]` | 200 | 添加新 todo（checked 默认为 false），返回完整列表 |
| `POST` | `{ text: string }` | `{ error: string }` | 500 | 添加失败 |
| `PATCH` | `{ index: number, checked: boolean }` | `TodoItem[]` | 200 | 更新指定索引的勾选状态 |
| `PATCH` | `{ index: number, checked: boolean }` | `{ error: string }` | 500 | 更新失败 |
| `DELETE` | `{ index: number }` | `TodoItem[]` | 200 | 删除指定索引的 todo |
| `DELETE` | `{ index: number }` | `{ error: string }` | 500 | 删除失败 |

### 关键行为细节

- **GET**: 如果 KV 中无数据（返回 `null`），返回 `[]`
- **POST**: 新增项追加到数组末尾，`checked` 固定为 `false`
- **PATCH**: 仅当 `todos[index]` 存在时才执行更新和写回，索引不存在则直接返回原列表
- **DELETE**: 使用 `Array.splice(index, 1)` 删除
- **错误处理**: 所有接口使用 try/catch，失败返回 `{ error: string }` + 状态码 500。**不区分** 404 等状态，所有异常统一为 500
- **并发安全**: 无乐观锁/版本控制。对同一用户的并发写入可能产生覆盖

## 7. 前端架构

### 7.1 TodoList 页面 (`/todoList`)

- **渲染**: `"use client"` 客户端组件
- **状态管理**: React `useState`（`todoList: TodoItem[]`）
- **表单**: react-hook-form + zod 校验
- **数据获取**: `useEffect` 首次调用 `getTodos()` 加载数据
- **操作流程**: 调用 todo-api.ts 封装函数 → 用返回的 `TodoItem[]` 替换本地 state

#### 组件树

```
TodoList
├── Card (外层容器)
│   └── CardContent
│       ├── Header（标题 + 统计：总数/已完成/未完成）
│       ├── form（输入框 + 添加按钮，react-hook-form）
│       └── Todo List 区域
│           ├── 有数据时：map 渲染每项
│           │   └── Checkbox + Label + 删除按钮(X图标)
│           └── 无数据时：空状态提示
```

### 7.2 首页 (`/`)

- **渲染**: `"use client"` 客户端组件
- **内容**: shadcn/ui Field 组件的完整 Demo 页面，展示所有 Field 子组件的用法
- **表单**: 包含 username、email、password、bio、country、terms 等字段
- **功能**: 填充演示数据、清空表单、显示当前值、表单状态显示

### 7.3 todo-api.ts 封装层

`src/lib/todo-api.ts` 提供 4 个函数，全部返回 `Promise<TodoItem[]>`：

| 函数 | API 方法 | 参数 | 错误处理 |
|------|---------|------|---------|
| `getTodos()` | GET | 无 | catch 返回 `[]` |
| `addTodo(text)` | POST | `text: string` | 不处理错误 |
| `updateTodo(index, checked)` | PATCH | `index: number, checked: boolean` | 不处理错误 |
| `deleteTodo(index)` | DELETE | `index: number` | 不处理错误 |

注意：`getTodos` 在 fetch 失败或 `!res.ok` 时返回空数组，其余 3 个函数不自行捕获异常。

### 7.4 cn() 工具函数

```typescript
// src/lib/utils.ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

用于合并 Tailwind CSS 类名，自动解决冲突。所有 shadcn/ui 组件内部均使用此函数。

## 8. 样式系统

### 8.1 Tailwind CSS 4 (CSS-first 配置)

- 入口: `src/app/globals.css`
- 使用 `@import "tailwindcss"` 而非 PostCSS 插件
- 主题变量通过 CSS 自定义属性定义（`:root` / `.dark`）
- 组件主题映射通过 `@theme inline { ... }` 将 CSS 变量暴露给 Tailwind

### 8.2 shadcn/ui 配置

- 风格: `radix-nova`
- 图标库: `lucide-react`
- 基础色: `neutral`
- 支持 RSC: `true`
- 支持暗色模式: `.dark` class 切换

### 8.3 现有 UI 组件

已安装的 shadcn/ui 组件：accordion、alert、aspect-ratio、avatar、badge、breadcrumb、button、card、checkbox、field、input、label、scroll-area、separator、sonner、tabs、textarea

## 9. 配置文件详解

### 9.1 next.config.ts

```typescript
const nextConfig: NextConfig = {};          // Next.js 配置对象（当前为空）
export default nextConfig;
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();              // 使 npm run dev 时可访问 Cloudflare 绑定
```

### 9.2 wrangler.jsonc

- `name`: `"my-todolist"`
- `main`: `.open-next/worker.js`（OpenNext 构建产物）
- `compatibility_date`: `"2026-03-17"`
- `compatibility_flags`: `["nodejs_compat", "global_fetch_strictly_public"]`
- `kv_namespaces`: 绑定 `MY_TODOLIST_KV`（id: `f5e1c2f6e1d441a8a2276ed50e9e9a56`）
- `assets`: 绑定 `ASSETS`，目录 `.open-next/assets`
- `services`: 自引用绑定 `WORKER_SELF_REFERENCE` 用于缓存
- `observability.enabled`: `true`

### 9.3 tsconfig.json

- `target`: `es2024`
- `module`: `esnext`，`moduleResolution`: `bundler`
- `jsx`: `react-jsx`
- 路径别名: `@/*` → `./src/*`
- 类型引用: `./cloudflare-env.d.ts` + `node`

### 9.4 eslint.config.mjs

继承 `next/core-web-vitals` 和 `next/typescript` 规则集。使用 flat config 格式（ESLint 9）。

### 9.5 postcss.config.mjs

仅配置 `@tailwindcss/postcss` 插件。

### 9.6 components.json

shadcn/ui CLI 配置，定义组件生成路径（`@/components/ui`）、utils 路径（`@/lib/utils`）。

## 10. 安全与认证

- **当前状态**: 无用户认证系统
- **OAuth 准备**: `.env.local` 中定义了 `GITHUB_CLIENT_ID` 和 `GITHUB_CLIENT_SECRET` 环境变量，但代码中尚未集成 GitHub OAuth
- **API 安全**: API 路由无鉴权机制，所有接口直接暴露

## 11. 代码编写规范

1. **客户端组件**: 使用 `"use client"` 指令标记（如 `page.tsx`、`todoList/page.tsx`）
2. **Edge Runtime**: API 路由使用 `export const runtime = "edge"`
3. **KV 访问**: 通过 `getCloudflareContext().env.MY_TODOLIST_KV` 获取，不可直接导入
4. **React 表单**: 使用 `useForm` + `zodResolver` + `Controller` 模式
5. **UI 组件**: 从 `@/components/ui/*` 导入，使用 `cn()` 合并样式
6. **图标**: 从 `lucide-react` 导入（如 `X`、`Check` 等）
7. **路径别名**: 统一使用 `@/` 前缀引用 `src/` 下的文件
8. **文件命名**: `route.ts` / `page.tsx` / `layout.tsx` 为 Next.js 保留名，不可更改

## 12. 常见开发任务

### 12.1 添加新 API 路由

1. 在 `src/app/api/` 下创建对应目录结构
2. 创建 `route.ts`，添加 `export const runtime = "edge"`
3. 导出对应 HTTP 方法的函数（GET/POST/PATCH/DELETE）
4. 如需访问 KV，使用 `getCloudflareContext()` 模式

### 12.2 添加新 shadcn/ui 组件

```bash
npx shadcn@latest add <component-name>
```

生成的组件在 `src/components/ui/` 下，自动遵循项目配置。

### 12.3 添加新页面

在 `src/app/` 下创建目录，内部创建 `page.tsx`。客户端交互页面需要 `"use client"` 指令。

### 12.4 修改 KV 绑定名称

1. 修改 `wrangler.jsonc` 中的 `kv_namespaces[].binding`
2. 修改 `route.ts` 中的 `env.XXX_KV`
3. 运行 `npm run cf-typegen` 更新类型声明

### 12.5 环境变量管理

- 本地开发: 在 `.env.local` 中添加（已 gitignore）
- 客户端可访问: 使用 `NEXT_PUBLIC_` 前缀
- 服务端变量: 在 `wrangler.jsonc` 的 `vars` 字段或 Cloudflare Dashboard 中配置

## 13. 部署流程

```
npm run deploy
  → opennextjs-cloudflare build  (构建 Next.js → .open-next/ 目录)
  → opennextjs-cloudflare deploy (部署 .open-next/worker.js 到 Cloudflare)
```

部署产物位于 `.open-next/` 目录：
- `worker.js` — Workers 入口
- `assets/` — 静态资源
- 其他内部文件由 OpenNext 生成，勿手动修改

Wrangler 绑定配置：
- `MY_TODOLIST_KV`: KV 命名空间绑定
- `ASSETS`: 静态资源绑定
- `IMAGES`: 图片优化绑定
- `WORKER_SELF_REFERENCE`: 自引用服务绑定（用于 ISR 缓存）

## 14. 依赖关系图

```
react / react-dom
├── next (App Router)
├── react-hook-form + zod + @hookform/resolvers
│   └── @/components/ui/field, input, textarea, checkbox, button
├── shadcn/ui (Radix Nova)
│   └── @/components/ui/* (17 components)
├── lucide-react (icons)
├── @opennextjs/cloudflare
│   └── getCloudflareContext() → env.MY_TODOLIST_KV (Cloudflare KV)
├── tailwindcss v4 + tw-animate-css + shadcn/tailwind.css
├── clsx + tailwind-merge → cn() utility
└── devDependencies
    ├── wrangler (Cloudflare CLI)
    ├── typescript
    ├── eslint + eslint-config-next
    └── @tailwindcss/postcss
```

## 15. 已知限制

1. **单 KV key 存储**: 所有 todo 存于同一 key，无分页，不适合大量数据
2. **无并发控制**: 并发写入可能互相覆盖（race condition）
3. **索引不稳定**: 前端以数组索引标识 todo，删除中间项后索引变化可能导致操作目标错误
4. **无认证**: API 完全开放，无访问控制
5. **仅支持 Edge Runtime**: 不可使用 Node.js 特有 API（如 `fs`、`path`）
6. **KV 最终一致性**: Cloudflare KV 非强一致，读取可能短暂返回旧数据（通常在 60 秒内同步）
