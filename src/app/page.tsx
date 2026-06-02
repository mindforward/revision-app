import { supabase, QuizBank } from '@/lib/supabase'
import Link from 'next/link'

// Force dynamic rendering — data changes in Supabase
export const dynamic = 'force-dynamic'

export default async function Home() {
  const { data: banks } = await supabase.from('quiz_banks').select('*').order('name')

  return (
    <main className="min-h-dvh flex flex-col items-center px-6 py-12">
      <h1 className="text-4xl font-bold text-sky-700 mb-2">📚 溫習 App</h1>
      <p className="text-gray-500 mb-10 text-lg">選擇題庫開始溫習</p>

      {!banks || banks.length === 0 ? (
        <div className="text-center text-gray-400 bg-white rounded-2xl p-10 shadow-sm border border-gray-200 max-w-md">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-lg">未有題庫</p>
          <p className="text-sm mt-2">請先去 Supabase Dashboard → SQL Editor 執行 setup SQL，然後匯入題目。</p>
        </div>
      ) : (
        <div className="grid gap-4 w-full max-w-lg">
          {banks.map((bank: QuizBank) => (
            <Link
              key={bank.id}
              href={`/quiz/${bank.id}`}
              className="block bg-white border-2 border-sky-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-sky-400 transition-all"
            >
              <h2 className="text-xl font-semibold text-gray-800">{bank.name}</h2>
              {bank.description && (
                <p className="text-gray-500 text-sm mt-1">{bank.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
