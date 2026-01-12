import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import WishlistCard from "../components/WishlistCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { AppSidebar } from "../components/AppSidebar";
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useWishlistData, useFilteredItems } from "../hooks/useWishlistData";
import { useWishlistSettingsReadOnly } from "../hooks/useWishlistSettings";
import { fetchProfile } from "../utils/supabaseHelpers";
import { getFirstName, getPossessiveName } from "../utils/nameUtils";
import type { WishlistItem, Profile } from "../types";
import "../App.css";

function SharedWishlist() {
    const { userId } = useParams<{ userId: string }>();

    const { allItems, categories, loading } = useWishlistData(userId || null);
    const { isPublic } = useWishlistSettingsReadOnly(userId || null);

    const [activeCategory, setActiveCategory] = useState<string | null>(null);
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
        if (categories.length > 0 && activeCategory === null && !isPublic) {
            const firstPublicCategory = categories.find((cat) => cat.is_public);
            if (firstPublicCategory) {
                setActiveCategory(firstPublicCategory.id);
            }
        }
    }, [categories, activeCategory, isPublic]);

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

    if (loading)
        return (
            <div className="flex-center" style={{ height: "80vh" }}>
                <LoadingSpinner />
            </div>
        );

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
                                <h1 className="text-lg font-semibold leading-none">
                                    {activeCategory
                                        ? `${activeCategoryName} Wishlist`
                                        : title}
                                </h1>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {activeCategory
                                        ? `Viewing items in ${activeCategoryName}`
                                        : "All Public Items"}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto">
                    <div className="flex flex-col gap-4 p-4">
                        <div className="cards-grid">
                            {wishlistItems.length === 0 ? (
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
        </SidebarProvider>
    );
}

export default SharedWishlist;
