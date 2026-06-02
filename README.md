# 📚 溫習 App - Quiz Study

互動溫習平台，支援多個題庫，題目儲存在 Supabase。

## 功能

- ✅ 選擇題庫開始溫習
- ✅ 自選要做嘅題數
- ✅ 題目及選項隨機排序
- ✅ 作答後即時顯示正確答案及解釋
- ✅ 完成後檢視全部答案
- ✅ 重新開始
- ✅ 可在 Supabase Visual Editor 直接編輯題目

## 技術

- **Next.js** (App Router)
- **Tailwind CSS**
- **Supabase** (PostgreSQL + REST API)

## 設定

### 1. 建立資料表

去 Supabase Dashboard → **SQL Editor** → 貼上執行 `supabase-schema.sql`

### 2. 匯入題目

```bash
# 先用 anon key import（如果冇 set service_role key）
# 或去 Supabase Dashboard - Table Editor 直接匯入
python3 scripts/import-quiz.py 題庫.json "P5 通識科學題庫 01"
```

> 需要設定環境變數 `SUPABASE_SERVICE_KEY`

### 3. 環境變數

`NEXT_PUBLIC_SUPABASE_URL` 同 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 已在 `.env.local` 設定。

### 4. 部署到 Vercel

Push 上 GitHub 後，喺 Vercel 設定環境變數：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 在 Supabase 編輯題目

Supabase Dashboard → **Table Editor** → 選擇 `questions` 或 `answer_options` 表 → 直接按 cell 修改內容。

## 本地開發

```bash
npm install
npm run dev
```
