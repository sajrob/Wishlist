/**
 * FriendCardSkeleton component that provides a loading state for friend/user cards.
 * Uses shadcn/ui skeleton components to mimic the layout while data is being fetched.
 */
import { Skeleton } from "@/components/ui/skeleton";

export function FriendCardSkeleton() {
    return (
        <div className="wishlist-card rounded-lg border bg-card p-4">
            <div className="flex flex-col gap-4">
                {/* Avatar skeleton */}
                <div className="card-image-container flex items-center justify-center bg-muted/30">
                    <Skeleton className="h-20 w-20 rounded-full" />
                </div>

                <div className="card-content flex flex-col gap-3">
                    {/* Name skeleton */}
                    <Skeleton className="h-6 w-3/4 mx-auto" />

                    {/* Badge skeleton (optional, smaller) */}
                    <Skeleton className="h-4 w-1/2 mx-auto" />

                    {/* Action button skeleton */}
                    <div className="card-actions mt-auto border-t pt-2">
                        <Skeleton className="h-9 w-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}
