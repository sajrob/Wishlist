import { useAdminItems } from "@/hooks/admin/useAdminData";
import { Badge } from "@/components/ui/badge";
import {
    Loader2,
    Trash2,
    ExternalLink,
    Package,
    Tag,
    User as UserIcon,
    ShoppingBag,
    DollarSign
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";


function ItemsSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-8 w-32" />
            </div>
            <div className="rounded-xl border shadow-sm">
                <div className="h-12 border-b bg-muted/50 px-4 flex items-center gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-4 flex-1" />)}
                </div>
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-16 border-b px-4 flex items-center gap-4">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-10" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function AdminItems() {
    const { data: items, isLoading, deleteItem, isDeleting } = useAdminItems();

    if (isLoading) {
        return <ItemsSkeleton />;
    }

    if (!items || items.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Items Moderation</h1>
                </div>
                <AdminEmptyState
                    icon={Package}
                    title="No items found"
                    description="There are currently no wishlist items in the system to moderate."
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Items Moderation</h1>
                <Badge variant="outline" className="px-3 py-1">
                    {items?.length || 0} Total Items
                </Badge>
            </div>

            <div className="rounded-xl border shadow-sm bg-card overflow-hidden">
                {/* Mobile View */}
                <div className="md:hidden divide-y">
                    {items?.map((item) => (
                        <div key={item.id} className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-foreground line-clamp-1">{item.name}</span>
                                <div className="flex items-center text-xs font-bold text-blue-600 dark:text-blue-400">
                                    <DollarSign className="h-3 w-3 mr-0.5" />
                                    {Number(item.price).toFixed(2)}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Owner / Wishlist</p>
                                    <div className="text-[11px] font-medium truncate">
                                        {item.owner_name} / {item.wishlist_name}
                                    </div>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Status</p>
                                    <Badge variant={item.claims_count > 0 ? "default" : "secondary"} className="text-[9px] h-4 px-1">
                                        {item.claims_count} {item.claims_count === 1 ? 'Claim' : 'Claims'}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <span className="text-[10px] text-muted-foreground">
                                    {format(new Date(item.created_at), "MMM d, yyyy")}
                                </span>
                                <div className="flex items-center gap-1">
                                    {item.buy_link && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" asChild>
                                            <a href={item.buy_link} target="_blank" rel="noreferrer">
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        onClick={() => deleteItem(item.id)}
                                        disabled={isDeleting}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50 transition-colors">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Item Name</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Price</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap text-center">Claims</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Wishlist / Owner</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground whitespace-nowrap">Added</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-foreground/80">
                            {items?.map((item) => (
                                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="p-4 align-middle">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-foreground line-clamp-1">{item.name}</span>
                                            {item.buy_link && (
                                                <a
                                                    href={item.buy_link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-1 text-[10px] text-primary hover:underline mt-0.5"
                                                >
                                                    <ShoppingBag className="h-3 w-3" />
                                                    Buy Link
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle font-medium text-blue-600 dark:text-blue-400">
                                        <div className="flex items-center text-xs">
                                            <DollarSign className="h-3 w-3 mr-0.5" />
                                            {Number(item.price).toFixed(2)}
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle text-center">
                                        <Badge variant={item.claims_count > 0 ? "default" : "secondary"} className="text-[10px] h-5">
                                            {item.claims_count} {item.claims_count === 1 ? 'Claim' : 'Claims'}
                                        </Badge>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-1 text-[11px] font-medium text-foreground">
                                                <Tag className="h-3 w-3 opacity-50" />
                                                {item.wishlist_name}
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <UserIcon className="h-3 w-3 opacity-50" />
                                                {item.owner_name}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle text-right text-xs whitespace-nowrap">
                                        {format(new Date(item.created_at), "MMM d, yyyy")}
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => deleteItem(item.id)}
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
