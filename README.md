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
src/
├── app/
│   ├── todoList/
│   │   └── page.tsx      # 待办事项页面
│   └── api/todos/
│       └── route.ts       # KV 存储 API
└── lib/
    └── todo-api.ts        # API 调用封装
```

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