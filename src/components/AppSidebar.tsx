import { Home, Users, UserPlus, User, Bell, LogOut, Gift, Plus, Package, Settings, ChevronRight } from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWishlistData } from "../hooks/useWishlistData";
import { getUserPossessiveTitle } from "../utils/nameUtils";
import { useEffect } from "react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarSeparator,
} from "@/components/ui/sidebar";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function AppSidebar() {
    const { user, signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const activeCategory = searchParams.get('category');
    const { categories, refetch } = useWishlistData(user?.id || null);

    useEffect(() => {
        // Refetch categories when we navigate (e.g., after creating a new category)
        if (user?.id) {
            refetch();
        }
    }, [location.pathname, user?.id]);

    const handleLogout = async () => {
        await signOut();
        navigate("/");
    };

    if (!user) return null;

    const possessiveTitle = getUserPossessiveTitle(user);

    return (
        <Sidebar collapsible="icon">
            {/* Header with App Logo */}
            <SidebarHeader className="flex items-center justify-center pt-6 pb-2">
                <Link to="/dashboard" className="flex items-center gap-3 transition-all hover:opacity-80">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Gift className="size-5" />
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
                        <span className="font-bold text-lg">Wishlist</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Dashboard</span>
                    </div>
                </Link>
            </SidebarHeader>

            <SidebarContent className="px-2">
                {/* Primary Navigation / Wishlists merged into Application group */}
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <Collapsible asChild defaultOpen className="group/collapsible">
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            isActive={location.pathname === "/dashboard" && !activeCategory}
                                            tooltip="My Wishlists"
                                        >
                                            <Home className="size-4" />
                                            <span className="font-semibold">My Wishlists</span>
                                            <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton
                                                    asChild
                                                    isActive={location.pathname === "/dashboard" && activeCategory === null}
                                                >
                                                    <Link to="/dashboard">
                                                        <span>All Items</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>

                                            {categories.length > 0 && categories.map((category) => (
                                                <SidebarMenuSubItem key={category.id}>
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={activeCategory === category.id}
                                                    >
                                                        <Link to={`/dashboard?category=${category.id}`}>
                                                            <span className="truncate">{category.name}</span>
                                                            <span className="ml-auto opacity-50 text-[10px]">
                                                                {category.is_public ? "🌍" : "🔒"}
                                                            </span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}

                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton
                                                    className="text-primary hover:text-primary"
                                                    onClick={() => {
                                                        const params = new URLSearchParams(searchParams);
                                                        params.set('action', 'new-category');
                                                        navigate(`/dashboard?${params.toString()}`);
                                                    }}
                                                >
                                                    <Plus className="size-3 mr-1" />
                                                    <span>Create New Wishlist</span>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={location.pathname === "/notifications"}
                                    tooltip="Notifications"
                                >
                                    <Link to="/notifications">
                                        <Bell className="size-4" />
                                        <span>Notifications</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>


                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator className="mx-2" />

                {/* Social Section */}
                <SidebarGroup>
                    <SidebarGroupLabel>Community</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={location.pathname === "/friends-wishlists"}
                                    tooltip="Friends"
                                >
                                    <Link to="/friends-wishlists">
                                        <Users className="size-4" />
                                        <span>Friends</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={location.pathname === "/find-users"}
                                    tooltip="Find Friends"
                                >
                                    <Link to="/find-users">
                                        <UserPlus className="size-4" />
                                        <span>Find Friends</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4 border-t bg-muted/20">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <Collapsible className="group/user">
                            <SidebarMenuButton
                                asChild
                                isActive={location.pathname === "/profile"}
                                tooltip="Profile"
                                className="h-12 border border-transparent hover:border-border transition-all"
                            >
                                <Link to="/profile">
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <User className="size-4" />
                                    </div>
                                    <div className="flex flex-col gap-0.5 overflow-hidden group-data-[collapsible=icon]:hidden">
                                        <span className="text-sm font-bold truncate">My Profile</span>
                                        <span className="text-[10px] text-muted-foreground truncate">{user.email}</span>
                                    </div>
                                </Link>
                            </SidebarMenuButton>
                        </Collapsible>
                    </SidebarMenuItem>

                    <SidebarMenuItem className="mt-2">
                        <SidebarMenuButton
                            onClick={handleLogout}
                            tooltip="Sign Out"
                            className="text-destructive hover:bg-destructive/5 hover:text-destructive"
                        >
                            <LogOut className="size-4" />
                            <span className="font-medium group-data-[collapsible=icon]:hidden">Sign Out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
