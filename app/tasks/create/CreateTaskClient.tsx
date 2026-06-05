'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createTaskAction } from "@/features/tasks/actions";
import { TaskStatus } from "@/features/tasks/schemas";
import { toast } from '@/utils/toast';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Save, Loader2, WifiOff } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOfflineDataStore } from "@/store/useOfflineDataStore";

export default function CreateTaskClient() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const { enqueueMutation, tasks: offlineTasks, setTasks: setOfflineTasks } = useOfflineDataStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO' as TaskStatus,
  });

  useEffect(() => {
    setIsOfflineMode(typeof navigator !== 'undefined' && !navigator.onLine);
    try {
      const saved = localStorage.getItem('draft-task');
      if (saved) {
        setFormData(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    localStorage.setItem('draft-task', JSON.stringify(formData));
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('يرجى إدخال عنوان المهمة');
      return;
    }

    setIsSubmitting(true);
    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        // Offline Flow
        enqueueMutation({
          type: 'CREATE_TASK',
          data: formData
        });
        
        // Optimistic update
        setOfflineTasks([{
          id: crypto.randomUUID(), // Temp ID
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          title: formData.title,
          description: formData.description,
          status: formData.status,
          organization_id: 'offline', // dummy
          created_by: 'offline' // dummy
        }, ...offlineTasks]);

        toast.success("تم حفظ المهمة محلياً (وضع عدم الاتصال)");
        localStorage.removeItem('draft-task');
        router.push('/tasks');
        return;
      }

      // Online Flow
      const res = await createTaskAction(formData);
      if (res.success) {
        toast.success("تمت إضافة المهمة بنجاح");
        if (res.data) {
          setOfflineTasks([res.data, ...offlineTasks]);
        }
        localStorage.removeItem('draft-task');
        router.push('/tasks');
        router.refresh();
      } else {
        toast.error(res.error || "حدث خطأ أثناء الإضافة");
      }
    } catch (err) {
      toast.error("خطأ غير متوقع");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/tasks">
          <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full hover:bg-slate-100">
            <ArrowRight className="w-5 h-5 text-slate-600" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            إضافة مهمة جديدة
            {isOfflineMode && <WifiOff className="w-5 h-5 text-amber-500 animate-pulse" />}
          </h1>
          <p className="text-slate-500 text-sm">
            أدخل تفاصيل المهمة لحفظها ومتابعتها 
            {isOfflineMode && <span className="text-amber-500 mr-1 font-bold">(حفظ محلي)</span>}
          </p>
        </div>
      </div>

      <Card className="border-slate-200/80 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-6 bg-slate-50/30">
            
            <div className="space-y-3">
              <Label htmlFor="title" className="text-sm font-bold text-slate-700">عنوان المهمة <span className="text-red-500">*</span></Label>
              <Input 
                id="title"
                placeholder="مثال: مراجعة حسابات الربع الأول"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="h-12 bg-white font-medium"
                required
                autoFocus
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="text-sm font-bold text-slate-700">التفاصيل (اختياري)</Label>
              <Textarea 
                id="description"
                placeholder="أضف أي ملاحظات أو تفاصيل إضافية هنا..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[120px] bg-white resize-y"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="status" className="text-sm font-bold text-slate-700">الحالة</Label>
              <Select 
                value={formData.status} 
                onValueChange={(val: TaskStatus) => setFormData({ ...formData, status: val })}
              >
                <SelectTrigger className="h-12 bg-white">
                  <SelectValue placeholder="اختر حالة المهمة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO" className="font-medium">قيد الانتظار</SelectItem>
                  <SelectItem value="IN_PROGRESS" className="font-medium">قيد التنفيذ</SelectItem>
                  <SelectItem value="DONE" className="font-medium">مكتمل</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </CardContent>
          <CardFooter className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <Link href="/tasks">
              <Button type="button" variant="outline" className="font-bold">
                إلغاء
              </Button>
            </Link>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold min-w-[120px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 ml-2" />
                  حفظ المهمة
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
