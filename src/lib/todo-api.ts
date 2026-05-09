// Todo 项类型
export type TodoItem = { text: string; checked: boolean };

/**
 * 获取所有 todo
 */
export async function getTodos(): Promise<TodoItem[]> {
  try {
    const res = await fetch("/api/todos");
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

/**
 * 添加 todo
 * @param text - todo 内容
 */
export async function addTodo(text: string): Promise<TodoItem[]> {
  const res = await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return res.json();
}

/**
 * 更新 todo 勾选状态
 * @param index - todo 索引
 * @param checked - 是否勾选
 */
export async function updateTodo(index: number, checked: boolean): Promise<TodoItem[]> {
  const res = await fetch("/api/todos", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ index, checked }),
  });
  return res.json();
}

/**
 * 删除 todo
 * @param index - todo 索引
 */
export async function deleteTodo(index: number): Promise<TodoItem[]> {
  const res = await fetch("/api/todos", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ index }),
  });
  return res.json();
}