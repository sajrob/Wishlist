import {
    useAdminFeedback,
    useAdminUsers,
    useAdminWishlists,
    useAdminItems,
    useAdminClaims,
    useAdminActivityLog
} from "@/hooks/admin/useAdminData";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    Users,
    MessageSquare,
    List,
    Package,
    TrendingUp,
    AlertCircle,
    ArrowRight,
    ShieldCheck,
    Plus,
    Gift,
    History,
    Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Area, AreaChart } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";


function DashboardSkeleton() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="border-none shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-1" />
                            <Skeleton className="h-3 w-32 mb-4" />
                            <Skeleton className="h-16 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Add data generation helper
const getTrendData = (data: any[] = [], days = 30) => {
    if (!Array.isArray(data)) return [];

    // Sort by created_at ascending
    const sorted = [...data].sort((a, b) =>
        new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
    );

    const chartData = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        d.setHours(23, 59, 59, 999);

        // Cumulative count up to this day
        const value = sorted.filter(item => new Date(item.created_at || 0) <= d).length;

        chartData.push({
            date: format(d, "MMM dd"),
            value
        });
    }
    return chartData;
};

export default function AdminDashboard() {
    const { data: feedback, isLoading: loadingFeedback, error: errorFeedback } = useAdminFeedback();
    const { data: users, isLoading: loadingUsers, error: errorUsers } = useAdminUsers();
    const { data: wishlists, isLoading: loadingWishlists, error: errorWishlists } = useAdminWishlists();
    const { data: items, isLoading: loadingItems, error: errorItems } = useAdminItems();
    const { data: claims, isLoading: loadingClaims } = useAdminClaims();
    const { data: activityLogs, isLoading: loadingLogs } = useAdminActivityLog();

    const isLoading = loadingFeedback || loadingUsers || loadingWishlists || loadingItems || loadingClaims || loadingLogs;
    const hasError = errorFeedback || errorUsers || errorWishlists || errorItems;

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (hasError) {
        const firstError = errorFeedback || errorUsers || errorWishlists || errorItems;
        const errorMessage = (firstError as any)?.message || "Unknown database error";

        return (
            <div className="flex h-[400px] flex-col items-center justify-center gap-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <div className="text-center">
                    <h3 className="font-bold text-lg">Failed to load dashboard data</h3>
                    <p className="text-muted-foreground text-sm font-mono bg-destructive/5 p-2 rounded border border-destructive/10 mt-2">
                        Error: {errorMessage}
                    </p>
                </div>
                <Button onClick={() => window.location.reload()} variant="outline">Retry Dashboard</Button>
            </div>
        );
    }

    const pendingFeedback = feedback?.filter(f => f?.status === 'New').length || 0;
    const recentUsers = Array.isArray(users) ? users.slice(0, 5) : [];
    const recentActivity = Array.isArray(activityLogs) ? activityLogs.slice(0, 5) : [];

    // Chart Configuration
    const chartConfig = {
        users: {
            label: "Users",
            color: "hsl(var(--chart-1))",
        },
        wishlists: {
            label: "Wishlists",
            color: "hsl(var(--chart-2))",
        },
        items: {
            label: "Items",
            color: "hsl(var(--chart-3))",
        },
        claims: {
            label: "Claims",
            color: "hsl(var(--chart-4))",
        },
    } satisfies ChartConfig;

    const metrics = [
        {
            id: "users",
            title: "Total Users",
            value: users?.length || 0,
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            chartColor: "hsl(var(--chart-1))",
            description: "Registered accounts",
            data: getTrendData(users)
        },
        {
            id: "wishlists",
            title: "Wishlists",
            value: wishlists?.length || 0,
            icon: List,
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
            chartColor: "hsl(var(--chart-2))",
            description: "Collections created",
            data: getTrendData(wishlists)
        },
        {
            id: "items",
            title: "Total Items",
            value: items?.length || 0,
            icon: Package,
            color: "text-pink-500",
            bg: "bg-pink-500/10",
            chartColor: "hsl(var(--chart-3))",
            description: "Wishes cataloged",
            data: getTrendData(items)
        },
        {
            id: "claims",
            title: "Gift Claims",
            value: claims?.length || 0,
            icon: Gift,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            chartColor: "hsl(var(--chart-4))",
            description: "Active claims",
            data: getTrendData(claims)
        }
    ];



    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
                    <p className="text-muted-foreground mt-1">Monitor platform health and user activity.</p>
                </div>
                {pendingFeedback > 0 && (
                    <Badge variant="destructive" className="animate-pulse py-1.5 px-4 font-bold text-sm">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        {pendingFeedback} Unresolved Reports
                    </Badge>
                )}
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {metrics.map((metric) => (
                    <Card key={metric.title} className="border-2 shadow-sm transition-all hover:border-primary/20 overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                {metric.title}
                            </CardTitle>
                            <div className={`rounded-full p-2 ${metric.bg}`}>
                                <metric.icon className={`h-4 w-4 ${metric.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold mb-1">{metric.value}</div>
                            <p className="text-[10px] text-muted-foreground mb-4 flex items-center gap-1 italic">
                                {metric.description}
                            </p>

                            <div className="h-[60px] w-full">
                                <ChartContainer config={chartConfig} className="h-full w-full">
                                    <AreaChart data={metric.data}>
                                        <defs>
                                            <linearGradient id={`fill-${metric.id}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={metric.chartColor} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={metric.chartColor} stopOpacity={0.0} />
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            dataKey="value"
                                            type="natural"
                                            fill={`url(#fill-${metric.id})`}
                                            fillOpacity={0.4}
                                            stroke={metric.chartColor}
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent hideLabel />}
                                        />
                                    </AreaChart>
                                </ChartContainer>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Audit Trail Preview */}
                <Card className="lg:col-span-4 border-2 shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between bg-muted/30 pb-4">
                        <div>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <History className="h-5 w-5 text-primary" />
                                Audit Trail
                            </CardTitle>
                            <CardDescription>Latest administrative actions</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild className="text-xs font-bold">
                            <Link to="/admin/activity">
                                Full Log <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {recentActivity.map((log) => (
                                <div key={log.id} className="flex items-start gap-4 p-3 rounded-xl border bg-card transition-colors hover:bg-muted/30">
                                    <div className="mt-1 h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 border text-[10px] font-bold">
                                        {log.action_type?.charAt(0) || 'A'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="font-bold text-sm truncate">{log.admin?.full_name || 'Admin'}</span>
                                            <Badge variant="secondary" className="text-[8px] h-3.5 px-1 uppercase leading-none">
                                                {log.entity_type}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-1 italic">
                                            {log.action_type?.toLowerCase().replace('_', ' ') || 'action'}d record {log.entity_id?.slice(0, 8)}...
                                        </p>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground whitespace-nowrap">
                                        {log.created_at ? format(new Date(log.created_at), "h:mm a") : '...'}
                                    </div>
                                </div>
                            ))}
                            {recentActivity.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground italic text-sm">
                                    No activity recorded yet.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick User List */}
                <Card className="lg:col-span-3 border-2 shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between bg-muted/30 pb-4">
                        <div>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                New Signups
                            </CardTitle>
                            <CardDescription>Latest community members</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild className="text-xs font-bold">
                            <Link to="/admin/users">
                                Manage <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-5">
                            {recentUsers.map((u) => (
                                <div key={u.id} className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-primary/5 border-2 border-primary/10 flex items-center justify-center font-bold text-primary text-xs shrink-0">
                                        {u.full_name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate">{u.full_name}</p>
                                        <p className="text-[10px] text-muted-foreground truncate italic">@{u.username || 'user'}</p>
                                    </div>
                                    {u.is_admin ? (
                                        <ShieldCheck className="h-4 w-4 text-indigo-500" />
                                    ) : (
                                        <div className="text-[10px] text-muted-foreground">
                                            {u.created_at ? format(new Date(u.created_at), "MMM d") : ""}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

