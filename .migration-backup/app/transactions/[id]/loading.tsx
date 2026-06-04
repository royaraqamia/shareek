import { Skeleton } from "@/components/ui/skeleton";

export default function TransactionDetailLoading() {
  return (
    <div className="container max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-8 w-48 rounded-lg" />
      </div>

      <div className="rounded-2xl border border-slate-200/60 bg-white/60 p-8 space-y-8">
        <div className="flex justify-between items-start">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32 rounded-md" />
            <Skeleton className="h-8 w-64 rounded-xl" />
            <Skeleton className="h-20 w-48 rounded-xl" />
          </div>
          <div className="space-y-4 items-end flex flex-col">
            <Skeleton className="h-6 w-24 rounded-md" />
            <Skeleton className="h-12 w-48 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
        </div>

        <Skeleton className="h-12 w-full rounded-xl" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
        
        <div className="flex justify-end gap-16 pt-8">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32 rounded-md" />
            <Skeleton className="h-6 w-32 rounded-md" />
          </div>
          <div className="space-y-4 text-right">
            <Skeleton className="h-6 w-32 rounded-md" />
            <Skeleton className="h-6 w-32 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
