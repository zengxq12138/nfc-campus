# Vercel 部署和外部访问教程

本文用于把本项目部署到 Vercel，并获得公网可访问地址。

## 1. 前置条件

- GitHub 仓库已经存在：`zengxq12138/nfc-campus`
- Supabase 已创建项目。
- Supabase 已执行 `supabase/schema.sql`。
- Supabase Storage 已创建 public bucket：`student-photos`。
- 本地 `.env` 已有：

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

注意：不要把 `.env` 提交到 GitHub。本项目 `.gitignore` 已忽略 `.env`。

## 2. 推送代码到 GitHub

如果本地还没设置远程仓库：

```bash
git remote add origin https://github.com/zengxq12138/nfc-campus.git
```

推送当前分支：

```bash
git push -u origin main
```

如果本地默认分支不是 `main`，先查看：

```bash
git branch --show-current
```

然后用实际分支名替换 `main`。

## 3. 在 Vercel 导入 GitHub 仓库

1. 打开 Vercel Dashboard。
2. 点击 `Add New` -> `Project`。
3. 选择 GitHub 仓库 `zengxq12138/nfc-campus`。
4. Framework Preset 选择 `Next.js`。
5. Root Directory 保持仓库根目录。
6. Build Command 使用默认值：

```bash
npm run build
```

7. Install Command 使用默认值：

```bash
npm install
```

8. Output Directory 留空，Next.js 项目不需要手动配置。

## 4. 配置 Vercel 环境变量

在 Vercel 创建项目页面或项目创建后进入：

```text
Project Settings -> Environment Variables
```

添加以下变量，并勾选 Production、Preview、Development：

```env
NEXT_PUBLIC_SUPABASE_URL=你的 Supabase Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 Supabase anon/publishable key
SUPABASE_SERVICE_ROLE_KEY=你的 Supabase service_role/secret key
```

安全要求：

- `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 会进入前端 bundle，可以公开。
- `SUPABASE_SERVICE_ROLE_KEY` 是服务端密钥，不能带 `NEXT_PUBLIC_` 前缀。
- 不要把 `SUPABASE_SERVICE_ROLE_KEY` 写进代码、README、截图或提交记录。

如果已经部署过一次，改完环境变量后需要重新部署：

```text
Vercel Project -> Deployments -> 选择最新部署 -> Redeploy
```

## 5. 首次部署后检查

部署完成后，Vercel 会给一个默认域名，类似：

```text
https://nfc-campus-xxx.vercel.app
```

打开：

```text
https://你的-vercel域名/?id=gxu-2026-lin-yu
```

检查：

- 页面能打开。
- 能展示 Supabase 中的毕业生资料。
- 不存在的 `id` 会显示未找到。
- 编辑资料需要密码。
- 上传照片后，Supabase Storage 的 `student-photos` bucket 中能看到文件。
- `students.photos` 字段出现对应图片 URL/path。

## 6. 让外部用户访问

### 方式 A：直接使用 Vercel 默认域名

部署成功后，Vercel 默认域名已经可以公网访问。

可以把 NFC 标签写成：

```text
https://你的-vercel域名/?id=对应public_id
```

例如：

```text
https://nfc-campus-xxx.vercel.app/?id=gxu-2026-lin-yu
```

### 方式 B：绑定自己的域名

如果你有自己的域名，例如：

```text
nfc.example.com
```

在 Vercel 中配置：

1. 进入项目。
2. 打开 `Settings` -> `Domains`。
3. 点击 `Add Domain`。
4. 输入你的域名或子域名。
5. 按 Vercel 提示去域名服务商配置 DNS。

常见 DNS 配置：

- 根域名 `example.com`：通常配置 A 记录到 Vercel 提供的 IP。
- 子域名 `nfc.example.com`：通常配置 CNAME 到 Vercel 提供的目标。

以 Vercel 页面给出的 DNS 提示为准。DNS 生效后，Vercel 会自动签发 HTTPS 证书。

绑定后 NFC 标签可以写成：

```text
https://nfc.example.com/?id=对应public_id
```

## 7. Supabase 侧注意事项

### Storage bucket

本项目代码默认使用：

```text
student-photos
```

如果 bucket 名称不同，需要同步修改：

```text
lib/supabase-server.ts
```

### RLS

当前 `students` 表允许公开读取，写入由 Next.js 服务端接口使用服务端 key 完成。

这对应 NFC 打开即看的产品形态。如果未来资料不希望公开访问，需要调整：

- `students` 表 RLS policy
- 页面读取逻辑
- 照片 bucket public/private 策略

### 图片域名

`next.config.ts` 会根据 `NEXT_PUBLIC_SUPABASE_URL` 自动允许 Supabase Storage 图片域名。改完环境变量后必须重新构建部署。

## 8. 常见问题

### Vercel 页面显示找不到资料

先在 Supabase SQL Editor 执行：

```sql
select public_id, name, photos
from public.students
where public_id = 'gxu-2026-lin-yu';
```

如果没有结果，需要先插入毕业生记录。

### 上传照片失败

检查：

- bucket 是否叫 `student-photos`
- bucket 是否为 public
- Vercel 是否配置了 `SUPABASE_SERVICE_ROLE_KEY`
- 单张图片是否超过 5MB
- 图片类型是否为 JPG、PNG、WebP

### 改了环境变量但线上没变化

Vercel 环境变量只在构建和运行环境中生效。改完后建议手动 Redeploy。

## 9. 官方参考

- Vercel GitHub 部署：https://vercel.com/docs/git/vercel-for-github
- Vercel 环境变量：https://vercel.com/docs/environment-variables
- Vercel 自定义域名：https://vercel.com/docs/domains/working-with-domains/add-a-domain
- Vercel Next.js 支持：https://vercel.com/docs/frameworks/full-stack/nextjs
- Supabase Vercel 集成：https://supabase.com/docs/guides/integrations/vercel-marketplace
