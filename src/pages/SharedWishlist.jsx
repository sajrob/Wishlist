import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import WishlistCard from "../components/WishlistCard";
import CategoryNav from "../components/CategoryNav";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { useWishlistData, useFilteredItems } from "../hooks/useWishlistData";
import { useWishlistSettingsReadOnly } from "../hooks/useWishlistSettings";
import { fetchProfile } from "../utils/supabaseHelpers";
import { getFirstName, getPossessiveName } from "../utils/nameUtils";
import "../App.css";

function SharedWishlist() {
    const { userId } = useParams();

    // Use custom hooks for data management
    const { allItems, categories, loading } = useWishlistData(userId);
    const { isPublic } = useWishlistSettingsReadOnly(userId);

    // Local state
    const [activeCategory, setActiveCategory] = useState(null);
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);

    // Fetch user profile
    useEffect(() => {
        if (!userId) return;

        const loadProfile = async () => {
            const { data, error: profileError } = await fetchProfile(userId);
            if (profileError) {
                console.error("Error fetching profile:", profileError);
                setError("Could not load wishlist. You might not be friends with this user.");
            } else {
                setProfile(data);
            }
        };

        loadProfile();
    }, [userId]);

    // Set first public category as active when categories load
    useEffect(() => {
        if (categories.length > 0 && activeCategory === null) {
            const firstPublicCategory = categories.find(cat => cat.is_public);
            if (firstPublicCategory) {
                setActiveCategory(firstPublicCategory.id);
            }
        }
    }, [categories, activeCategory]);

    // Filter items based on active category
    const wishlistItems = useFilteredItems(allItems, activeCategory);

    // Generate title using name utilities
    const firstName = getFirstName(profile);
    const title = firstName ? `${getPossessiveName(firstName)} Wishlist` : "Wishlist";

    // Handle loading state
    if (loading) return <LoadingSpinner />;

    // Handle error state
    if (error) return (
        <div className="app-content">
            <EmptyState
                title="Oops!"
                message={error}
                action={{ text: "Go Back to Find Users", to: "/find-users" }}
            />
        </div>
    );

    return (
        <div className="app">
            <div className="app-content">
                <header className="app-header">
                    <div className="header-top">
                        <Link to="/find-users" className="back-link" style={{ marginRight: '1rem', textDecoration: 'none', fontSize: '1.5rem' }}>
                            ←
                        </Link>
                        <h1>{title}</h1>
                    </div>
                    {/* No Add buttons here */}

                    <CategoryNav
                        categories={categories}
                        activeCategory={activeCategory}
                        onCategoryChange={setActiveCategory}
                        showActions={false}
                        showAllTab={false}
                    />
                </header>
                <main className="app-main">
                    <div className="content-container">
                        <div className="cards-container">
                            {wishlistItems.length === 0 ? (
                                <EmptyState
                                    message={activeCategory === null
                                        ? (isPublic ? "No items in this wishlist." : "This wishlist is private.")
                                        : "No items in this category."}
                                />
                            ) : (
                                wishlistItems.map((item) => (
                                    <WishlistCard
                                        key={item.id}
                                        item={item}
                                        readOnly={true} // We need to update WishlistCard to handle readOnly prop to hide Edit/Delete
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default SharedWishlist;
