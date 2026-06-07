'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { supabase, QuestionWithOptions, QuizBank } from '@/lib/supabase'
import MathText from '@/components/Math'

type UserAnswer = {
  questionId: string
  selectedOptionId: string | null
  isCorrect: boolean
}

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const [bank, setBank] = useState<QuizBank | null>(null)
  const [allQuestions, setAllQuestions] = useState<QuestionWithOptions[]>([])
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<UserAnswer[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [numInput, setNumInput] = useState(10)
  const [started, setStarted] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  useEffect(() => {
    const id = params.id as string
    supabase.from('quiz_banks').select('*').eq('id', id).single().then(({ data }) => {
      setBank(data)
    })
    supabase.from('questions').select('*, answer_options(*)').eq('quiz_bank_id', id).then(({ data }) => {
      if (data) setAllQuestions(data as QuestionWithOptions[])
    })
  }, [params.id])

  const shuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  const startQuiz = () => {
    const count = Math.min(numInput, allQuestions.length)
    const picked = shuffle(allQuestions).slice(0, count).map(q => ({
      ...q,
      answer_options: shuffle(q.answer_options),
    }))
    setQuestions(picked)
    setAnswers([])
    setCurrentIndex(0)
    setShowResult(false)
    setShowReview(false)
    setSelectedId(null)
    setRevealed(false)
    setShowHint(false)
    setStarted(true)
  }

  const handleAnswer = (optionId: string) => {
    if (revealed) return
    setSelectedId(optionId)
    setRevealed(true)

    const q = questions[currentIndex]
    const opt = q.answer_options.find(o => o.id === optionId)
    setAnswers(prev => [...prev, {
      questionId: q.id,
      selectedOptionId: optionId,
      isCorrect: opt?.is_correct ?? false,
    }])
  }

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1)
      setSelectedId(null)
      setRevealed(false)
      setShowHint(false)
    } else {
      setShowResult(true)
    }
  }

  const jumpToQuestion = (index: number) => {
    const ans = answers[index]
    setCurrentIndex(index)
    if (ans) {
      setSelectedId(ans.selectedOptionId)
      setRevealed(true)
    } else {
      setSelectedId(null)
      setRevealed(false)
    }
    setShowHint(false)
  }

  const correctCount = answers.filter(a => a.isCorrect).length

  // Speech synthesis for Putonghua
  const speakText = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'zh-CN'
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    }
  }, [])

  // Show start screen
  if (!started) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center px-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center space-y-6">
          <h1 className="text-2xl font-bold text-gray-800">{bank?.name || '載入中...'}</h1>
          <p className="text-gray-500">題庫共有 <strong>{allQuestions.length}</strong> 題</p>

          <div>
            <label className="block text-gray-600 mb-2 text-lg">選擇要做嘅題數</label>
            <input
              type="number"
              min={1}
              max={allQuestions.length}
              value={numInput}
              onChange={e => setNumInput(Number(e.target.value))}
              className="w-24 text-center text-xl border border-gray-300 rounded-xl py-3 mx-auto focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <p className="text-sm text-gray-400 mt-2">（最多 {allQuestions.length} 題）</p>
          </div>

          <button
            onClick={startQuiz}
            className="w-full bg-sky-600 text-white py-4 rounded-xl text-xl font-semibold hover:bg-sky-700 transition-colors shadow-sm"
          >
            開始溫習 🚀
          </button>

          <button onClick={() => router.push('/')} className="text-sm text-gray-400 hover:text-sky-600">
            ← 返回題庫列表
          </button>
        </div>
      </main>
    )
  }

  // Show result
  if (showResult) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center px-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center space-y-6">
          <p className="text-6xl">{correctCount === questions.length ? '🎉' : correctCount >= questions.length / 2 ? '👍' : '💪'}</p>
          <h1 className="text-3xl font-bold text-gray-800">完成！</h1>
          <p className="text-xl text-gray-600">
            {correctCount} / {questions.length} 題正確
            （{Math.round(correctCount / questions.length * 100)}%）
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setShowReview(true)}
              className="w-full bg-white border-2 border-sky-200 text-sky-700 py-3 rounded-xl font-semibold hover:bg-sky-50 transition-colors"
            >
              📖 檢視答案
            </button>
            <button
              onClick={startQuiz}
              className="w-full bg-sky-600 text-white py-3 rounded-xl font-semibold hover:bg-sky-700 transition-colors shadow-sm"
            >
              🔄 重新開始
            </button>
            <button onClick={() => router.push('/')} className="text-sm text-gray-400 hover:text-sky-600">
              ← 返回題庫列表
            </button>
          </div>
        </div>

        {showReview && (
          <div className="max-w-lg w-full mt-6 space-y-4 pb-12">
            {questions.map((q, i) => {
              const userAns = answers[i]
              return (
                <div key={q.id} className={`bg-white rounded-2xl p-5 border-2 shadow-sm ${
                  userAns?.isCorrect ? 'border-green-300' : 'border-red-300'
                }`}>
                  <p className="text-sm text-gray-400 mb-1">第 {i + 1} 題</p>
                  <p className="text-gray-800 text-lg mb-3"><MathText text={q.question_text} /></p>
                  <div className="space-y-2">
                    {q.answer_options.map(opt => {
                      const isUserChoice = opt.id === userAns?.selectedOptionId
                      return (
                        <div key={opt.id} className={`rounded-xl px-4 py-3 text-sm ${
                          opt.is_correct ? 'bg-green-100 border border-green-300' :
                          isUserChoice ? 'bg-red-100 border border-red-300' :
                          'bg-gray-50 border border-gray-200'
                        }`}>
                          <div className="flex items-start gap-2">
                            {opt.is_correct && <span className="text-green-600 shrink-0">✅</span>}
                            {isUserChoice && !opt.is_correct && <span className="text-red-600 shrink-0">❌</span>}
                            <div>
                              <p className={opt.is_correct ? 'font-medium text-green-800' : ''}><MathText text={opt.text} /></p>
                              {opt.rationale && (
                                <p className="text-xs text-gray-500 mt-1"><MathText text={opt.rationale} /></p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    )
  }

  // Current question
  const q = questions[currentIndex]
  if (!q) return null

  return (
    <main className="min-h-dvh flex flex-col items-center px-6 py-8">
      {/* Progress */}
      <div className="w-full max-w-lg mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>{bank?.name}</span>
          <span>{currentIndex + 1} / {questions.length}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-500 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Floating question number nav */}
      <div className="w-full max-w-lg mb-4 sticky top-2 z-10 overflow-x-auto">
        <div className="flex gap-1.5 justify-center min-w-max p-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm">
          {questions.map((_, i) => {
            const answered = answers[i] !== undefined
            const isCurrent = currentIndex === i
            return (
              <button
                key={i}
                onClick={() => jumpToQuestion(i)}
                className={`w-9 h-9 rounded-full text-sm font-semibold flex items-center justify-center transition-all ${
                  isCurrent
                    ? 'bg-sky-600 text-white shadow-md scale-110 ring-2 ring-sky-300'
                    : answered
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                {answered ? '✓' : i + 1}
              </button>
            )
          })}
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 max-w-lg w-full">
        {/* Question text + Hint + Speak buttons */}
        <div className="flex items-start justify-between gap-2 mb-6">
          <p className="text-gray-800 text-xl leading-relaxed"><MathText text={q.question_text} /></p>
          <div className="flex shrink-0 gap-1.5">
            <button
              onClick={() => speakText(q.question_text.replace(/\$.*?\$/g, '').trim())}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isSpeaking ? 'bg-sky-100 text-sky-700 border border-sky-300 animate-pulse' : 'bg-gray-100 text-gray-500 hover:bg-sky-50 hover:text-sky-700'
              }`}
              title="聆聽（普通話）"
            >
              🔊
            </button>
            {q.hint && (
              <button
                onClick={() => setShowHint(!showHint)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  showHint ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-700'
                }`}
                title="解說"
              >
                💡
              </button>
            )}
          </div>
        </div>

        {showHint && q.hint && (
          <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            💡 <MathText text={q.hint} />
          </div>
        )}

        {q.image_url && (
          <div className="mb-5 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={q.image_url} alt="題目圖片" className="max-w-full rounded-xl" style={{ maxHeight: 300 }} />
          </div>
        )}

        <div className="space-y-3">
          {q.answer_options.map((opt) => {
            const isSelected = selectedId === opt.id
            let style = 'border-gray-200 hover:border-sky-300 hover:bg-sky-50 cursor-pointer'

            if (revealed) {
              if (opt.is_correct) style = 'border-green-400 bg-green-50'
              else if (isSelected) style = 'border-red-400 bg-red-50'
              else style = 'border-gray-200 opacity-60'
            } else if (isSelected) {
              style = 'border-sky-400 bg-sky-50'
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleAnswer(opt.id)}
                disabled={revealed}
                className={`w-full text-left border-2 rounded-xl px-5 py-4 transition-all ${style}`}
              >
                <div className="flex items-start gap-3">
                  {revealed && opt.is_correct && <span className="text-green-600 shrink-0">✅</span>}
                  {revealed && isSelected && !opt.is_correct && <span className="text-red-600 shrink-0">❌</span>}
                  <div>
                    <p className="text-gray-800 text-lg"><MathText text={opt.text} /></p>
                    {revealed && isSelected && !opt.is_correct && opt.rationale && (
                      <p className="text-xs text-gray-500 mt-2"><MathText text={opt.rationale} /></p>
                    )}
                    {revealed && opt.is_correct && opt.rationale && (
                      <p className="text-xs text-gray-500 mt-2"><MathText text={opt.rationale} /></p>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* No need old Hint section — now shows before answer too */}
        {/* Next button */}
        {revealed && (
          <button
            onClick={nextQuestion}
            className="w-full mt-6 bg-sky-600 text-white py-4 rounded-xl text-lg font-semibold hover:bg-sky-700 transition-colors shadow-sm"
          >
            {currentIndex < questions.length - 1 ? '下一題 →' : '睇成績 🎯'}
          </button>
        )}
      </div>
    </main>
  )
}
