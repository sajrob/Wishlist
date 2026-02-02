import { useAdminUsers } from "@/hooks/admin/useAdminData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Loader2,
    ShieldCheck,
    ShieldAlert,
    Gift,
    Package,
    User as UserIcon,
    Calendar,
    MoreVertical,
    AtSign
} from "lucide-react";
import { format } from "date-fns";
import { getInitials } from "@/utils/nameUtils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";


function UsersSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-8 w-32" />
            </div>

            <div className="grid gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4 rounded-2xl border bg-card p-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-1/4" />
                            <Skeleton className="h-3 w-1/3" />
                        </div>
                        <div className="hidden md:flex gap-6">
                            <Skeleton className="h-10 w-16" />
                            <Skeleton className="h-10 w-16" />
                        </div>
                        <Skeleton className="h-8 w-24" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function AdminUsers() {
    const { data: users, isLoading, toggleAdmin, isToggling } = useAdminUsers();

    if (isLoading) {
        return <UsersSkeleton />;
    }

    if (!users || users.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                </div>
                <AdminEmptyState
                    icon={UserIcon}
                    title="No users found"
                    description="There are currently no registered users in the system."
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                <Badge variant="outline" className="px-3 py-1 bg-primary/5">
                    {users?.length || 0} Registered Users
                </Badge>
            </div>

            <div className="grid gap-4">
                {users?.map((user) => (
                    <div
                        key={user.id}
                        className="flex items-center gap-4 rounded-2xl border bg-card p-4 transition-all hover:shadow-md"
                    >
                        <Avatar className="h-12 w-12 border-2 border-primary/10">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback className="bg-primary/5 text-primary font-bold">
                                {getInitials(user.full_name)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold truncate">{user.full_name}</h3>
                                {user.is_admin && (
                                    <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 h-5 px-1.5 text-[10px]">
                                        <ShieldCheck className="h-3 w-3 mr-0.5" />
                                        ADMIN
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                <span className="flex items-center gap-1">
                                    <AtSign className="h-3 w-3" />
                                    {user.username || user.email?.split('@')[0]}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {user.created_at
                                        ? `Joined ${format(new Date(user.created_at), "MMM yyyy")}`
                                        : "Platform Member"}
                                </span>
                            </div>

                            {/* Mobile Stats */}
                            <div className="flex md:hidden items-center gap-4 mt-2 pt-2 border-t">
                                <div className="flex items-center gap-1 text-[10px] font-bold">
                                    <Gift className="h-3 w-3 text-pink-500" />
                                    {user.stats?.wishlists_count || 0}
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-bold">
                                    <Package className="h-3 w-3 text-blue-500" />
                                    {user.stats?.items_count || 0}
                                </div>
                            </div>
                        </div>

                        <div className="hidden md:flex items-center gap-6 px-4 border-x shrink-0">
                            <div className="text-center min-w-[60px]">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Wishlists</p>
                                <div className="flex items-center justify-center gap-1 font-bold">
                                    <Gift className="h-3 w-3 text-pink-500" />
                                    {user.stats?.wishlists_count || 0}
                                </div>
                            </div>
                            <div className="text-center min-w-[60px]">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Items</p>
                                <div className="flex items-center justify-center gap-1 font-bold">
                                    <Package className="h-3 w-3 text-blue-500" />
                                    {user.stats?.items_count || 0}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center space-x-2 mr-2">
                                <Switch
                                    id={`admin-${user.id}`}
                                    checked={user.is_admin}
                                    onCheckedChange={(checked) => toggleAdmin({ userId: user.id, isAdmin: checked })}
                                    disabled={isToggling}
                                />
                                <Label htmlFor={`admin-${user.id}`} className="text-[10px] font-bold uppercase hidden lg:block">Admin</Label>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => window.open(`/profile/${user.id}`, '_blank')}>
                                        <UserIcon className="h-4 w-4 mr-2" />
                                        View Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">
                                        <ShieldAlert className="h-4 w-4 mr-2" />
                                        Suspend User
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                ))}

                {(!users || users.length === 0) && (
                    <div className="h-32 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-2xl">
                        No users found.
                    </div>
                )}
            </div>
        </div >
    );
}

