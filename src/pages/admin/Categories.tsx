import { useAdminCategories } from "@/hooks/admin/useAdminData";
import { Badge } from "@/components/ui/badge";
import {
    Loader2,
    Calendar,
    Tag,
    Globe,
    Lock
} from "lucide-react";
import { format } from "date-fns";

export default function AdminCategories() {
    const { data: categories, isLoading } = useAdminCategories();

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">System Categories</h1>
                <Badge variant="outline" className="px-3 py-1">
                    {categories?.length || 0} Total Categories
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories?.map((category) => (
                    <div
                        key={category.id}
                        className="p-4 rounded-xl border bg-card hover:bg-muted/30 transition-all shadow-sm flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center border text-primary">
                                <Tag className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground">{category.name}</h3>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                                    <span className="flex items-center gap-0.5">
                                        <Calendar className="h-3 w-3" />
                                        {format(new Date(category.created_at), "MMM yyyy")}
                                    </span>
                                    <span className="flex items-center gap-0.5">
                                        {category.is_public ? (
                                            <>
                                                <Globe className="h-3 w-3" />
                                                Public
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="h-3 w-3" />
                                                Private
                                            </>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {(!categories || categories.length === 0) && (
                <div className="h-32 flex items-center justify-center text-muted-foreground italic border-2 border-dashed rounded-xl">
                    No categories found in the system.
                </div>
            )}
        </div>
    );
}
