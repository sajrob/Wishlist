import { Skeleton } from "@/components/ui/skeleton";

export function SidebarCategorySkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-1 px-3">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 py-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 flex-1" />
                </div>
            ))}
        </div>
    );
}
