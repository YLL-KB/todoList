"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { toast } from "sonner";
import * as z from "zod";

/**
 * 1. 定义 Zod 表单验证规则
 * - username: 必填，3-20个字符
 * - email: 必填，有效邮箱格式
 * - password: 必填，至少8个字符
 * - bio: 可选，最多200个字符
 * - country: 必填
 * - terms: 必填（必须同意条款）
 */
const formSchema = z.object({
  username: z
    .string()
    .min(3, "用户名至少需要3个字符")
    .max(20, "用户名不能超过20个字符"),
  email: z.string().email("请输入有效的邮箱地址"),
  password: z
    .string()
    .min(8, "密码至少需要8个字符")
    .regex(/[A-Z]/, "密码必须包含至少一个大写字母")
    .regex(/[0-9]/, "密码必须包含至少一个数字"),
  bio: z.string().max(200, "简介不能超过200个字符").optional(),
  country: z.string().min(1, "请选择一个国家"),
  terms: z.boolean().refine((val) => val === true, {
    message: "您必须同意服务条款",
  }),
});

/** 从 schema 推断 TypeScript 类型 */
type FormData = z.infer<typeof formSchema>;

export default function Home() {
  /** 2. 初始化 react-hook-form */
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      bio: "",
      country: "",
      terms: undefined,
    },
    /** 表单验证模式: onBlur - 失去焦点时验证, onChange - 输入时验证, all - 两者都 */
    mode: "onBlur",
    /** 提交时是否验证 */
    shouldFocusError: true,
  });

  /** 获取表单状态 */
  const { isValid, isDirty, isSubmitting, errors } = form.formState;

  /** 3. 表单提交处理 */
  function onSubmit(data: FormData) {
    toast.success("Form submitted successfully!", {
      description: (
        <pre className="mt-2 w-[320px] overflow-x-auto rounded-md bg-slate-800 p-4 text-white">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
    console.log("Form submitted:", data);
  }

  /** 4. 测试演示函数 */
  const [demoData, setDemoData] = useState<string>("");

  const fillDemoData = () => {
    form.setValue("username", "johndoe");
    form.setValue("email", "john@example.com");
    form.setValue("password", "Password123");
    form.setValue("bio", "Software developer from San Francisco");
    form.setValue("country", "us");
    form.setValue("terms", true);
    setDemoData("演示数据已填充！请查看上方表单");
  };

  const clearForm = () => {
    form.reset();
    setDemoData("表单已清空！");
  };

  const showFieldValues = () => {
    setDemoData(JSON.stringify(form.getValues(), null, 2));
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      {/* ============================================================
        Field 组件 Demo - 展示所有 API 和用法
      ============================================================ */}
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Field 组件完整 Demo
          </h1>
          <p className="mt-2 text-slate-600">
            展示 shadcn/ui field.tsx 所有组件的用法
          </p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Registration Form</CardTitle>
            <CardDescription>
              Fill out the form below to create your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* ============================================================
                FieldSet & FieldLegend - 表单字段集
                用于将相关字段分组，类似于 HTML fieldset
              ============================================================ */}
              <FieldSet>
                <FieldLegend>Account Information</FieldLegend>

                {/* ------------------------------------------------
                  FieldGroup - 字段组容器
                  - 控制子字段的布局方向
                ------------------------------------------------ */}
                <FieldGroup>
                  {/* ============================================================
                    Field - 单个字段容器
                    - orientation: 布局方向
                      * vertical - 垂直排列（默认）
                      * horizontal - 水平排列
                      * responsive - 响应式（移动端垂直，桌面水平）
                  ============================================================ */}
                  <Field orientation="vertical">
                    {/* FieldLabel - 字段标签 */}
                    <FieldLabel>Username</FieldLabel>

                    {/* FieldContent - 字段内容区 */}
                    <FieldContent>
                      <Controller
                        name="username"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Input
                            {...field}
                            placeholder="Enter your username"
                            aria-invalid={!!fieldState.error}
                          />
                        )}
                      />
                    </FieldContent>

                    {/* FieldDescription - 字段描述 */}
                    <FieldDescription>
                      This will be displayed on your profile
                    </FieldDescription>

                    {/* FieldError - 字段错误提示 */}
                    <FieldError
                      errors={
                        errors.username
                          ? [{ message: errors.username.message }]
                          : []
                      }
                    />
                  </Field>

                  {/* ============================================================
                    Field - Email 字段（包含验证错误演示）
                  ============================================================ */}
                  <Field orientation="vertical">
                    <FieldLabel>Email</FieldLabel>
                    <FieldContent>
                      <Controller
                        name="email"
                        control={form.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="email"
                            placeholder="you@example.com"
                          />
                        )}
                      />
                    </FieldContent>
                    <FieldError
                      errors={
                        errors.email ? [{ message: errors.email.message }] : []
                      }
                    />
                  </Field>

                  {/* ============================================================
                    Field - Password 字段（展示密码验证）
                  ============================================================ */}
                  <Field orientation="vertical">
                    <FieldLabel>Password</FieldLabel>
                    <FieldContent>
                      <Controller
                        name="password"
                        control={form.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="password"
                            placeholder="Create a password"
                          />
                        )}
                      />
                    </FieldContent>
                    <FieldDescription>
                      Must be at least 8 characters with uppercase and number
                    </FieldDescription>
                    <FieldError
                      errors={
                        errors.password
                          ? [{ message: errors.password.message }]
                          : []
                      }
                    />
                  </Field>

                  {/* ============================================================
                    FieldSeparator - 字段分隔符
                    - 可以在字段之间添加视觉分隔
                    - children 属性可以添加中间文字
                  ============================================================ */}
                  <FieldSeparator>Or continue with</FieldSeparator>

                  {/* ============================================================
                    Field - Bio 字段（使用 Textarea）
                  ============================================================ */}
                  <Field orientation="vertical">
                    <FieldLabel>Bio</FieldLabel>
                    <FieldContent>
                      <Controller
                        name="bio"
                        control={form.control}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            placeholder="Tell us about yourself"
                            /** field.ref 提供 DOM 引用 */
                          />
                        )}
                      />
                    </FieldContent>
                    <FieldDescription>
                      Optional. {form.watch("bio")?.length || 0}/200 characters
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </FieldSet>

              {/* ============================================================
                第二个 FieldSet - 偏好设置
              ============================================================ */}
              <FieldSet>
                <FieldLegend>Preferences</FieldLegend>

                <FieldGroup>
                  {/* ============================================================
                    Field - Select 字段（演示水平布局）
                  ============================================================ */}
                  <Field orientation="vertical">
                    <FieldLabel>Country</FieldLabel>
                    <FieldContent>
                      <Controller
                        name="country"
                        control={form.control}
                        render={({ field }) => (
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Select a country</option>
                            <option value="us">United States</option>
                            <option value="uk">United Kingdom</option>
                            <option value="ca">Canada</option>
                            <option value="au">Australia</option>
                          </select>
                        )}
                      />
                    </FieldContent>
                    <FieldError
                      errors={
                        errors.country
                          ? [{ message: errors.country.message }]
                          : []
                      }
                    />
                  </Field>

                  {/* ============================================================
                    Field - Checkbox（通过自定义实现）
                  ============================================================ */}
                  <Field orientation="vertical">
                    <FieldContent>
                      <Controller
                        name="terms"
                        control={form.control}
                        render={({ field }) => (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field.value === true}
                              onChange={(e) => field.onChange(e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <span className="text-sm">
                              I accept the terms and conditions
                            </span>
                          </label>
                        )}
                      />
                    </FieldContent>
                    <FieldError
                      errors={
                        errors.terms ? [{ message: errors.terms.message }] : []
                      }
                    />
                  </Field>
                </FieldGroup>
              </FieldSet>

              {/* ============================================================
                提交按钮
              ============================================================ */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  /** isValid 表单是否通过验证 */
                  disabled={!isValid || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Submitting..." : "Create Account"}
                </Button>

                <Button type="button" variant="outline" onClick={clearForm}>
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* ============================================================
          演示区 - 测试各种功能
        ============================================================ */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Demo Controls</CardTitle>
            <CardDescription>Test different form methods</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <Button variant="secondary" onClick={fillDemoData}>
                Fill Demo Data
              </Button>

              <Button variant="secondary" onClick={showFieldValues}>
                Show Current Values
              </Button>

              <Button variant="secondary" onClick={clearForm}>
                Clear Form
              </Button>
            </div>

            {demoData && (
              <pre className="mt-4 rounded-lg bg-slate-100 p-4 text-sm overflow-x-auto">
                <code>{demoData}</code>
              </pre>
            )}

            {/* ============================================================
              表单状态显示
            ============================================================ */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>isValid:</strong> {isValid ? "true" : "false"}
              </div>
              <div>
                <strong>isDirty:</strong> {isDirty ? "true" : "false"}
              </div>
              <div>
                <strong>isSubmitting:</strong> {isSubmitting ? "true" : "false"}
              </div>
              <div>
                <strong>Errors Count:</strong> {Object.keys(errors).length}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ============================================================
          水平布局 Demo
        ============================================================ */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Horizontal Layout Demo</CardTitle>
            <CardDescription>
              Using orientation=&quot;horizontal&quot; for inline fields
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form className="space-y-4">
              {/* FieldGroup 可以接受 orientation 吗? 不能，但是 Field 可以 */}
              <Field orientation="horizontal">
                <FieldLabel>Full Name</FieldLabel>
                <Input placeholder="John Doe" />
              </Field>

              <Field orientation="horizontal">
                <FieldLabel>Phone</FieldLabel>
                <Input placeholder="+1 (555) 123-4567" />
              </Field>
            </form>
          </CardContent>
        </Card>

        {/* ============================================================
          FieldTitle 用法 Demo (没有实际显示，需要配合使用)
        ============================================================ */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>FieldTitle Demo</CardTitle>
            <CardDescription>
              FieldTitle vs FieldLabel - 两种不同的标题组件
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Field orientation="vertical">
              {/* FieldTitle - 独立的标题组件，不继承 Label 的样式 */}
              <FieldTitle>Using FieldTitle</FieldTitle>

              <FieldContent>
                <Input placeholder="Type something..." />
              </FieldContent>

              <FieldDescription>
                This uses FieldTitle instead of FieldLabel
              </FieldDescription>
            </Field>
          </CardContent>
          <form
            // onSubmit={form.handleSubmit(onSubmit)}

            className="space-y-6"
          >
            <FieldSet>
              <FieldLegend>Account Information</FieldLegend>
              <FieldGroup>
                <Field orientation="vertical">
                  {/* FieldLabel - 字段标签 */}
                  <FieldLabel>Username</FieldLabel>

                  {/* FieldContent - 字段内容区 */}
                  <FieldContent>
                    <Controller
                      name="username"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Input
                          {...field}
                          placeholder="Enter your username"
                          aria-invalid={!!fieldState.error}
                        />
                      )}
                    />
                  </FieldContent>

                  {/* FieldDescription - 字段描述 */}
                  <FieldDescription>
                    This will be displayed on your profile
                  </FieldDescription>

                  {/* FieldError - 字段错误提示 */}
                  <FieldError
                    errors={
                      errors.username
                        ? [{ message: errors.username.message }]
                        : []
                    }
                  />
                </Field>
              </FieldGroup>
            </FieldSet>
          </form>
        </Card>
      </div>
    </div>
  );
}
