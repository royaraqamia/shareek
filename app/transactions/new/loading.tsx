import { Skeleton } from "@/components/ui/skeleton";

export default function NewTransactionLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl md:px-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-8 w-64 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Skeleton className="h-[400px] rounded-2xl w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-[400px] rounded-2xl w-full" />
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-4">
        <Skeleton className="h-12 w-32 rounded-xl" />
      </div>
    </div>
  );
}
