import { useAdminWishlists } from "@/hooks/admin/useAdminData";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Loader2,
    Lock,
    Globe,
    Users,
    List,
    User as UserIcon,
    Trash2,
    ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { getInitials } from "@/utils/nameUtils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";

const privacyIcons = {
    public: <Globe className="h-3 w-3 text-green-500" />,
    private: <Lock className="h-3 w-3 text-red-500" />,
    friends: <Users className="h-3 w-3 text-blue-500" />,
};


function WishlistsSkeleton() {
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
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-16 border-b px-4 flex items-center gap-4">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-8 w-24 rounded-full" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-8" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-16" />
                    </div>
                ))}
            </div>
        </div>
    );
}

import { toast } from "sonner";

export default function AdminWishlists() {
    const { data: wishlists, isLoading, deleteWishlist, isDeleting } = useAdminWishlists();

    if (isLoading) {
        return <WishlistsSkeleton />;
    }

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.\n\nNote: All items in this wishlist will become "Uncategorized".`)) {
            const toastId = toast.loading(`Deleting wishlist "${name}"...`);
            try {
                await deleteWishlist(id);
                toast.success(`Wishlist "${name}" deleted`, { id: toastId });
            } catch (err) {
                console.error("Delete error:", err);
                toast.error(`Failed to delete "${name}"`, { id: toastId });
            }
        }
    };

    if (!wishlists || wishlists.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Wishlists Moderation</h1>
                </div>
                <AdminEmptyState
                    icon={List}
                    title="No wishlists found"
                    description="There are currently no wishlists in the system to moderate."
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Wishlists Moderation</h1>
                <Badge variant="outline" className="px-3 py-1">
                    {wishlists?.length || 0} Total Wishlists
                </Badge>
            </div>

            <div className="rounded-xl border shadow-sm bg-card overflow-hidden">
                {/* Mobile View */}
                <div className="md:hidden divide-y">
                    {wishlists?.map((wishlist) => (
                        <div key={wishlist.id} className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-foreground">{wishlist.name}</span>
                                <Badge variant="secondary" className="font-bold">
                                    {wishlist.items_count} items
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-5 w-5 border">
                                        <AvatarImage src={wishlist.user?.avatar_url} />
                                        <AvatarFallback className="text-[8px] bg-primary/5 text-primary">
                                            {getInitials(wishlist.user?.full_name || 'U')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-muted-foreground">{wishlist.user?.full_name}</span>
                                </div>
                                <div className="flex items-center gap-1.5 capitalize font-medium text-muted-foreground">
                                    {privacyIcons[wishlist.is_public ? 'public' : 'private']}
                                    {wishlist.is_public ? 'Public' : 'Private'}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <span className="text-[10px] text-muted-foreground">
                                    {format(new Date(wishlist.created_at), "MMM d, yyyy")}
                                </span>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" asChild>
                                        <a href={`/wishlist/${wishlist.user_id}?category=${wishlist.id}`} target="_blank" rel="noreferrer">
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        onClick={() => handleDelete(wishlist.id, wishlist.name)}
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
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Title</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Owner</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Privacy</th>
                                <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground whitespace-nowrap">Items</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground whitespace-nowrap">Created</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-foreground/80">
                            {wishlists?.map((wishlist) => (
                                <tr key={wishlist.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="p-4 align-middle font-bold text-foreground">
                                        {wishlist.name}
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6 border">
                                                <AvatarImage src={wishlist.user?.avatar_url} />
                                                <AvatarFallback className="text-[10px] bg-primary/5 text-primary">
                                                    {getInitials(wishlist.user?.full_name || 'U')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="truncate max-w-[120px]">{wishlist.user?.full_name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="flex items-center gap-1.5 capitalize text-xs font-medium">
                                            {privacyIcons[wishlist.is_public ? 'public' : 'private']}
                                            {wishlist.is_public ? 'Public' : 'Private'}
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle text-center">
                                        <Badge variant="secondary" className="font-bold">
                                            {wishlist.items_count}
                                        </Badge>
                                    </td>
                                    <td className="p-4 align-middle text-right text-xs whitespace-nowrap">
                                        {format(new Date(wishlist.created_at), "MMM d, yyyy")}
                                    </td>
                                    <td className="p-4 align-middle text-right space-x-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" title="View Wishlist" asChild>
                                            <a href={`/wishlist/${wishlist.user_id}?category=${wishlist.id}`} target="_blank" rel="noreferrer">
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            title="Delete Wishlist"
                                            onClick={() => handleDelete(wishlist.id, wishlist.name)}
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
