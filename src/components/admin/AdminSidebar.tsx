import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    MessageSquare,
    Users,
    List,
    Package,
    Tags,
    Gift,
    Menu,
    History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "Feedback",
        href: "/admin/feedback",
        icon: MessageSquare,
    },
    {
        title: "Users",
        href: "/admin/users",
        icon: Users,
    },
    {
        title: "Wishlists",
        href: "/admin/wishlists",
        icon: List,
    },
    {
        title: "Items",
        href: "/admin/items",
        icon: Package,
    },
    {
        title: "Claims",
        href: "/admin/claims",
        icon: Gift,
    },
    {
        title: "Categories",
        href: "/admin/categories",
        icon: Tags,
    },
    {
        title: "Activity Log",
        href: "/admin/activity",
        icon: History,
    },
];


interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function AdminSidebar({ className }: SidebarProps) {
    const location = useLocation();

    return (
        <div className={cn("pb-12", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Admin Panel
                    </h2>
                    <div className="space-y-1">
                        {sidebarItems.map((item) => (
                            <Button
                                key={item.href}
                                variant={location.pathname === item.href ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                asChild
                            >
                                <Link to={item.href}>
                                    <item.icon className="mr-2 h-4 w-4" />
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function MobileAdminSidebar() {
    const [open, setOpen] = useState(false);
    const location = useLocation();

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
                <div className="px-7">
                    <Link
                        to="/admin"
                        className="flex items-center"
                        onClick={() => setOpen(false)}
                    >
                        <span className="font-bold">Wishlist Admin</span>
                    </Link>
                </div>
                <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                    <div className="flex flex-col space-y-3">
                        {sidebarItems.map(
                            (item) =>
                            (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    onClick={() => setOpen(false)}
                                    className={cn(
                                        "text-muted-foreground hover:text-primary",
                                        location.pathname === item.href && "text-primary font-medium"
                                    )}
                                >
                                    {item.title}
                                </Link>
                            )
                        )}
                        <Link
                            to="/dashboard"
                            className="text-muted-foreground hover:text-primary mt-8 pt-8 border-t"
                        >
                            Return to App
                        </Link>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
