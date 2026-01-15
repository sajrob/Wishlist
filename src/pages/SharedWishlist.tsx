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
import { Share2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useWishlistData, useFilteredItems } from "../hooks/useWishlistData";
import { useWishlistSettingsReadOnly } from "../hooks/useWishlistSettings";
import { fetchProfile } from "../utils/supabaseHelpers";
import ShareModal from '../components/ShareModal';
import { getFirstName, getPossessiveName } from "../utils/nameUtils";
import type { WishlistItem, Profile } from "../types";
import "../App.css";

function SharedWishlist() {
    const { userId } = useParams<{ userId: string }>();
    const [searchParams] = useSearchParams();
    const initialCategoryId = searchParams.get('category');

    const { allItems, categories, loading } = useWishlistData(userId || null, { includeClaims: true });
    const { isPublic } = useWishlistSettingsReadOnly(userId || null);

    const [activeCategory, setActiveCategory] = useState<string | null>(initialCategoryId);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) return;

        const loadProfile = async () => {
            const { data, error: profileError } = await fetchProfile(userId);
            if (profileError) {
                console.error("Error fetching profile:", profileError);
                setError(
                    "Could not load wishlist. You might not be friends with this user."
                );
            } else {
                setProfile(data);
            }
        };

        void loadProfile();
    }, [userId]);

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

    if (error)
        return (
            <div className="app-content">
                <EmptyState
                    title="Oops!"
                    message={error}
                    action={{ text: "Go Back to Find Users", to: "/find-users" }}
                />
            </div>
        );

    return (
        <SidebarProvider className="min-h-0 h-[calc(100vh-64px)]">
            <AppSidebar
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                categories={categories as any}
                title={sidebarTitle}
                showCreateCategory={false}
                showAllItems={isPublic}
                loading={loading}
            />
            <SidebarInset className="flex flex-col bg-background overflow-hidden">
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b px-4 bg-background">
                    <div className="flex items-center gap-2">
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
                                        <div className="flex items-center justify-between gap-4">
                                            <h1 className="text-lg font-semibold leading-none">
                                                {activeCategory
                                                    ? `${activeCategoryName} Wishlist`
                                                    : title}
                                            </h1>
                                            {activeCategory && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setIsShareModalOpen(true)}
                                                    className="h-8 px-4 text-[10px] uppercase tracking-wider font-bold gap-2 rounded-full border-primary/20 bg-primary/5 text-primary hover:bg-[#2563eb] hover:text-white hover:border-[#2563eb] transition-all shadow-sm group"
                                                >
                                                    <Share2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                                    Share
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {activeCategory
                                                ? `Viewing items in ${activeCategoryName}`
                                                : "All Public Items"}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto">
                    <div className="flex flex-col gap-4 p-4">
                        <div className="cards-grid">
                            {loading ? (
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
