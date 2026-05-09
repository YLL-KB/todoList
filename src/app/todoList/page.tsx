"use client";

import React, { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { getTodos, addTodo, updateTodo, deleteTodo } from "@/lib/todo-api";

const formSchema = z.object({
  text: z.string().min(1, "请输入内容"),
});
type FormData = z.infer<typeof formSchema>;

type TodoItem = { text: string; checked: boolean };

function TodoList() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { text: "" },
    mode: "all",
    shouldFocusError: true,
  });

  const [todoList, setTodoList] = useState<TodoItem[]>([]);

  useEffect(() => {
    getTodos().then(setTodoList);
  }, []);

  const onSubmit = async (data: FormData) => {
    const todos = await addTodo(data.text);
    setTodoList(todos);
    form.reset();
  };

  const handleUpdateTodo = async (index: number, checked: boolean) => {
    const todos = await updateTodo(index, checked);
    setTodoList(todos);
  };

  const handleDeleteTodo = async (index: number) => {
    const todos = await deleteTodo(index);
    setTodoList(todos);
  };

  const completedCount = todoList.filter((item) => item.checked).length;
  const pendingCount = todoList.length - completedCount;

  return (
    <div className="flex min-h-screen justify-center items-center bg-gradient-to-br from-sky-100 to-blue-100">
      <Card className="w-[600px] border-0 ring-0 shadow-xl">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">ToDoList</h1>
            <div className="flex justify-center gap-6 text-sm">
              <span className="text-slate-600">
                总数：<span className="font-semibold text-blue-600">{todoList.length}</span>
              </span>
              <span className="text-slate-600">
                已完成：<span className="font-semibold text-green-600">{completedCount}</span>
              </span>
              <span className="text-slate-600">
                未完成：<span className="font-semibold text-orange-500">{pendingCount}</span>
              </span>
            </div>
          </div>

          {/* Input Section */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="mb-6">
            <div className="flex grid grid-cols-3 gap-4 bg-white p-4 rounded-xl shadow-sm">
              <div className="col-span-2">
                <Controller
                  name="text"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      placeholder="输入待办事项..."
                      aria-invalid={!!fieldState.error}
                      className="h-11 rounded-lg border-slate-200 focus:border-blue-400"
                    />
                  )}
                />
              </div>
              <Button type="submit" className="h-11 rounded-lg bg-blue-500 hover:bg-blue-600">
                添加
              </Button>
            </div>
          </form>

          {/* Todo List */}
          {todoList.length > 0 ? (
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl max-h-[400px] overflow-y-auto">
              {todoList.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <Checkbox
                    id={item.text}
                    className="mr-3"
                    checked={item.checked}
                    onCheckedChange={(checked) => handleUpdateTodo(index, !!checked)}
                  />
                  <Label
                    htmlFor={item.text}
                    className={`flex-1 cursor-pointer ${item.checked ? "line-through text-slate-400" : "text-slate-700"}`}
                  >
                    {item.text}
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                    onClick={() => handleDeleteTodo(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <p className="text-lg">暂无待办事项</p>
              <p className="text-sm mt-1">在上方输入内容开始添加</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default TodoList;