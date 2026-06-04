import { Skeleton } from "@/components/ui/skeleton";

export default function InventoryLoading() {
  return (
    <div className="container max-w-[90rem] mx-auto px-4 md:px-8 py-8 space-y-8 animate-in fade-in duration-500 h-[calc(100vh-3.5rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-12 w-64 rounded-xl" />
        </div>
        <Skeleton className="h-12 w-full sm:w-40 rounded-xl" />
      </div>

      <div className="rounded-2xl border border-slate-200/60 bg-white/60 p-6 space-y-4 flex-1">
        <Skeleton className="h-12 w-full rounded-xl" />
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
