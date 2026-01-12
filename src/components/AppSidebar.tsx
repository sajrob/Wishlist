import * as React from "react";
import {
  Home,
  Heart,
  User,
  Users,
  Search,
  Bell,
  LogOut,
  Plus,
  Package,
  ChevronRight,
} from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { getUserPossessiveTitle, getInitials } from "@/utils/nameUtils";
import type { Category } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AppSidebarProps {
  activeCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  onCreateCategory?: () => void;
  categories: Category[];
  title?: string;
  showCreateCategory?: boolean;
  showAllItems?: boolean;
}

export function AppSidebar({
  activeCategory,
  onCategoryChange,
  onCreateCategory,
  categories,
  title,
  showCreateCategory = true,
  showAllItems = true,
}: AppSidebarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { setOpen, isMobile } = useSidebar();

  const handleNavClick = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const userInitials = React.useMemo(() => {
    if (!user) return "U";
    const meta = user.user_metadata || {};
    const fullName =
      (meta as any).full_name ||
      `${(meta as any).first_name || ""} ${(meta as any).last_name || ""
        }`.trim();
    return getInitials(fullName || user.email || "User");
  }, [user]);

  const userName = React.useMemo(() => {
    if (!user) return "User";
    const meta = user.user_metadata || {};
    return (
      (meta as any).full_name ||
      `${(meta as any).first_name || ""} ${(meta as any).last_name || ""
        }`.trim() ||
      user.email?.split("@")[0] ||
      "User"
    );
  }, [user]);

  const userEmail = user?.email || "";

  const navItems = [
    {
      title: "Friends",
      icon: Users,
      url: "/friends-wishlists",
      active: location.pathname === "/friends-wishlists",
    },
    {
      title: "Find Friends",
      icon: Search,
      url: "/find-users",
      active: location.pathname === "/find-users",
    },
    {
      title: "Groups",
      icon: Users,
      url: "/groups",
      active: location.pathname === "/groups",
    },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Heart className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Wishlist</span>
                  <span className="truncate text-xs">Your wishlists</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible asChild defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={title || getUserPossessiveTitle(
                        user,
                        "Wishlists",
                        "My Wishlists"
                      )}
                    >
                      <Home />
                      <Link
                        to="/dashboard"
                        onClick={() => {
                          onCategoryChange(null);
                          handleNavClick();
                        }}
                      >
                        <span>
                          {title || getUserPossessiveTitle(
                            user,
                            "Wishlists",
                            "My Wishlists"
                          )}
                        </span>
                      </Link>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {showAllItems && (
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            onClick={() => {
                              onCategoryChange(null);
                              handleNavClick();
                            }}
                            isActive={activeCategory === null}
                          >
                            <Package />
                            <span>All Items</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )}
                      {categories.map((category) => (
                        <SidebarMenuSubItem key={category.id}>
                          <SidebarMenuSubButton
                            onClick={() => {
                              onCategoryChange(category.id);
                              handleNavClick();
                            }}
                            isActive={activeCategory === category.id}
                          >
                            <Package className="size-4" />
                            <span>{category.name}</span>
                            {category.is_public && (
                              <span className="ml-auto text-xs opacity-70">
                                🌍
                              </span>
                            )}
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                      {showCreateCategory && onCreateCategory && (
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton onClick={onCreateCategory}>
                            <Plus />
                            <span>New Wishlist</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.active}
                    tooltip={item.title}
                  >
                    <Link to={item.url} onClick={handleNavClick}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={user?.user_metadata?.avatar_url}
                      alt={userName}
                    />
                    <AvatarFallback className="rounded-lg">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{userName}</span>
                    <span className="truncate text-xs">{userEmail}</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={user?.user_metadata?.avatar_url}
                        alt={userName}
                      />
                      <AvatarFallback className="rounded-lg">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{userName}</span>
                      <span className="truncate text-xs">{userEmail}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/notifications")}>
                  <Bell />
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
