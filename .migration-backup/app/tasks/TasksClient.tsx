'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchTasksAction, bulkDeleteTasksAction, bulkUpdateTasksStatusAction } from "@/features/tasks/actions";
import { Task } from "@/features/tasks/schemas";
import { useAppStore } from "@/store/useAppStore";
import { useOfflineDataStore } from "@/store/useOfflineDataStore";
import { toast } from '@/utils/toast';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DangerConfirmDialog } from "@/components/DangerConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { Plus, ClipboardList, Clock, ArrowRight, Loader2, CheckCircle2, WifiOff, Search, Trash2, SlidersHorizontal, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

export default function TasksClient() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'TODO' | 'IN_PROGRESS' | 'DONE'>('ALL');
  const language = useAppStore(state => state.language);
  const { tasks: offlineTasks, setTasks: setOfflineTasks } = useOfflineDataStore();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    setIsBulkDeleting(true);
    try {
      const res = await bulkDeleteTasksAction(selectedIds);
      if (res.success) {
        toast.success(language === 'ar' ? 'تم الحذف بنجاح!' : 'Deleted successfully!');
        const updated = tasks.filter(t => !selectedIds.includes(t.id));
        setTasks(updated);
        setOfflineTasks(updated);
        setSelectedIds([]);
        setIsDeleteConfirmOpen(false);
      } else {
        toast.error(res.error || 'فشلت عملية الحذف');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error deleting');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleBulkUpdateStatus = async (newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    if (selectedIds.length === 0) return;
    setIsBulkUpdating(true);
    try {
      const res = await bulkUpdateTasksStatusAction(selectedIds, newStatus);
      if (res.success) {
        toast.success(language === 'ar' ? 'تم التحديث بنجاح!' : 'Updated successfully!');
        const updated = tasks.map(t => selectedIds.includes(t.id) ? { ...t, status: newStatus } : t);
        setTasks(updated);
        setOfflineTasks(updated);
        setSelectedIds([]);
      } else {
        toast.error(res.error || 'فشلت عملية التحديث');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating');
    } finally {
      setIsBulkUpdating(false);
    }
  };


  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = 
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filterStatus === 'TODO') return matchesSearch && task.status === 'TODO';
    if (filterStatus === 'IN_PROGRESS') return matchesSearch && task.status === 'IN_PROGRESS';
    if (filterStatus === 'DONE') return matchesSearch && task.status === 'DONE';
    return matchesSearch;
  });

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
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

      {/* Elegant Search & Filter Controls Panel */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/60 shadow-sm relative z-10 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'بحث عن طريق عنوان المهمة أو الوصف...' : 'Search by task title or description...'}
            className="pr-10 pl-4 h-11 text-right bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl text-sm"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none justify-end">
          <Button
            variant={filterStatus === 'ALL' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('ALL')}
            className="rounded-xl h-10 px-4 font-bold text-xs"
          >
            {language === 'ar' ? 'الكل' : 'All'} ({tasks.length})
          </Button>
          <Button
            variant={filterStatus === 'TODO' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('TODO')}
            className="rounded-xl h-10 px-4 font-bold text-xs"
          >
            {language === 'ar' ? 'قيد الانتظار' : 'Pending'} ({tasks.filter(t => t.status === 'TODO').length})
          </Button>
          <Button
            variant={filterStatus === 'IN_PROGRESS' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('IN_PROGRESS')}
            className="rounded-xl h-10 px-4 font-bold text-xs"
          >
            {language === 'ar' ? 'قيد التنفيذ' : 'In Progress'} ({tasks.filter(t => t.status === 'IN_PROGRESS').length})
          </Button>
          <Button
            variant={filterStatus === 'DONE' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('DONE')}
            className="rounded-xl h-10 px-4 font-bold text-xs"
          >
            {language === 'ar' ? 'مكتمل' : 'Completed'} ({tasks.filter(t => t.status === 'DONE').length})
          </Button>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-100 animate-in fade-in slide-in-from-top-2 duration-200 mb-8">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">
              {language === 'ar' ? `تم تحديد ${selectedIds.length} عنصر:` : `Selected ${selectedIds.length} items:`}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 justify-end w-full sm:w-auto">
            {/* Update status to Pending */}
            <Button 
              size="sm" 
              variant="outline"
              disabled={isBulkUpdating}
              onClick={() => handleBulkUpdateStatus('TODO')}
              className="gap-1.5 h-9 rounded-lg border-amber-500/30 bg-white/50 text-amber-900 font-bold text-xs cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              {language === 'ar' ? 'تعيين كمعلق' : 'Set Pending'}
            </Button>

            {/* Update status to In Progress */}
            <Button 
              size="sm" 
              variant="outline"
              disabled={isBulkUpdating}
              onClick={() => handleBulkUpdateStatus('IN_PROGRESS')}
              className="gap-1.5 h-9 rounded-lg border-amber-500/30 bg-white/50 text-amber-900 font-bold text-xs cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {language === 'ar' ? 'تعيين قيد التنفيذ' : 'Set In Progress'}
            </Button>

            {/* Update status to Completed */}
            <Button 
              size="sm" 
              variant="outline"
              disabled={isBulkUpdating}
              onClick={() => handleBulkUpdateStatus('DONE')}
              className="gap-1.5 h-9 rounded-lg border-amber-500/30 bg-white/50 text-amber-900 font-bold text-xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              {language === 'ar' ? 'تعيين كمكتمل' : 'Set Completed'}
            </Button>

            {/* Delete button */}
            <Button 
              size="sm" 
              variant="destructive" 
              disabled={isBulkDeleting}
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="gap-1.5 h-9 rounded-lg font-bold text-xs hover:bg-rose-600/90 cursor-pointer"
            >
              {isBulkDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              {language === 'ar' ? 'حذف المحدد' : 'Delete Selected'}
            </Button>
          </div>
        </div>
      )}

      <DangerConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        count={selectedIds.length}
        isLoading={isBulkDeleting}
        language={language}
      />

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in duration-500">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl w-full" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState 
          icon={ClipboardList}
          title={language === 'ar' ? 'لا توجد مهام حالياً' : 'No tasks found'}
          description={language === 'ar' ? 'قم بإضافة مهام جديدة لفريقك لتنظيم العمل ومتابعة الإنجاز بسهولة وبطريقة احترافية.' : 'Add your first task to get started.'}
          buttonText={language === 'ar' ? 'أضف مهمتك الأولى' : 'Add First Task'}
          buttonIcon={Plus}
          onAction={() => router.push('/tasks/create')}
        />
      ) : filteredTasks.length === 0 ? (
        <EmptyState 
          icon={Search}
          title={language === 'ar' ? 'لا توجد مهام مطابقة لفلتر البحث' : 'No matching tasks'}
          description={language === 'ar' ? 'جرب البحث بكلمات أخرى أو إعادة ضبط فلاتر الحالة المعروضة.' : 'Try adjusting your filters or search query.'}
          buttonText={language === 'ar' ? 'إعادة ضبط عوامل التصفية' : 'Reset Filters'}
          onAction={() => { setSearchQuery(''); setFilterStatus('ALL'); }}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in duration-300">
          {filteredTasks.map(task => {
            const isSelected = selectedIds.includes(task.id);
            return (
              <Card 
                key={task.id} 
                className={`group hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer shadow-lg rounded-2xl relative ${
                  isSelected 
                    ? 'border-amber-500 bg-amber-500/5 shadow-amber-500/10' 
                    : 'border-slate-200/50 bg-white/70 backdrop-blur-sm shadow-slate-200/40'
                }`}
                onClick={() => {
                  if (isSelected) {
                    setSelectedIds(prev => prev.filter(id => id !== task.id));
                  } else {
                    setSelectedIds(prev => [...prev, task.id]);
                  }
                }}
              >
                <div className="absolute top-10 left-3 z-30">
                  <input 
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                      if (e.target.checked) {
                        setSelectedIds(prev => [...prev, task.id]);
                      } else {
                        setSelectedIds(prev => prev.filter(id => id !== task.id));
                      }
                    }}
                    className="w-4.5 h-4.5 rounded border-slate-300 text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent pointer-events-none" />
                <div className="h-1.5 w-full bg-slate-100 relative z-10">
                  <div 
                    className={`h-full transition-all duration-500 ease-in-out ${task.status === 'DONE' ? 'bg-emerald-500 w-full' : task.status === 'IN_PROGRESS' ? 'bg-blue-500 w-1/2' : 'bg-slate-300 w-1/12'}`} 
                  />
                </div>
                <CardHeader className="pt-6 pb-2 px-6 relative z-10 pr-10">
                  <div className="flex justify-between items-start mb-3">
                    {getStatusBadge(task.status)}
                    <div className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-md flex items-center text-[11px] font-mono font-bold text-slate-500">
                      <Clock className="w-3 h-3 ml-1.5 text-slate-400" />
                      {new Date(task.updated_at || task.created_at).toLocaleDateString('ar-SA')}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold tracking-tight text-slate-800 line-clamp-1">{task.title}</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-2 relative z-10 pr-10">
                  <p className="text-[15px] font-medium text-slate-500 line-clamp-2 min-h-[44px]">
                    {task.description || <span className="italic opacity-50">لا يوجد تفاصيل إضافية</span>}
                  </p>
                </CardContent>
              </Card>
            );
          })}
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
