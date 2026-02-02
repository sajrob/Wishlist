import { useAdminFeedback } from "@/hooks/admin/useAdminData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Loader2,
    Clock,
    CheckCircle2,
    AlertCircle,
    Trash2,
    ExternalLink,
    Bug,
    Lightbulb,
    MessageSquare,
    Download
} from "lucide-react";
import { format } from "date-fns";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Feedback } from "@/types/admin";
import { exportToCSV } from "@/utils/csvExport";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";

const statusColors = {
    New: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "In Progress": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    Resolved: "bg-green-500/10 text-green-500 border-green-500/20",
    Archived: "bg-slate-500/10 text-slate-500 border-slate-500/20",
};

const typeIcons = {
    Bug: <Bug className="h-4 w-4 text-red-500" />,
    "Feature Request": <Lightbulb className="h-4 w-4 text-green-500" />,
    "UX Issue": <MessageSquare className="h-4 w-4 text-amber-500" />,
};


function FeedbackSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-6 w-32" />
                </div>
                <Skeleton className="h-9 w-32" />
            </div>

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="p-0">
                    <div className="h-12 border-b bg-muted/50 flex items-center px-4 gap-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-4 flex-1" />
                        ))}
                    </div>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-16 border-b flex items-center px-4 gap-4">
                            <Skeleton className="h-8 w-24 rounded-full" />
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-4 flex-1" />
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function AdminFeedback() {
    const { data: feedback, isLoading, updateStatus, deleteFeedback, isUpdating } = useAdminFeedback();

    if (isLoading) {
        return <FeedbackSkeleton />;
    }

    if (!feedback || feedback.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Feedback Triage</h1>
                </div>
                <AdminEmptyState
                    icon={MessageSquare}
                    title="No feedback reports"
                    description="You've reached inbox zero! No feedback reports have been submitted yet."
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold tracking-tight">Feedback Triage</h1>
                    <Badge variant="outline" className="px-3 py-1">
                        {feedback?.length || 0} Total Reports
                    </Badge>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 font-bold border-2"
                    onClick={() => exportToCSV(feedback || [], "wishlist_feedback")}
                    disabled={!feedback || feedback.length === 0}
                >
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                {/* Mobile View: Cards */}
                <div className="md:hidden divide-y">
                    {feedback?.map((report) => (
                        <div key={report.id} className="p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 font-medium">
                                    {typeIcons[report.type]}
                                    <span>{report.type}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {format(new Date(report.created_at), "MMM d")}
                                </span>
                            </div>

                            <p className="text-sm text-foreground/80 leading-relaxed italic border-l-2 border-primary/20 pl-3">
                                "{report.message}"
                            </p>

                            <div className="flex items-center justify-between pt-2">
                                <Select
                                    defaultValue={report.status}
                                    onValueChange={(val) => updateStatus({ id: report.id, status: val as Feedback['status'] })}
                                    disabled={isUpdating}
                                >
                                    <SelectTrigger className={`h-8 w-[120px] rounded-full border-2 ${statusColors[report.status]}`}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="New">New</SelectItem>
                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                        <SelectItem value="Resolved">Resolved</SelectItem>
                                        <SelectItem value="Archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>

                                <div className="flex items-center gap-2">
                                    {report.page_url && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                            <a href={report.page_url} target="_blank" rel="noreferrer">
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        onClick={() => deleteFeedback(report.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="text-[10px] text-muted-foreground bg-muted/50 p-2 rounded flex justify-between">
                                <span>User: {report.username}</span>
                                <span>{report.user_id?.slice(0, 8)}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50 transition-colors">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Status</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Message</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground text-right">Date</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {feedback?.map((report) => (
                                <tr key={report.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="p-4 align-middle">
                                        <Select
                                            defaultValue={report.status}
                                            onValueChange={(val) => updateStatus({ id: report.id, status: val as Feedback['status'] })}
                                            disabled={isUpdating}
                                        >
                                            <SelectTrigger className={`h-8 w-[130px] rounded-full border-2 ${statusColors[report.status]}`}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="New">New</SelectItem>
                                                <SelectItem value="In Progress">In Progress</SelectItem>
                                                <SelectItem value="Resolved">Resolved</SelectItem>
                                                <SelectItem value="Archived">Archived</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="flex items-center gap-2 font-medium">
                                            {typeIcons[report.type]}
                                            <span className="hidden sm:inline">{report.type}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="max-w-[300px] lg:max-w-[500px]">
                                            <p className="line-clamp-2 text-foreground/80 leading-relaxed italic">
                                                "{report.message}"
                                            </p>
                                            {report.page_url && (
                                                <a
                                                    href={report.page_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="mt-1 flex items-center gap-1 text-[10px] text-primary hover:underline"
                                                >
                                                    <ExternalLink className="h-3 w-3" />
                                                    View Page
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="flex flex-col">
                                            <span className="font-bold">{report.username}</span>
                                            <span className="text-[10px] text-muted-foreground">ID: {report.user_id?.slice(0, 8)}...</span>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle text-right text-xs whitespace-nowrap">
                                        {format(new Date(report.created_at), "MMM d, h:mm a")}
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => deleteFeedback(report.id)}
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
