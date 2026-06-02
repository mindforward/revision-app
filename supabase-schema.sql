-- 在 Supabase Dashboard → SQL Editor 執行這段 SQL

-- 1. 題庫表
CREATE TABLE quiz_banks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- 2. 題目表
CREATE TABLE questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_bank_id uuid NOT NULL REFERENCES quiz_banks(id) ON DELETE CASCADE,
  question_number int NOT NULL,
  question_text text NOT NULL,
  hint text,
  created_at timestamptz DEFAULT now()
);

-- 3. 選項表
CREATE TABLE answer_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  text text NOT NULL,
  rationale text,
  is_correct boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0
);

-- 允許 anon key 讀取
ALTER TABLE quiz_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON quiz_banks FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON questions FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON answer_options FOR SELECT USING (true);

-- 允許 authenticated user 編輯（如果你 login 用 Supabase Auth）
CREATE POLICY "Allow authenticated all" ON quiz_banks FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated all" ON questions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated all" ON answer_options FOR ALL USING (auth.role() = 'authenticated');
