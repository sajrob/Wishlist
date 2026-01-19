/**
 * AppSidebar component that provides the main navigation for the application.
 * Includes links to wishlists, categories, social features, and user account settings.
 */
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
  Bug,
  LayoutDashboard,
  HelpCircle,
} from "lucide-react";
import { FeedbackDialog } from "./FeedbackDialog";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
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
import { supabase } from "@/supabaseClient";
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
import { SidebarCategorySkeleton } from "./SidebarCategorySkeleton";
import { Globe } from "lucide-react";

interface AppSidebarProps {
  activeCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  onCreateCategory?: () => void;
  categories: Category[];
  title?: string;
  showCreateCategory?: boolean;
  showAllItems?: boolean;
  loading?: boolean;
}

export function AppSidebar({
  activeCategory,
  onCategoryChange,
  onCreateCategory,
  categories,
  title,
  showCreateCategory = true,
  showAllItems = true,
  loading = false,
}: AppSidebarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { setOpen, isMobile } = useSidebar();
  const [unreadCount, setUnreadCount] = React.useState(0);

  const [username, setUsername] = React.useState<string>("");

  React.useEffect(() => {
    if (user) {
      // Set initial username from metadata if available
      const meta = user.user_metadata || {};
      if (meta.username) {
        setUsername(meta.username);
      }

      // Fetch latest username from profiles to be sure
      const fetchProfile = async () => {
        const { data } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();

        if (data?.username) {
          setUsername(data.username);
        }
      };

      void fetchProfile();
      void fetchUnreadCount();

      const subscription = supabase
        .channel("sidebar_notifications_count")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            void fetchUnreadCount();
          }
        )
        .subscribe();

      return () => {
        void subscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user) return;
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (!error) {
      setUnreadCount(count || 0);
    }
  };

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

  const displayHandle = username ? `@${username}` : user?.email || "";

  const navItems = [
    {
      title: "Friends",
      icon: User,
      url: "/friends",
      active: location.pathname === "/friends",
    },
    {
      title: "Find Friends",
      icon: Search,
      url: "/find-users",
      active: location.pathname === "/find-users",
    },
    //this is for the collaborative wishlist feature
    // {
    //   title: "Groups",
    //   icon: Users,
    //   url: "/groups",
    //   active: location.pathname === "/groups",
    // },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Wishlist">
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 group-data-[collapsible=icon]:size-4 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Heart className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">Wishlist</span>
                  <span className="truncate text-xs">Your wishlists</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="mt-4">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/dashboard" && activeCategory === null}
                  tooltip="Dashboard"
                >
                  <Link
                    to="/dashboard"
                    onClick={() => {
                      onCategoryChange(null);
                      handleNavClick();
                    }}
                  >
                    <LayoutDashboard />
                    <span className="group-data-[collapsible=icon]:hidden">
                      Dashboard
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <Collapsible asChild defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={title || getUserPossessiveTitle(
                        user,
                        "Wishlists",
                        "My Wishlists"
                      )}
                      onClick={() => {
                        onCategoryChange(null);
                      }}
                    >
                      <Home />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {title || getUserPossessiveTitle(
                          user,
                          "Wishlists",
                          "My Wishlists"
                        )}
                      </span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
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
                      {loading ? (
                        <SidebarCategorySkeleton count={3} />
                      ) : (
                        categories.map((category) => (
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
                                <span className="ml-auto text-xs opacity-70 text-emerald-700">
                                  <Globe className="size-3.5" />
                                </span>
                              )}
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))
                      )}
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
              <SidebarGroupLabel>Socials</SidebarGroupLabel>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.active}
                    tooltip={item.title}
                  >
                    <Link to={item.url} onClick={handleNavClick}>
                      <item.icon />
                      <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
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
            <FeedbackDialog
              trigger={
                <SidebarMenuButton tooltip="Report a Bug">
                  <Bug className="text-indigo-600" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Report a Bug
                  </span>
                </SidebarMenuButton>
              }
            />

          </SidebarMenuItem>

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
                  {unreadCount > 0 && (
                    <span className="absolute top-2 left-8 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                  )}
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold">{userName}</span>
                    <span className="truncate text-xs">{displayHandle}</span>
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
                      <span className="truncate text-xs">{displayHandle}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/notifications")} className="justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="size-4" />
                    <span>Notifications</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {unreadCount}
                    </span>
                  )}
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
