# todoList

一个基于 Next.js 16 + Cloudflare Workers KV 的待办事项应用。

## 功能特性

- 添加待办事项
- 勾选/取消完成状态
- 删除待办事项
- 数据持久化存储（Cloudflare KV）

## 技术栈

- **框架**：Next.js 16 (App Router)
- **运行时**：Cloudflare Workers (Edge Runtime)
- **存储**：Cloudflare Workers KV
- **UI**：shadcn/ui + Tailwind CSS
- **表单**：react-hook-form + zod

## 项目结构

```
my-todolist/
├── src/
│   ├── app/
│   │   ├── layout.tsx            # 根布局：全局 HTML 结构、字体加载、元数据
│   │   ├── page.tsx              # 首页：Field 组件表单示例 Demo（非 todo 功能）
│   │   ├── globals.css           # 全局样式：Tailwind CSS + shadcn/ui 主题变量
│   │   ├── todoList/
│   │   │   └── page.tsx          # 待办事项主页面：添加/勾选/删除 todo
│   │   └── api/todos/
│   │       └── route.ts          # Todo CRUD API：GET/POST/PATCH/DELETE，数据存 Cloudflare KV
│   ├── components/ui/            # shadcn/ui 组件库：Button、Input、Card、Checkbox 等
│   └── lib/
│       ├── todo-api.ts           # 前端 API 封装：对 /api/todos 的 fetch 调用
│       └── utils.ts              # 通用工具：cn() 合并 Tailwind 类名
├── package.json                  # 项目依赖和脚本（dev/build/deploy/lint）
├── tsconfig.json                 # TypeScript 编译配置，路径别名 @/ → src/
├── next.config.ts                # Next.js 配置，启用 Cloudflare 本地开发
├── wrangler.jsonc                # Cloudflare Workers 部署配置（KV 绑定、服务绑定）
├── open-next.config.ts           # OpenNext Cloudflare 适配配置
├── postcss.config.mjs            # PostCSS 配置，使用 @tailwindcss/postcss 插件
├── eslint.config.mjs             # ESLint 代码规范（继承 next/core-web-vitals）
├── components.json               # shadcn/ui 配置：组件目录、样式方案、图标库
└── cloudflare-env.d.ts           # Cloudflare 环境类型声明（wranger types 自动生成）
```

### 各文件作用说明

| 文件 | 作用 |
|------|------|
| `src/app/layout.tsx` | 根布局组件，定义全局 `<html>`、`<body>` 结构，加载 Geist 字体，设置 favicon 和页面元数据 |
| `src/app/page.tsx` | 首页（`/`），展示 shadcn/ui Field 系列组件的完整用法 Demo，包含表单验证、水平/垂直布局等示例，非 todo 功能 |
| `src/app/globals.css` | 全局样式文件，引入 Tailwind CSS、shadcn 主题、动画库，定义亮色/暗色主题 CSS 变量 |
| `src/app/todoList/page.tsx` | 待办事项页面（`/todoList`），客户端组件，实现添加、勾选完成/取消、删除待办事项，头部展示总数/已完成/未完成统计 |
| `src/app/api/todos/route.ts` | Todo RESTful API（`/api/todos`），Edge Runtime 运行于 Cloudflare Workers，数据持久化到 Cloudflare KV |
| `src/lib/todo-api.ts` | 前端 API 调用层，封装 `getTodos`/`addTodo`/`updateTodo`/`deleteTodo` 四个函数，通过 fetch 请求后端接口 |
| `src/lib/utils.ts` | 通用工具函数，导出 `cn()` 用于合并 Tailwind CSS 类名（基于 clsx + tailwind-merge） |
| `src/components/ui/` | shadcn/ui 组件目录，由 `npx shadcn add` 命令生成，如 Button、Input、Card、Checkbox、Label、Field 等 |
| `package.json` | 项目配置文件，包含脚本（dev/build/deploy）和依赖（Next.js 16、React 19、shadcn/ui、zod 等） |
| `tsconfig.json` | TypeScript 编译配置，启用 strict 模式，配置 `@/*` 路径别名指向 `src/*` |
| `next.config.ts` | Next.js 配置，调用 `initOpenNextCloudflareForDev()` 使本地 `next dev` 可访问 Cloudflare 绑定 |
| `wrangler.jsonc` | Cloudflare Wrangler 配置，定义 Worker 名称、KV 命名空间绑定（`MY_TODOLIST_KV`）、静态资源、兼容性标志 |
| `open-next.config.ts` | OpenNext Cloudflare 适配层配置，将 Next.js 应用打包为 Cloudflare Workers 可运行的格式 |
| `postcss.config.mjs` | PostCSS 配置，加载 `@tailwindcss/postcss` 插件处理 Tailwind CSS |
| `eslint.config.mjs` | ESLint 配置，继承 Next.js 的 `core-web-vitals` 和 `typescript` 规则集 |
| `components.json` | shadcn/ui 配置文件，定义组件安装目录、样式方案（Radix Nova）、图标库（Lucide）等 |
| `cloudflare-env.d.ts` | Cloudflare 环境 TypeScript 类型声明文件，由 `wrangler types` 自动生成，提供 Worker 运行时 API 类型 |

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/todos | 获取所有 todo |
| POST | /api/todos | 添加新 todo |
| PATCH | /api/todos | 更新勾选状态 |
| DELETE | /api/todos | 删除 todo |

## 开发

```bash
# 启动开发服务器
npm run dev

# 本地预览（Cloudflare 环境）
npm run preview

# 部署到 Cloudflare
npm run deploy
```

## 部署

1. 创建 Cloudflare KV Namespace
2. 配置 wrangler.jsonc 中的 kv_namespaces
3. 运行 `npm run deploy`

---

# OpenNext Starter

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Read the documentation at https://opennext.js.org/cloudflare.