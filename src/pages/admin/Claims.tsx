import { useAdminClaims } from "@/hooks/admin/useAdminData";
import { Badge } from "@/components/ui/badge";
import {
    Loader2,
    Trash2,
    Calendar,
    Link as LinkIcon,
    Gift,
    User as UserIcon,
    ArrowRight
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";


function ClaimsSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-8 w-32" />
            </div>
            <div className="rounded-xl border shadow-sm">
                <div className="h-12 border-b bg-muted/50 px-4 flex items-center gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-4 flex-1" />)}
                </div>
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-16 border-b px-4 flex items-center gap-4">
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-8 w-10" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function AdminClaims() {
    const { data: claims, isLoading, deleteClaim, isDeleting } = useAdminClaims();

    if (isLoading) {
        return <ClaimsSkeleton />;
    }

    if (!claims || claims.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Claims Moderation</h1>
                </div>
                <AdminEmptyState
                    icon={Gift}
                    title="No active claims found"
                    description="There are currently no items being claimed in the system to moderate."
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Claims Moderation</h1>
                <Badge variant="outline" className="px-3 py-1">
                    {claims?.length || 0} Total Claims
                </Badge>
            </div>

            <div className="rounded-xl border shadow-sm bg-card overflow-hidden">
                {/* Mobile View */}
                <div className="md:hidden divide-y">
                    {claims?.map((claim) => (
                        <div key={claim.id} className="p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                {claim.item_image && (
                                    <div className="h-10 w-10 rounded-lg overflow-hidden border bg-white shrink-0">
                                        <img src={claim.item_image} alt={claim.item_name} className="h-full w-full object-cover" />
                                    </div>
                                )}
                                <div className="flex flex-col">
                                    <span className="font-bold text-foreground text-sm">{claim.item_name}</span>
                                    <span className="text-[10px] text-muted-foreground">{format(new Date(claim.created_at), "MMM d, h:mm a")}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs bg-muted/30 p-2 rounded-lg">
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-muted-foreground uppercase font-bold">Claimer</span>
                                    <span className="font-medium text-foreground">{claim.claimer_name}</span>
                                </div>
                                <ArrowRight className="h-3 w-3 text-muted-foreground opacity-30" />
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] text-muted-foreground uppercase font-bold">Owner</span>
                                    <span className="font-medium text-foreground">{claim.owner_name}</span>
                                </div>
                            </div>

                            <div className="flex justify-end pt-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-destructive hover:bg-destructive/10"
                                    onClick={() => deleteClaim(claim.id)}
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remove Claim
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50 transition-colors">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Item</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Relationship</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground whitespace-nowrap">Date Claimed</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-foreground/80">
                            {claims?.map((claim) => (
                                <tr key={claim.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="p-4 align-middle">
                                        <div className="flex items-center gap-3">
                                            {claim.item_image && (
                                                <div className="h-10 w-10 rounded-lg overflow-hidden border bg-white shrink-0">
                                                    <img
                                                        src={claim.item_image}
                                                        alt={claim.item_name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground">{claim.item_name}</span>
                                                <span className="text-[10px] text-muted-foreground">ID: {claim.item_id.slice(0, 8)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col items-end">
                                                <span className="font-medium text-foreground">{claim.claimer_name}</span>
                                                <Badge variant="secondary" className="px-1 text-[9px] h-4">Claimer</Badge>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-30" />
                                            <div className="flex flex-col items-start">
                                                <span className="font-medium text-foreground">{claim.owner_name}</span>
                                                <Badge variant="outline" className="px-1 text-[9px] h-4">Owner</Badge>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle text-right text-xs whitespace-nowrap">
                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3 opacity-50" />
                                                {format(new Date(claim.created_at), "MMM d, yyyy")}
                                            </div>
                                            <span className="text-muted-foreground text-[10px]">
                                                {format(new Date(claim.created_at), "h:mm a")}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => deleteClaim(claim.id)}
                                            disabled={isDeleting}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
