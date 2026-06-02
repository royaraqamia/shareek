import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 sm:p-24">
        <div className="w-full max-w-md bg-white border border-slate-200 shadow-md rounded-2xl p-6 space-y-6">
          <div className="space-y-2">
            <h1 className="text-xl font-semibold tracking-tight text-red-600">
              Supabase Setup Required
            </h1>
            <p className="text-sm text-slate-500">
              Your application is nearly ready! To connect your database on Vercel, head to your Vercel project settings and add these Environment Variables:
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 font-mono text-xs text-slate-700 space-y-2">
            <div>
              <span className="font-bold text-slate-900">NEXT_PUBLIC_SUPABASE_URL</span>
              <p className="text-slate-500 mt-0.5">Your Supabase project URL</p>
            </div>
            <hr className="border-slate-100" />
            <div>
              <span className="font-bold text-slate-900">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
              <p className="text-slate-500 mt-0.5">Your Supabase anonymous publishable key</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 text-center">
            Once configured, trigger a new deployment to view your tasks live.
          </p>
        </div>
      </main>
    )
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  let todos: any[] | null = null;
  let errorMessage = "";

  try {
    const { data, error } = await supabase.from('todos').select()
    if (error) {
      errorMessage = error.message;
    } else {
      todos = data;
    }
  } catch (err: any) {
    errorMessage = err?.message || String(err);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 sm:p-24">
      <div className="w-full max-w-md bg-white border border-slate-200 shadow-md rounded-2xl p-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Supabase Tasks
          </h1>
          <p className="text-sm text-slate-500">
            Synchronized live with database schemas.
          </p>
        </div>

        {errorMessage ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs text-center space-y-2">
            <p className="font-semibold text-amber-950">Could not fetch tasks:</p>
            <p className="font-mono break-words">{errorMessage}</p>
          </div>
        ) : todos && todos.length > 0 ? (
          <ul className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden" id="todo-list">
            {todos.map((todo) => (
              <li 
                key={todo.id} 
                className="px-4 py-3 bg-white text-slate-800 text-sm font-medium flex items-center justify-between"
                id={`todo-${todo.id}`}
              >
                <span>{todo.name}</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-2 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
            <p className="text-sm font-medium text-slate-500">No active tasks found</p>
            <p className="text-xs text-slate-400">Database is connected successfully.</p>
          </div>
        )}
      </div>
    </main>
  )
}
