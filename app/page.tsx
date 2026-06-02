import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos } = await supabase.from('todos').select()

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

        {todos && todos.length > 0 ? (
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
