import { NextRequest, NextResponse } from "next/server";

// ============================================================================
// 运行时配置
// ============================================================================
// 使用 Edge Runtime，代码运行在 Cloudflare 全球边缘节点
export const runtime = "edge";

// ============================================================================
// 常量定义
// ============================================================================
// KV 存储的键名，用于标识 todo 数据存储的位置
const KV_KEY = "todos";

// ============================================================================
// 类型定义
// ============================================================================
// Todo 项结构：text-内容，checked-是否完成
type TodoItem = { text: string; checked: boolean };

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 获取 KV 实例（跨方法复用）
 * 
 * 工作原理：
 * 1. 调用 @opennextjs/cloudflare 的 getCloudflareContext 获取云端上下文
 * 2. 从 env 中提取 MY_TODOLIST_KV 绑定
 * 
 * 环境差异：
 * - 本地开发：miniflare 模拟 KV，数据存在内存
 * - 生产环境：连接真实 Cloudflare KV
 */
async function getKv() {
  const { env } = await import("@opennextjs/cloudflare").then((m) =>
    m.getCloudflareContext({ async: true })
  );
  return env.MY_TODOLIST_KV as KVNamespace;
}

// ============================================================================
// API 接口
// ============================================================================

/**
 * GET /api/todos
 * 获取所有 todo 列表
 * 
 * 请求：无
 * 响应：TodoItem[]
 * 
 * 流程：
 * 1. 获取 KV 实例
 * 2. 读取 KV_KEY 存储的数据
 * 3. 解析 JSON 返回，如果无数据返回空数组
 */
export async function GET() {
  try {
    const kv = await getKv();                                    // 获取 KV 实例
    const data = await kv.get(KV_KEY);                           // 读取存储的数据
    return NextResponse.json(data ? JSON.parse(data) : []);      // 返回解析后的数据
  } catch {
    return NextResponse.json({ error: "Failed to get todos" }, { status: 500 });
  }
}

/**
 * POST /api/todos
 * 添加新 todo
 * 
 * 请求体：{ text: string }
 * 响应：TodoItem[] (更新后的完整列表)
 * 
 * 流程：
 * 1. 解析请求体获取 text
 * 2. 读取现有 todo 列表
 * 3. 添加新 todo（默认未完成 checked: false）
 * 4. 保存回 KV
 * 5. 返回更新后的完整列表
 */
export async function POST(req: NextRequest) {
  try {
    const kv = await getKv();                                    // 获取 KV 实例
    const { text } = await req.json() as { text: string };       // 解析请求体
    const data = await kv.get(KV_KEY);                           // 读取现有数据
    const todos: TodoItem[] = data ? JSON.parse(data) : [];      // 解析为数组
    todos.push({ text, checked: false });                         // 添加新 todo
    await kv.put(KV_KEY, JSON.stringify(todos));                  // 保存回 KV
    return NextResponse.json(todos);                              // 返回更新后的列表
  } catch {
    return NextResponse.json({ error: "Failed to add todo" }, { status: 500 });
  }
}

/**
 * PATCH /api/todos
 * 更新 todo 的勾选状态
 * 
 * 请求体：{ index: number, checked: boolean }
 * 响应：TodoItem[] (更新后的完整列表)
 * 
 * 流程：
 * 1. 解析请求体获取 index 和 checked
 * 2. 读取现有 todo 列表
 * 3. 更新指定索引项的 checked 状态
 * 4. 保存回 KV
 * 5. 返回更新后的完整列表
 */
export async function PATCH(req: NextRequest) {
  try {
    const kv = await getKv();                                    // 获取 KV 实例
    const { index, checked } = await req.json() as {             // 解析请求体
      index: number;
      checked: boolean;
    };
    const data = await kv.get(KV_KEY);                           // 读取现有数据
    const todos: TodoItem[] = data ? JSON.parse(data) : [];      // 解析为数组
    if (todos[index]) {                                          // 检查索引是否存在
      todos[index].checked = checked;                            // 更新勾选状态
      await kv.put(KV_KEY, JSON.stringify(todos));                // 保存回 KV
    }
    return NextResponse.json(todos);                              // 返回更新后的列表
  } catch {
    return NextResponse.json({ error: "Failed to update todo" }, { status: 500 });
  }
}

/**
 * DELETE /api/todos
 * 删除指定 todo
 * 
 * 请求体：{ index: number }
 * 响应：TodoItem[] (更新后的完整列表)
 * 
 * 流程：
 * 1. 解析请求体获取 index
 * 2. 读取现有 todo 列表
 * 3. 使用 splice 删除指定索引项
 * 4. 保存回 KV
 * 5. 返回更新后的完整列表
 */
export async function DELETE(req: NextRequest) {
  try {
    const kv = await getKv();                                    // 获取 KV 实例
    const { index } = await req.json() as { index: number };     // 解析请求体
    const data = await kv.get(KV_KEY);                           // 读取现有数据
    const todos: TodoItem[] = data ? JSON.parse(data) : [];      // 解析为数组
    todos.splice(index, 1);                                      // 删除指定索引的项
    await kv.put(KV_KEY, JSON.stringify(todos));                  // 保存回 KV
    return NextResponse.json(todos);                              // 返回更新后的列表
  } catch {
    return NextResponse.json({ error: "Failed to delete todo" }, { status: 500 });
  }
}