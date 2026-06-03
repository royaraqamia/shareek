'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { getUser, getAdminUsers, toggleUserApprovalAction } from "@/features/auth/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from '@/utils/toast';
import { 
  ShieldAlert, 
  Search, 
  UserCheck, 
  UserX, 
  Building2, 
  Clock, 
  Mail, 
  AtSign, 
  Sparkles,
  ArrowRight,
  ShieldAlert as AlertIcon
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminProfile {
  id: string;
  email: string;
  role: string;
  full_name: string;
  username: string;
  is_approved: boolean;
  created_at: string;
  organizations?: any;
}

export function AdminClient() {
  const language = useAppStore(state => state.language);
  const router = useRouter();
  
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionUserId, setActionUserId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const userRes = await getUser();
    if (!userRes.success) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const isPlatformAdmin = !!userRes.isPlatformAdmin;
    if (!isPlatformAdmin) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setIsAdmin(true);

    const profilesRes = await getAdminUsers();
    if (profilesRes.success && profilesRes.data) {
      setProfiles(profilesRes.data as AdminProfile[]);
    } else {
      toast.error(profilesRes.message || "فشل تحميل قائمة المستخدمين");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleApproval = async (targetUserId: string, currentStatus: boolean) => {
    setActionUserId(targetUserId);
    try {
      const nextStatus = !currentStatus;
      const res = await toggleUserApprovalAction(targetUserId, nextStatus);
      if (res.success) {
        toast.success(nextStatus ? "تمَّ تفعيل الحساب بنجاح!" : "تمَّ تعطيل الحساب بنجاح");
        setProfiles(prev => prev.map(p => p.id === targetUserId ? { ...p, is_approved: nextStatus } : p));
      } else {
        toast.error(res.message || "حدث خطأ غير مُتوقَّع");
      }
    } catch (err: any) {
      toast.error(err.message || "فشل تنفيذ العمليَّة");
    } finally {
      setActionUserId(null);
    }
  };

  if (loading && isAdmin === null) {
    return (
      <div className="space-y-8 container max-w-[90rem] mx-auto px-4 md:px-8 py-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 gap-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 rounded-full mb-2" />
            <Skeleton className="h-12 w-80 rounded-xl" />
            <Skeleton className="h-5 w-96 rounded-lg" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-24 w-40 rounded-2xl" />
            <Skeleton className="h-24 w-40 rounded-2xl" />
          </div>
        </div>
        
        <div className="rounded-2xl border border-slate-200/60 bg-white/60 p-6 space-y-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center font-arabic px-4">
        <Card className="max-w-md w-full border-red-200 bg-red-50/20 shadow-xl text-center p-8 space-y-6">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <ShieldAlert className="w-8 h-8 text-red-600 animate-bounce" />
            </div>
            <CardTitle className="text-xl font-bold text-red-950">الوصول مرفوض (غير مُصرَّح به)</CardTitle>
            <CardDescription className="text-red-800 mt-2">
              هذه الصَّفحة مخصَّصة بشكل كامل ومحصور لمدراء النظام في الإدارة مجمع القيادة لـ شريك فقط.
            </CardDescription>
          </div>
          <Button 
            className="w-full bg-slate-900 text-white hover:bg-slate-800 font-bold"
            onClick={() => router.push("/dashboard")}
          >
            العودة إلى الصَّفحة الرَّئيسيَّة
          </Button>
        </Card>
      </div>
    );
  }

  // Filter accounts list based on Name, Email or Username
  const filteredProfiles = profiles.filter(p => {
    const q = searchQuery.toLowerCase();
    const orgName = p.organizations 
      ? (Array.isArray(p.organizations) ? p.organizations[0]?.name : p.organizations.name)
      : "";
    return (
      (p.full_name && p.full_name.toLowerCase().includes(q)) ||
      (p.email && p.email.toLowerCase().includes(q)) ||
      (p.username && p.username.toLowerCase().includes(q)) ||
      (orgName && orgName.toLowerCase().includes(q))
    );
  });

  const pendingCount = profiles.filter(p => !p.is_approved).length;

  return (
    <div className="space-y-8 container max-w-[90rem] mx-auto px-4 md:px-8 py-8 font-arabic antialiased" id="admin-dashboard">
      {/* Platform Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
            <span className="text-xs bg-rose-50 border border-rose-100 text-rose-700 py-0.5 px-3 rounded-full font-bold shadow-sm">بوابة الإدارة العامة</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl shadow-sm border border-primary/10">
              <ShieldAlert className="w-7 h-7" />
            </div>
            لوحة إدارة مستخدمي شَريك
          </h1>
          <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed max-w-2xl">
            مراجعة الحسابات الجديدة المسجلة، التحقق من اسم المستخدم الفريد، قبول أو تجميد اشتراكات المنشآت.
          </p>
        </div>

        {/* Dashboard Cards Stats */}
        <div className="flex items-center gap-4">
          <Card className="border-amber-200/50 shrink-0 px-6 py-4 shadow-lg shadow-amber-500/10 bg-gradient-to-br from-amber-50/80 to-white backdrop-blur-sm rounded-2xl">
            <div className="text-[11px] text-amber-700 font-bold mb-1">الحسابات المعلقة</div>
            <div className="text-2xl font-black text-amber-900">{pendingCount} <span className="text-sm font-bold text-amber-700/80">مستخدم</span></div>
          </Card>
          <Card className="border-emerald-200/50 shrink-0 px-6 py-4 shadow-lg shadow-emerald-500/10 bg-gradient-to-br from-emerald-50/80 to-white backdrop-blur-sm rounded-2xl">
            <div className="text-[11px] text-emerald-700 font-bold mb-1">إجمالي المنشآت</div>
            <div className="text-2xl font-black text-emerald-900">{profiles.length} <span className="text-sm font-bold text-emerald-700/80">منشأة</span></div>
          </Card>
        </div>
      </div>

      {/* Filter and Table Container */}
      <Card className="border-slate-200/60 bg-white/60 backdrop-blur-xl shadow-lg shadow-slate-200/40 rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5 px-6 pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">البحث وقائمة المشتركين</CardTitle>
              <CardDescription className="text-base font-medium text-slate-500 mt-1">
                استعرض تفاصيل وحالة المشتركين في جميع المؤسسات.
              </CardDescription>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute right-3.5 top-3 h-5 w-5 text-slate-400" />
              <Input
                placeholder="ابحث بالاسم، البريد أو المنشأة..."
                className="pr-11 h-11 border-slate-200 focus:bg-white text-[15px] font-medium rounded-xl transition-colors shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-[15px]">
              <thead className="bg-slate-50/80 border-y border-slate-200 text-xs text-slate-600 uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-8 py-4">اسم العضوية</th>
                  <th className="px-6 py-4">اسم المنشأة / المشروع</th>
                  <th className="px-6 py-4">الدور الرقمي</th>
                  <th className="px-6 py-4">تاريخ الانضمام</th>
                  <th className="px-6 py-4">الحالة الحالية</th>
                  <th className="px-8 py-4 text-center">إجراءات الإدارة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProfiles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <Search className="w-10 h-10 text-slate-300" />
                        <span className="text-slate-500 font-bold">لا توجد حسابات مطابقة لمعايير البحث في الوقت الحالي.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProfiles.map((p) => {
                    const isBusy = actionUserId === p.id;
                    return (
                      <tr key={p.id} className="hover:bg-blue-50/40 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{p.full_name}</span>
                            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono mt-0.5">
                              <Mail className="w-3 h-3" />
                              <span>{p.email}</span>
                            </div>
                            {p.username && (
                              <div className="flex items-center gap-1 mt-1 text-slate-500 text-xs font-semibold bg-slate-100 w-fit px-2 py-0.5 rounded">
                                <AtSign className="w-3 h-3 text-slate-400" />
                                <span className="font-mono">{p.username}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 font-bold text-slate-700">
                            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>
                              {p.organizations 
                                ? (Array.isArray(p.organizations) 
                                   ? (p.organizations[0]?.name || "مشروع مستقل") 
                                   : (p.organizations.name || "مشروع مستقل")) 
                                : "مشروع مستقل"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-500 text-xs font-bold">
                          {p.role}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          <div className="flex items-center gap-1 text-xs">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{new Date(p.created_at).toLocaleDateString('ar-EG', { dateStyle: 'medium' })}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {p.is_approved ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/50 text-[11px] font-bold px-2.5 py-1 rounded-full">
                              مفعّل ومقبول
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200/50 text-[11px] font-bold px-2.5 py-1 rounded-full animate-pulse">
                              قيد الانتظار لموافقتك
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {p.is_approved ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-100 font-bold bg-white text-xs h-8 cursor-pointer"
                              disabled={isBusy}
                              onClick={() => handleToggleApproval(p.id, p.is_approved)}
                            >
                              <UserX className="w-3.5 h-3.5 ml-1 shrink-0" />
                              {isBusy ? "صبر سيدي..." : "تعطيل الحساب"}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 cursor-pointer shadow-sm shadow-emerald-500/10"
                              disabled={isBusy}
                              onClick={() => handleToggleApproval(p.id, p.is_approved)}
                            >
                              <UserCheck className="w-3.5 h-3.5 ml-1 shrink-0" />
                              {isBusy ? "قيد التفعيل..." : "قبول وتفعيل الفوري"}
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
