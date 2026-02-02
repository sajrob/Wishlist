import { Outlet } from "react-router-dom";
import { AdminSidebar, MobileAdminSidebar } from "@/components/admin/AdminSidebar";
import { UserNav } from "@/components/UserNav";
import { ModeToggle } from "@/components/mode-toggle"; // If using theme toggle
import { Button } from "@/components/ui/button";
import { AdminSearch } from "@/components/admin/AdminSearch";
import { AdminErrorBoundary } from "@/components/admin/AdminErrorBoundary";

export default function AdminLayout() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                    <MobileAdminSidebar />
                    <div className="mr-4 hidden md:flex">
                        <a className="mr-6 flex items-center space-x-2" href="/admin">
                            <span className="hidden font-bold sm:inline-block">
                                Wishlist Admin
                            </span>
                        </a>
                    </div>
                    <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                        <nav className="flex items-center space-x-2">
                            <AdminSearch />
                            <ModeToggle />
                            <UserNav />
                            <Button variant="ghost" asChild>
                                <a href="/dashboard">Exit Admin</a>
                            </Button>
                        </nav>
                    </div>
                </div>
            </header>
            <div className="flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)]">
                <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
                    <AdminSidebar />
                </aside>
                <main className="flex w-full flex-col overflow-hidden p-6">
                    <AdminErrorBoundary>
                        <Outlet />
                    </AdminErrorBoundary>
                </main>
            </div>
        </div>
    );
}
