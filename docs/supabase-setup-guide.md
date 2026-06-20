# Supabase 接入教程

本文用于把当前 NFC 毕业留念微站从本地 demo 存储切换到正式后端。

当前代码状态：

- 页面资料初始来自 `data/students.ts`。
- 编辑结果暂存在浏览器 `localStorage`。
- 照片添加目前只是占位图，不是真实上传。
- `supabase/schema.sql` 已经准备了 `students` 表结构，但接口层还未切到正式版本。

正式目标：

- 毕业生资料存入 Supabase Postgres。
- 照片文件存入 Supabase Storage。
- 数据库 `students.photos` 只保存照片 URL、路径、alt、排序等元数据。
- 编辑密码只在服务端校验，数据库只保存 hash，不把明文密码返回给浏览器。

## 1. 创建 Supabase 项目

1. 打开 Supabase Dashboard，创建新项目。
2. 进入项目后，记录 Project URL。
3. 进入 Project Settings -> API，准备以下值：
   - Project URL
   - anon/public key
   - service_role key 或 secret key

注意：

- `anon/public key` 可以用于浏览器侧公开读取，但仍要配合 RLS。
- `service_role key` 或 `secret key` 只能放在服务端环境变量里，不能写进前端代码、不能提交到仓库、不能贴到聊天窗口。

## 2. 配置环境变量

在项目根目录 `.env` 填入：

```env
NEXT_PUBLIC_SUPABASE_URL=https://你的项目ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon或publishable key
SUPABASE_SERVICE_ROLE_KEY=你的service_role或secret key
```

说明：

- `NEXT_PUBLIC_` 开头的变量会被 Next.js 暴露给浏览器，只能放公开 key。
- `SUPABASE_SERVICE_ROLE_KEY` 不带 `NEXT_PUBLIC_`，后续只在 Route Handler / Server Action 中读取。
- Vercel 部署时也要在 Project Settings -> Environment Variables 填同样的变量。

## 3. 初始化数据库表

打开 Supabase Dashboard -> SQL Editor，执行项目内的 SQL：

```sql
-- 复制并执行 supabase/schema.sql 的内容
```

当前表结构是：

```sql
public.students (
  id uuid primary key,
  public_id text unique,
  name text,
  major_class text,
  signature text,
  photos jsonb,
  extra_fields jsonb,
  password_hash text,
  password_set_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
```

RLS 已开启，并且当前策略允许公开读取：

```sql
create policy "public profiles are readable"
on public.students
for select
using (true);
```

这符合 NFC 打开即看的产品形态。写入、改密码、上传照片不应直接开放给浏览器，后续由 Next.js 服务端接口用服务端 key 处理。

## 4. 创建照片 bucket

进入 Supabase Dashboard -> Storage：

1. 新建 bucket：`student-photos`
2. 一期建议选择 public bucket，便于直接展示照片。
3. 后续如要更强隐私，可以改 private bucket，再由服务端生成 signed URL。

推荐路径规则：

```text
students/<public_id>/photo-<timestamp>.webp
```

数据库 `photos` 建议保存：

```json
[
  {
    "path": "students/gxu-2026-lin-yu/photo-1.webp",
    "url": "https://项目ref.supabase.co/storage/v1/object/public/student-photos/students/gxu-2026-lin-yu/photo-1.webp",
    "alt": "毕业照",
    "sort": 1
  }
]
```

## 5. 插入一条测试毕业生记录

在 SQL Editor 执行：

```sql
insert into public.students (
  public_id,
  name,
  major_class,
  signature,
  photos,
  extra_fields
) values (
  'gxu-2026-lin-yu',
  '林予安',
  '计算机科学与技术 2022 级 2 班',
  '把夏天、球场、图书馆夜灯和朋友的笑声，都装进这份小小的礼物里。',
  '[
    {
      "url": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=82",
      "alt": "毕业生与同学在校园合影",
      "sort": 1
    }
  ]'::jsonb,
  '{}'::jsonb
)
on conflict (public_id) do update set
  name = excluded.name,
  major_class = excluded.major_class,
  signature = excluded.signature,
  photos = excluded.photos,
  updated_at = now();
```

验证：

```sql
select public_id, name, major_class, photos
from public.students
where public_id = 'gxu-2026-lin-yu';
```

## 6. 填好环境变量后的切换工作

等 `.env` 填好后，再把代码切到正式版本。建议按这个顺序改：

1. 新增服务端 Supabase client
   - 使用 `SUPABASE_SERVICE_ROLE_KEY`
   - 只允许在服务端模块调用

2. 替换资料读取
   - `/?id=<public_id>` 从 Supabase `students` 表读取
   - 返回给前端时隐藏 `password_hash`
   - 把数据库字段 `major_class` 转成前端字段 `majorClass`

3. 新增接口
   - `GET /api/students/[publicId]`
   - `POST /api/students/[publicId]/password`
   - `PATCH /api/students/[publicId]`
   - `POST /api/students/[publicId]/photos`

4. 替换编辑保存
   - 移除 `saveLocalProfile` 和 `saveLocalPassword` 的正式路径
   - 首次设置密码时服务端 hash 后写入 `password_hash`
   - 已设置密码时服务端比对 hash 后更新资料

5. 替换照片上传
   - 前端选择真实文件
   - 服务端限制文件类型、大小和最多 10 张
   - 上传到 `student-photos`
   - 写回 `students.photos`

6. 更新 Next Image 配置
   - 允许加载 Supabase Storage 图片域名

## 7. 正式切换验收项

切换完成后至少验证：

- 无 `.env` 时项目有明确错误或回退提示。
- `/?id=gxu-2026-lin-yu` 能从 Supabase 读取资料。
- 不存在的 `public_id` 显示未找到页面。
- 首次设置密码后，数据库只出现 hash，不出现明文密码。
- 密码错误时不能保存资料。
- 密码正确时能更新姓名、专业班级、签名。
- 上传图片后 Supabase Storage 有文件，`students.photos` 有对应 URL/path。
- 最多只能保留 10 张照片。
- `SUPABASE_SERVICE_ROLE_KEY` 没有出现在浏览器 bundle、日志和提交内容中。

## 8. 官方参考

- Supabase Next.js quickstart: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- Supabase Storage standard uploads: https://supabase.com/docs/guides/storage/uploads/standard-uploads
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase API keys: https://supabase.com/docs/guides/getting-started/api-keys
- Supabase secure data guide: https://supabase.com/docs/guides/database/secure-data
