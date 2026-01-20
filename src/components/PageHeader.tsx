/**
 * Reusable page header component for consistent layout across pages.
 * Includes sidebar trigger, title, subtitle, and optional action buttons.
 */
import React from 'react';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
    className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    subtitle,
    actions,
    className = "",
}) => {
    return (
        <header
            className={`flex h-14 md:h-16 shrink-0 items-center justify-between gap-2 border-b px-6 bg-background sticky top-0 z-10 ${className}`}
        >
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="h-4" />
                <div className="flex flex-col min-w-0">
                    <h1 className="text-lg font-bold tracking-tight truncate">{title}</h1>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground hidden sm:block truncate">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </header>
    );
};
