import { useAdminActivityLog } from "@/hooks/admin/useAdminData";
import { Badge } from "@/components/ui/badge";
import {
    Loader2,
    Activity,
    User as UserIcon,
    Database,
    Tag,
    Trash2,
    Edit,
    Plus,
    History
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";

const actionIcons: Record<string, any> = {
    DELETE: <Trash2 className="h-4 w-4 text-red-500" />,
    UPDATE: <Edit className="h-4 w-4 text-amber-500" />,
    UPDATE_STATUS: <Activity className="h-4 w-4 text-blue-500" />,
    TOGGLE_ADMIN: <Database className="h-4 w-4 text-indigo-500" />,
    INSERT: <Plus className="h-4 w-4 text-green-500" />,
};

const entityIcons: Record<string, any> = {
    FEEDBACK: <MessageSquare className="h-3 w-3" />,
    USER: <UserIcon className="h-3 w-3" />,
    ITEM: <Package className="h-3 w-3" />,
    CLAIM: <Gift className="h-3 w-3" />,
    CATEGORY: <Tag className="h-3 w-3" />,
};

import { MessageSquare, Package, Gift } from "lucide-react";


function ActivityLogSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-8 w-32" />
            </div>

            <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="border-none shadow-sm">
                        <CardContent className="p-4 flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                            <div className="text-right space-y-1">
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-2 w-20" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default function AdminActivityLog() {
    const { data: logs, isLoading } = useAdminActivityLog();

    if (isLoading) {
        return <ActivityLogSkeleton />;
    }

    if (!logs || logs.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">System Activity Log</h1>
                </div>
                <AdminEmptyState
                    icon={History}
                    title="No activity recorded"
                    description="The system audit log is currently empty. Activities will appear here as they happen."
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Audit Trail</h1>
                <Badge variant="outline" className="px-3 py-1 bg-primary/5">
                    Live Activity Log
                </Badge>
            </div>

            <div className="space-y-4">
                {logs?.map((log) => (
                    <Card key={log.id} className="border-none shadow-sm bg-card hover:bg-muted/30 transition-colors overflow-hidden">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-4 p-4">
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0 border">
                                    {actionIcons[log.action_type] || <History className="h-4 w-4" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-bold text-sm">
                                            {log.admin?.full_name || 'System'}
                                        </span>
                                        <span className="text-muted-foreground text-sm">
                                            {log.action_type.toLowerCase().replace('_', ' ')}d
                                        </span>
                                        <Badge variant="secondary" className="text-[10px] h-4 px-1 gap-1">
                                            {entityIcons[log.entity_type]}
                                            {log.entity_type}
                                        </Badge>
                                        <span className="text-muted-foreground text-xs italic truncate max-w-[200px]">
                                            ID: {log.entity_id?.slice(0, 8)}...
                                        </span>
                                    </div>

                                    {log.details && (
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                            {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                                        </p>
                                    )}
                                </div>

                                <div className="text-right shrink-0">
                                    <div className="text-xs font-medium">
                                        {format(new Date(log.created_at), "h:mm a")}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">
                                        {format(new Date(log.created_at), "MMM d, yyyy")}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {(!logs || logs.length === 0) && (
                    <div className="h-32 flex items-center justify-center text-muted-foreground italic border-2 border-dashed rounded-2xl">
                        No activity recorded yet.
                    </div>
                )}
            </div>
        </div>
    );
}
