/**
 * Shared Wishlist page component that displays another user's public wishlists.
 * Provides a read-only view of items and allows for social interaction.
 */
import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import WishlistCard from "../components/WishlistCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { WishlistCardSkeleton } from "../components/WishlistCardSkeleton";
import { AppSidebar } from "../components/AppSidebar";
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Share2, Lock, UserPlus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useWishlistData, useFilteredItems } from "../hooks/useWishlistData";
import { useWishlistSettingsReadOnly } from "../hooks/useWishlistSettings";
import { useProfile } from "../hooks/useProfile";
import { useFriends } from "../hooks/useFriends";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import ShareModal from '../components/ShareModal';
import { getFirstName, getPossessiveName } from "../utils/nameUtils";
import type { WishlistItem, Profile } from "../types";
import "../App.css";

function SharedWishlist() {
    const { userId } = useParams<{ userId: string }>();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const initialCategoryId = searchParams.get('category');

    const { allItems, categories, loading: dataLoading } = useWishlistData(userId || null, { includeClaims: true });
    const { isPublic } = useWishlistSettingsReadOnly(userId || null);

    const { data: profile, isLoading: profileLoading } = useProfile(userId || null);
    const { follow, isFollowing: checkFollowing, isFollowLoading, loading: friendsLoading } = useFriends(user?.id);

    const isFollowing = userId ? checkFollowing(userId) : false;

    const [activeCategory, setActiveCategory] = useState<string | null>(initialCategoryId);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const handleFollow = async () => {
        if (!user || !userId) return;
        try {
            await follow(userId);
            toast.success(`You are now following ${profile?.first_name || 'this user'}!`);
        } catch (err: any) {
            // Error handled by hook toast
        }
    };

    useEffect(() => {
        // If we have an initial category ID from the URL, use it.
        if (initialCategoryId && categories.length > 0) {
            const exists = categories.some(cat => cat.id === initialCategoryId);
            if (exists) {
                setActiveCategory(initialCategoryId);
                return;
            }
        }

        if (categories.length > 0 && activeCategory === null && !isPublic) {
            const firstPublicCategory = categories.find((cat) => cat.is_public);
            if (firstPublicCategory) {
                setActiveCategory(firstPublicCategory.id);
            }
        }
    }, [categories, activeCategory, isPublic, initialCategoryId]);

    const wishlistItems = useFilteredItems(
        allItems as WishlistItem[],
        activeCategory
    );

    const firstName = getFirstName(profile);
    const sidebarTitle = firstName
        ? `${getPossessiveName(firstName)} Wishlists`
        : "Wishlists";
    const title = firstName
        ? `${getPossessiveName(firstName)} Wishlist`
        : "Wishlist";

    // Find active category name for title
    const activeCategoryName = categories.find((c) => c.id === activeCategory)?.name;

    const loading = profileLoading || dataLoading || friendsLoading;

    if (!loading && !profile)
        return (
            <div className="app-content">
                <EmptyState
                    title="Oops!"
                    message="Could not load wishlist. It might be private or the user doesn't exist."
                    action={{ text: "Go Back to Find Users", to: "/find-users" }}
                />
            </div>
        );

    return (
        <SidebarProvider className="min-h-0 h-[calc(100vh-64px)]">
            <AppSidebar
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                categories={isFollowing ? (categories as any) : []}
                title={sidebarTitle}
                showCreateCategory={false}
                showAllItems={isFollowing && isPublic}
                loading={loading || dataLoading}
            />
            <SidebarInset className="flex flex-col bg-background overflow-hidden">
                <header className="flex h-14 md:h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b px-4 bg-background">
                    <div className="flex items-center gap-2 w-full">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col">
                                {loading ? (
                                    <>
                                        <Skeleton className="h-4 w-[150px] mb-2" />
                                        <Skeleton className="h-3 w-[100px]" />
                                    </>
                                ) : (
                                    <>
                                        <h1 className="text-lg font-semibold leading-none">
                                            {!isFollowing
                                                ? title // Generic title when not following
                                                : activeCategory
                                                    ? `${activeCategoryName} Wishlist`
                                                    : title}
                                        </h1>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-xs text-muted-foreground whitespace-nowrap">
                                                {!isFollowing
                                                    ? "Follow to view wishlist"
                                                    : activeCategory
                                                        ? `Viewing items in ${activeCategoryName}`
                                                        : "All Public Items"}
                                            </p>
                                            {activeCategory && isFollowing && (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="h-7 px-2 sm:px-3 text-[10px] uppercase tracking-wider font-bold bg-primary/10 hover:bg-primary/20 text-primary border-none gap-1.5 rounded-lg active:scale-95 transition-all"
                                                    onClick={() => setIsShareModalOpen(true)}
                                                >
                                                    <Share2 className="size-3" />
                                                    <span className="hidden sm:inline">Share List</span>
                                                </Button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto relative">
                    {/* Follow Gate */}
                    {!loading && !isFollowing && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-background/60 backdrop-blur-md">
                            <div className="bg-card border-2 border-primary/20 p-8 rounded-[32px] shadow-2xl text-center max-w-sm w-full animate-in fade-in zoom-in duration-300">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
                                    <Lock className="size-8" />
                                </div>
                                <h2 className="text-2xl font-bold mb-3">Wishlist is Restricted</h2>
                                <p className="text-muted-foreground mb-8 text-balance">
                                    You need to follow <strong>{firstName}</strong> to view their wishlist and celebrate together!
                                </p>
                                <Button
                                    className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all gap-2 rounded-2xl"
                                    onClick={handleFollow}
                                    disabled={isFollowLoading}
                                >
                                    {isFollowLoading ? 'Following...' : (
                                        <>
                                            <UserPlus className="size-5" />
                                            Follow to View
                                        </>
                                    )}
                                </Button>
                                <p className="mt-6 text-xs text-muted-foreground">
                                    Following helps you stay updated with their gift ideas!
                                </p>
                            </div>
                        </div>
                    )}

                    <div className={`flex flex-col gap-4 p-4 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 duration-500 ${!isFollowing && !loading ? 'blur-sm grayscale opacity-30 select-none pointer-events-none' : ''}`}>
                        <div className="cards-grid">
                            {(loading || dataLoading) ? (
                                // Show skeleton loading state
                                Array.from({ length: 6 }).map((_, i) => (
                                    <WishlistCardSkeleton key={i} />
                                ))
                            ) : wishlistItems.length === 0 ? (
                                <div style={{ gridColumn: "1 / -1" }}>
                                    <EmptyState
                                        message={
                                            activeCategory === null
                                                ? isPublic
                                                    ? "No items in this wishlist."
                                                    : "This wishlist is private."
                                                : "No items in this category."
                                        }
                                    />
                                </div>
                            ) : (
                                wishlistItems.map((item) => (
                                    <WishlistCard key={item.id} item={item} readOnly={true} />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </SidebarInset>

            {activeCategory && (
                <ShareModal
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    categoryId={activeCategory}
                    categoryName={activeCategoryName || ''}
                    ownerName={firstName || 'User'}
                />
            )}
        </SidebarProvider>
    );
}

export default SharedWishlist;
