'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchTasksAction } from "@/features/tasks/actions";
import { Task } from "@/features/tasks/schemas";
import { useAppStore } from "@/store/useAppStore";
import { useOfflineDataStore } from "@/store/useOfflineDataStore";
import { toast } from '@/utils/toast';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, ClipboardList, Clock, ArrowRight, Loader2, CheckCircle2, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function TasksClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const language = useAppStore(state => state.language);
  const { tasks: offlineTasks, setTasks: setOfflineTasks } = useOfflineDataStore();

  // We are polling on mount or when returning to this page.
  useEffect(() => {
    async function loadTasks() {
      setIsLoading(true);
      if (!navigator.onLine) {
        setIsOfflineMode(true);
        setTasks(offlineTasks);
        setIsLoading(false);
        return;
      }
      
      const res = await fetchTasksAction();
      if (res.success && res.data) {
        setTasks(res.data);
        setOfflineTasks(res.data); // Update offline cache
        setIsOfflineMode(false);
      } else {
        // Fallback to offline cache
        setIsOfflineMode(true);
        setTasks(offlineTasks);
        toast.error(res.error || "خطأ في جلب المهام - تم عرض البيانات المخزنة محلياً");
      }
      setIsLoading(false);
    }
    loadTasks();
  }, [offlineTasks, setOfflineTasks]);

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
    <div className="container max-w-[90rem] mx-auto px-4 md:px-8 py-8 relative min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl shadow-sm border border-primary/10">
              <ClipboardList className="w-7 h-7" />
            </div>
            المهام
            {isOfflineMode && <WifiOff className="w-5 h-5 text-amber-500 animate-pulse ml-2" />}
          </h1>
          <p className="text-slate-500 text-sm md:text-base font-medium">
            إدارة المهام ومتابعة الإنجاز يومياً 
            {isOfflineMode && <span className="text-amber-500 font-bold mr-2 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 text-xs">(وضع عدم الاتصال)</span>}
          </p>
        </div>
        <Link href="/tasks/create">
          <Button size="lg" className="hidden md:flex gap-2 cursor-pointer bg-primary shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 text-white font-bold rounded-xl transition-all h-12 px-6">
            <Plus className="w-5 h-5 ml-2" />
            مهمة جديدة
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in duration-500">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl w-full" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-xl mb-12 shadow-sm p-8 lg:p-24">
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 bg-slate-50 border border-slate-100 shadow-sm rounded-full flex items-center justify-center text-primary">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-1">لا توجد مهام حالياً</h3>
              <p className="text-base text-slate-500 font-medium max-w-sm">قم بإضافة مهام جديدة لفريقك من خلال الضغط على زر إضافة مهمة أسفل الشاشة أو في الأعلى.</p>
            </div>
            <Link href="/tasks/create">
              <Button size="lg" className="bg-primary hover:bg-primary/95 text-white shadow-lg shadow-primary/20 font-bold rounded-xl h-12 px-6 mt-4 transition-all hover:scale-105 active:scale-95 text-[15px]">
                <Plus className="w-4 h-4 ml-2" />
                أضف مهمتك الأولى
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tasks.map(task => (
            <Card key={task.id} className="group hover:-translate-y-1 transition-all duration-300 border-slate-200/50 bg-white/70 backdrop-blur-sm overflow-hidden cursor-pointer shadow-lg shadow-slate-200/40 rounded-2xl relative">
              <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent pointer-events-none" />
              <div className="h-1.5 w-full bg-slate-100 relative z-10">
                <div 
                  className={`h-full transition-all duration-500 ease-in-out ${task.status === 'DONE' ? 'bg-emerald-500 w-full' : task.status === 'IN_PROGRESS' ? 'bg-blue-500 w-1/2' : 'bg-slate-300 w-1/12'}`} 
                />
              </div>
              <CardHeader className="pt-6 pb-2 px-6 relative z-10">
                <div className="flex justify-between items-start mb-3">
                  {getStatusBadge(task.status)}
                  <div className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-md flex items-center text-[11px] font-mono font-bold text-slate-500">
                    <Clock className="w-3 h-3 ml-1.5 text-slate-400" />
                    {new Date(task.updated_at || task.created_at).toLocaleDateString('ar-SA')}
                  </div>
                </div>
                <CardTitle className="text-xl font-bold tracking-tight text-slate-800 line-clamp-1">{task.title}</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-2 relative z-10">
                <p className="text-[15px] font-medium text-slate-500 line-clamp-2 min-h-[44px]">
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
          <Button size="icon" className="w-16 h-16 rounded-2xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30 border-2 border-white/20 text-white transition-all active:scale-95">
            <Plus className="w-7 h-7" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
