'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface DangerConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
  isLoading?: boolean;
  language?: 'ar' | 'en';
}

export function DangerConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  count,
  isLoading = false,
  language = 'ar',
}: DangerConfirmDialogProps) {
  const isAr = language === 'ar';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px] overflow-hidden rounded-2xl border border-destructive/20 bg-background/95 backdrop-blur-xl shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <DialogHeader className="pt-4 pb-2">
          <div className="flex flex-col items-center gap-3 text-center">
            {/* Pulsing Alert Badge */}
            <div className="w-12 h-12 rounded-full bg-rose-505/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <DialogTitle className={`text-xl font-black text-rose-950 dark:text-rose-100 ${isAr ? 'text-center' : 'text-center'}`}>
              {isAr ? 'تأكيد الحذف النهائي' : 'Confirm Permanent Deletion'}
            </DialogTitle>
            
            <DialogDescription className="text-[15px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed text-center">
              {isAr ? (
                <>
                  هل أنت متأكد من حذف <span className="font-bold text-rose-600 dark:text-rose-400 font-mono text-base">{count}</span> من العناصر المحددة؟ لا يمكن التراجع عن هذا الإجراء وسيتم مسح البيانات بشكل دائم.
                </>
              ) : (
                <>
                  Are you sure you want to permanently delete <span className="font-bold text-rose-600 dark:text-rose-400 font-mono text-base">{count}</span> selected items? This action cannot be undone and all data will be lost.
                </>
              )}
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="flex flex-col-reverse sm:flex-row-reverse sm:justify-start gap-2.5 pt-4 pb-2 border-t border-slate-100 dark:border-slate-800/60 mt-2">
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto h-11 px-6 rounded-xl bg-rose-650 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-sm shadow-md shadow-rose-600/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              isAr ? 'نعم، احذف نهائياً' : 'Yes, Delete Permanently'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto h-11 px-5 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-transparent dark:hover:bg-slate-800 font-bold text-sm cursor-pointer"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
