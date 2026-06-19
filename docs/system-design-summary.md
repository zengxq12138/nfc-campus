# 概要设计：广西大学 NFC 毕业留念微站

## 1. 设计目标

- 与一期 PRD 的对应关系：支撑 NFC 小礼物打开专属留念页、广西大学风貌展示、毕业生资料展示、首次设置密码、资料编辑和密码校验保存闭环。
- 本次设计覆盖范围：技术栈、部署方式、模块划分、核心数据模型、接口边界、安全策略、文件存储和主要技术风险。

## 2. 推荐技术栈

- 前端：Next.js App Router + React + TypeScript  
  选择原因：Next.js 是全栈 React 框架，适合把页面、服务端数据读取、提交接口放在同一项目里，减少前后端分离成本。App Router 支持 Server Components，风貌内容和个人资料可优先服务端渲染，降低首屏 JavaScript 负担。

- 样式与动效：Tailwind CSS + Motion  
  选择原因：Tailwind 适合快速迭代高完成度页面；Motion 用于图片进入、照片轮播、编辑面板切换等轻量动效。动效只用于叙事层次和操作反馈，不做重型滚动特效。

- 后端：Next.js Route Handlers / Server Actions  
  选择原因：项目业务很轻，独立后端会增加维护面。个人资料读取、密码设置、资料保存、照片上传授权都放在 Next 服务端完成。

- 数据库：Supabase Postgres  
  选择原因：Supabase 提供托管 PostgreSQL、Dashboard、SQL Editor、RLS 和自动 API，适合轻量项目快速上线，也保留后续扩展空间。

- 文件存储：Supabase Storage  
  选择原因：毕业生照片最多 5 张，体量小但需要公网展示和后续替换。照片路径写入数据库，文件本体放在 Storage bucket。

- 部署方式：Vercel + Supabase  
  选择原因：Vercel 对 Next.js 部署是零配置，能提供预览 URL、SSR、ISR 和自动扩缩。Supabase 可单独创建，也可通过 Vercel Marketplace 绑定。

## 3. 总体架构

- 架构说明：
  - 浏览器访问 `/?id=<public_id>`。
  - Next.js 服务端读取 `public_id`，查询 Supabase 中的毕业生公开资料。
  - 页面服务端渲染主体内容，客户端只负责轮播、编辑面板、表单状态和动效。
  - 编辑相关请求通过 Next.js 服务端接口处理，服务端校验密码后再写数据库和 Storage。
  - 客户端不直接写 `students` 表，避免暴露敏感字段和绕过密码校验。

- 关键链路：
  - 访问链路：NFC 标签 -> URL with `id` -> Next 页面 -> Supabase 查询 -> 渲染风貌和个人资料。
  - 首次设置密码链路：进入编辑 -> 查询是否已设置密码 -> 提交新密码 -> 服务端 hash -> 写入 `password_hash`。
  - 编辑保存链路：编辑资料 -> 输入密码确认 -> 服务端比对 hash -> 校验照片数量和字段 -> 更新数据库。
  - 照片链路：选择照片 -> 服务端校验密码和数量 -> 上传到 Supabase Storage -> 写入照片 URL/路径数组。

## 4. 核心模块划分

### 4.1 留念主页模块

- 职责：读取 URL 参数，展示广西大学风貌和对应毕业生资料。
- 输入：`searchParams.id`。
- 输出：完整留念页、缺少 `id` 状态、未找到资料状态。

### 4.2 广西大学风貌模块

- 职责：展示学校概况和 4 到 6 个校园地点图文内容。
- 输入：静态内容配置文件，例如 `data/campus.ts`。
- 输出：学校概况区、地点图文区、图片来源信息。

### 4.3 毕业生资料展示模块

- 职责：展示姓名、专业班级、照片轮播、个性签名。
- 输入：`StudentPublicProfile`。
- 输出：个人资料区域、照片轮播、空资料提示。

### 4.4 资料编辑模块

- 职责：处理首次密码设置、资料编辑、密码确认保存。
- 输入：表单字段、照片文件、密码。
- 输出：保存成功、密码错误、字段错误、照片限制错误等状态。

### 4.5 服务端数据模块

- 职责：封装 Supabase 访问、密码 hash、密码校验、字段校验、照片路径生成。
- 输入：服务端请求数据。
- 输出：安全的公开资料、写入结果、错误类型。

### 4.6 部署配置模块

- 职责：管理环境变量、Supabase client、Vercel 部署配置、图片域名配置。
- 输入：Vercel 环境变量、Supabase 项目信息。
- 输出：可部署的 Next.js 应用。

## 5. 核心实体 / 数据模型

### 5.1 `students`

一张主表承载毕业生个人信息，字段变化通过 `extra_fields` 预留扩展。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `uuid` | 内部主键，默认生成 |
| `public_id` | `text unique` | NFC URL 使用的随机访问 ID，不使用连续编号 |
| `name` | `text` | 姓名 |
| `major_class` | `text` | 专业班级 |
| `signature` | `text` | 个性签名 |
| `photos` | `jsonb` | 最多 5 张照片，存储路径、宽高、排序等 |
| `extra_fields` | `jsonb` | 后续字段扩展，例如毕业去向、标签 |
| `password_hash` | `text null` | 编辑密码 hash，永不返回给客户端 |
| `password_set_at` | `timestamptz null` | 密码设置时间 |
| `created_at` | `timestamptz` | 创建时间 |
| `updated_at` | `timestamptz` | 更新时间 |

建议的 `photos` 结构：

```json
[
  {
    "path": "students/<public_id>/photo-1.webp",
    "url": "https://...",
    "alt": "毕业照",
    "sort": 1
  }
]
```

### 5.2 `campus_spots`

一期推荐不建表，使用静态配置文件管理，降低后台和权限复杂度。

字段建议：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `slug` | `string` | 地点标识 |
| `name` | `string` | 地点名称 |
| `description` | `string` | 简短介绍 |
| `imageUrl` | `string` | 图片地址或本地资源 |
| `sourceUrl` | `string` | 图片来源 |

后续如果需要在线管理，再迁移为 Supabase 表。

## 6. 关键接口 / 交互边界

- `GET /?id=<public_id>`  
  用途：渲染留念主页。  
  请求方：NFC 打开的浏览器。  
  响应结果：包含校园风貌和毕业生公开资料的页面。

- `GET /api/students/:publicId`  
  用途：客户端局部刷新个人资料时使用。  
  请求方：前端组件。  
  响应结果：不含 `password_hash` 的公开资料。

- `POST /api/students/:publicId/password`  
  用途：首次设置编辑密码。  
  请求方：编辑表单。  
  响应结果：设置成功或失败原因。  
  约束：如果已设置密码，不允许用该接口覆盖。

- `PATCH /api/students/:publicId`  
  用途：保存个人资料。  
  请求方：编辑表单。  
  响应结果：更新后的公开资料。  
  约束：请求体必须带密码；服务端校验密码后写入。

- `POST /api/students/:publicId/photos`  
  用途：上传或替换照片。  
  请求方：照片上传组件。  
  响应结果：照片路径或错误信息。  
  约束：最多 5 张；限制文件类型和大小；服务端校验密码。

## 7. 关键技术难点与实现建议

- 难点 1：`?id=xx` 公开访问和隐私的平衡  
  建议方案：`public_id` 使用不可猜测随机串，例如 UUID 或 nanoid，不使用 `1,2,3` 连续编号。个人资料页设置 `noindex`，避免搜索引擎收录。  
  备选方案：查看也要求密码。  
  风险：查看加密码会削弱 NFC 打开即看的体验。

- 难点 2：无账号体系下的编辑安全  
  建议方案：不使用 Supabase Auth，采用每个 `public_id` 一组编辑密码。密码只在服务端校验，数据库只存 hash。  
  备选方案：接入 Supabase Auth。  
  风险：Auth 会增加注册登录流程，不适合一期礼物场景。

- 难点 3：照片上传和展示  
  建议方案：Supabase Storage 存放照片，服务端统一限制文件大小、类型、数量和路径。展示端使用 Next Image 或普通 `img` 加固定宽高，避免布局跳动。  
  备选方案：Vercel Blob。  
  风险：如果使用 Supabase public bucket，图片 URL 可被知道链接的人访问；如果使用 private bucket，需要签名 URL 和过期策略，复杂度更高。

- 难点 4：字段频繁变化  
  建议方案：常用字段保持独立列，低频字段放 `extra_fields jsonb`。一期不做字段配置后台。  
  备选方案：做字段定义表和动态表单。  
  风险：动态表单会明显拉高复杂度，不适合一期。

- 难点 5：前端设计品质  
  建议方案：先做前端设计方案，确定影像比例、颜色、布局、动效和表单状态，再编码。实现后用桌面和移动端截图检查。  
  备选方案：直接编码再调整。  
  风险：直接编码容易做成普通资料表单页，无法体现留念礼物的仪式感。

## 8. 延后项与技术债说明

- 一期暂不处理：
  - 管理后台。
  - 批量 NFC 写入工具。
  - 用户注册登录。
  - 多班级、多学校、多租户。
  - 评论、留言、点赞。
  - 字段配置后台。
  - 完整访问统计。

- 后续扩展建议：
  - 增加一个维护者后台，用于创建毕业生记录和生成 NFC 链接。
  - 为照片增加压缩和裁剪流程。
  - 将校园风貌内容从静态配置迁移到数据库。
  - 增加批量导入 CSV，便于一次性生成 `public_id`。

## 9. 假设与待确认项

- 假设：
  - 单个项目服务一个班级或小规模毕业生群体。
  - 毕业生资料查看公开，编辑需要密码。
  - `public_id` 由维护者预先生成并写入 NFC 标签。
  - 照片最多 5 张，单张建议限制在 5MB 以内。
  - 项目部署在 Vercel，数据库和 Storage 使用 Supabase。

- 待确认：
  - 是否使用 Supabase Marketplace 与 Vercel 绑定，还是单独创建 Supabase 项目后手动配置环境变量。
  - 照片 bucket 采用 public 还是 private。
  - 是否在编码阶段加入 `robots.txt` 和页面级 `noindex`。
  - 是否需要维护者初始化脚本批量生成毕业生记录。

## 10. 官方资料依据

- Next.js 官方文档说明其是用于构建全栈 Web 应用的 React 框架，并支持 App Router、Server Components、Route Handlers、Image、Font 等能力：https://nextjs.org/docs
- Supabase Next.js 快速开始建议使用 `with-supabase` 模板，并强调 RLS、最小权限和环境变量配置：https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- Vercel 官方文档说明 Next.js 部署到 Vercel 是零配置，并支持 SSR、ISR、预览 URL 等能力：https://vercel.com/docs/frameworks/full-stack/nextjs
- Supabase Vercel Marketplace 文档说明 Vercel 与 Supabase 的组织、权限和限制关系：https://supabase.com/docs/guides/integrations/vercel-marketplace

