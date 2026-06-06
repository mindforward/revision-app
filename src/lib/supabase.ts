import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type QuizBank = {
  id: string
  name: string
  description: string | null
  created_at: string
}

export type Question = {
  id: string
  quiz_bank_id: string
  question_number: number
  question_text: string
  hint: string | null
  image_url: string | null
  created_at: string
}

export type AnswerOption = {
  id: string
  question_id: string
  text: string
  rationale: string | null
  is_correct: boolean
  sort_order: number
}

export type QuestionWithOptions = Question & {
  answer_options: AnswerOption[]
}
