import { Skeleton } from "@/components/ui/skeleton";

export default function GeneratorLoading() {
  return (
    <div className="container flex flex-col gap-8 py-10">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[520px] w-full rounded-xl" />
        <Skeleton className="h-[520px] w-full rounded-xl" />
      </div>
    </div>
  );
}
