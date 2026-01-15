import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function FriendCardSkeleton() {
    return (
        <Card className="overflow-hidden border-muted-foreground/10 bg-card/50 backdrop-blur-sm rounded-[24px]">
            <CardContent className="p-3">
                <div className="flex items-center gap-4">
                    {/* Avatar Skeleton */}
                    <Skeleton className="size-14 rounded-full border-2 border-background shadow-md shrink-0" />

                    <div className="flex-1 space-y-2 min-w-0 pr-2">
                        {/* Name Skeleton */}
                        <Skeleton className="h-4 w-1/2" />

                        {/* Subtitle/Link Skeleton */}
                        <Skeleton className="h-3 w-3/4" />
                    </div>

                    {/* Action Button Skeleton */}
                    <Skeleton className="h-8 w-16 sm:w-20 rounded-full shrink-0" />
                </div>
            </CardContent>
        </Card>
    );
}
