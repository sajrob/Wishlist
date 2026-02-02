import { LucideIcon } from "lucide-react";

interface AdminEmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
}

export function AdminEmptyState({ icon: Icon, title, description }: AdminEmptyStateProps) {
    return (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center animate-in fade-in zoom-in duration-500">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/5">
                <Icon className="h-10 w-10 text-primary/40" />
            </div>
            <h3 className="mt-6 text-lg font-bold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
                {description}
            </p>
        </div>
    );
}
