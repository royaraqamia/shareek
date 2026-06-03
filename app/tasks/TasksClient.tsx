'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchTasksAction } from "@/features/tasks/actions";
import { Task } from "@/features/tasks/schemas";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, ClipboardList, Clock, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TasksClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const language = useAppStore(state => state.language);

  // We are polling on mount or when returning to this page.
  useEffect(() => {
    async function loadTasks() {
      setIsLoading(true);
      const res = await fetchTasksAction();
      if (res.success && res.data) {
        setTasks(res.data);
      } else {
        toast.error(res.error || "خطأ في جلب المهام");
      }
      setIsLoading(false);
    }
    loadTasks();
  }, []);

  const getStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'TODO':
        return <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">قيد الانتظار</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">قيد التنفيذ</Badge>;
      case 'DONE':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">مكتمل</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 relative min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-blue-100/50 text-blue-600 rounded-xl">
              <ClipboardList className="w-6 h-6" />
            </div>
            المهام
          </h1>
          <p className="text-slate-500 text-sm font-medium">إدارة المهام ومتابعة الإنجاز يومياً</p>
        </div>
        <Link href="/tasks/create">
          <Button className="hidden md:flex bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-6 shadow-sm rounded-xl">
            <Plus className="w-4 h-4 ml-2" />
            مهمة جديدة
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 shadow-none">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">لا توجد مهام حالياً</h3>
            <p className="text-slate-500 text-sm max-w-sm mb-6">قم بإضافة مهام جديدة لفريقك من خلال الضغط على زر إضافة مهمة أسفل الشاشة أو في الأعلى.</p>
            <Link href="/tasks/create">
              <Button variant="outline" className="text-blue-600 font-bold">
                أضف مهمتك الأولى
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map(task => (
            <Card key={task.id} className="group hover:shadow-md transition-shadow border-slate-200/60 overflow-hidden cursor-pointer">
              <div className="h-1.5 w-full bg-blue-500/10">
                <div 
                  className={`h-full ${task.status === 'DONE' ? 'bg-emerald-500 w-full' : task.status === 'IN_PROGRESS' ? 'bg-blue-500 w-1/2' : 'bg-slate-300 w-1/12'}`} 
                />
              </div>
              <CardHeader className="pt-4 pb-2 px-5">
                <div className="flex justify-between items-start mb-2">
                  {getStatusBadge(task.status)}
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 flex items-center rounded-sm">
                    <Clock className="w-3 h-3 ml-1" />
                    {new Date(task.updated_at || task.created_at).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                <CardTitle className="text-lg font-bold text-slate-800 line-clamp-1">{task.title}</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px]">
                  {task.description || <span className="italic opacity-50">لا يوجد تفاصيل إضافية</span>}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Mobile FAB */}
      <div className="md:hidden fixed bottom-24 left-6 z-50">
        <Link href="/tasks/create">
          <Button size="icon" className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-xl border-2 border-white text-white">
            <Plus className="w-6 h-6" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
