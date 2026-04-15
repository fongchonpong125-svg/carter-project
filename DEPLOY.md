# FoodGuardian AI Web 部署说明

## 当前推荐架构

- 前端与 API：`Next.js 16` on `Vercel`
- 数据库：托管 `PostgreSQL`
- ORM：`Prisma`
- 登录：邮箱密码 + 服务端 `HTTP only Cookie`
- 图片识别 / AI：`ZHIPU_API_KEY` 或备用 `DOUBAO_API_KEY`

## 本地开发

1. 复制 `.env.example` 为 `.env.local`
2. 把 `DATABASE_URL` 改成你自己的 PostgreSQL 连接串
3. 设置：
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `ZHIPU_API_KEY`
   - `ZHIPU_API_KEY_TEXT`
   - `DOUBAO_API_KEY`（可选）
4. 执行：
   - `npm install`
   - `npx prisma generate`
   - `npx prisma db push`
   - `npm run dev`

## Vercel 上线步骤

1. 在托管数据库服务里创建一个 PostgreSQL 数据库
2. 将仓库导入 Vercel
3. 在 Vercel 项目环境变量中设置：
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `ZHIPU_API_KEY`
   - `ZHIPU_API_KEY_TEXT`
   - `DOUBAO_API_KEY`（可选）
4. 首次构建会执行：
   - `npx prisma generate`
   - `npx prisma db push`
   - `next build`
5. 部署完成后验证：
   - 注册 / 登录
   - 新增摄入记录
   - 新增库存与采购清单
   - AI 对话
   - 图片识别

## 数据库建议

- 开发和线上都统一使用 `PostgreSQL`
- 如果使用 Vercel 生态，优先选择：
  - `Neon Postgres`
  - `Vercel Postgres`
