import { Skeleton } from "@/components/ui/skeleton";

export function WishlistCardSkeleton() {
    return (
        <div className="wishlist-card-skeleton rounded-lg border bg-card p-4">
            <div className="flex flex-col gap-4">
                {/* Image skeleton */}
                <Skeleton className="h-48 w-full rounded-md" />

                <div className="flex flex-col gap-3">
                    {/* Title skeleton */}
                    <Skeleton className="h-6 w-3/4" />

                    {/* Price skeleton */}
                    <Skeleton className="h-5 w-1/4" />

                    {/* Description skeleton */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>

                    {/* Action buttons skeleton */}
                    <div className="flex gap-2 mt-2">
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 flex-1" />
                    </div>
                </div>
            </div>
        </div>
    );
}
