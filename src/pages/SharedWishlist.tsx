import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import WishlistCard from '../components/WishlistCard';
import CategoryNav from '../components/CategoryNav';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useWishlistData, useFilteredItems } from '../hooks/useWishlistData';
import { useWishlistSettingsReadOnly } from '../hooks/useWishlistSettings';
import { fetchProfile } from '../utils/supabaseHelpers';
import { getFirstName, getPossessiveName } from '../utils/nameUtils';
import type { Category, WishlistItem, Profile } from '../types';
import '../App.css';

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
                console.error('Error fetching profile:', profileError);
                setError('Could not load wishlist. You might not be friends with this user.');
            } else {
                setProfile(data);
            }
        };

        void loadProfile();
    }, [userId]);

    useEffect(() => {
        if (categories.length > 0 && activeCategory === null) {
            const firstPublicCategory = categories.find(cat => cat.is_public);
            if (firstPublicCategory) {
                setActiveCategory(firstPublicCategory.id);
            }
        }
    }, [categories, activeCategory]);

    const wishlistItems = useFilteredItems(allItems as WishlistItem[], activeCategory);

    const firstName = getFirstName(profile);
    const title = firstName ? `${getPossessiveName(firstName)} Wishlist` : 'Wishlist';

    // Find active category name for subtitle
    const activeCategoryName = categories.find(c => c.id === activeCategory)?.name;

    if (loading) return <div className="flex-center" style={{ height: '80vh' }}><LoadingSpinner /></div>;

    if (error)
        return (
            <div className="app-content">
                <EmptyState title="Oops!" message={error} action={{ text: 'Go Back to Find Users', to: '/find-users' }} />
            </div>
        );

    return (
        <div className="app-content">
            <div className="p-6 max-w-[1200px] mx-auto w-full">
                <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 items-start">
                    {/* Sidebar for this specific user's categories */}
                    <aside className="dashboard-sidebar">
                        <div className="sidebar-sticky">
                            <div className="sidebar-section">
                                <Link to="/friends-wishlists" className="btn btn-secondary w-full" style={{ marginBottom: '1.5rem', justifyContent: 'flex-start' }}>
                                    ← Back to Friends
                                </Link>

                                <h2>Categories</h2>
                                <CategoryNav
                                    categories={categories as Category[]}
                                    activeCategory={activeCategory}
                                    onCategoryChange={setActiveCategory}
                                    showActions={false}
                                    showAllTab={false}
                                />
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="dashboard-main">
                        <header className="page-header">
                            <div className="page-title">
                                <h1>{title}</h1>
                                <p className="page-subtitle">
                                    {activeCategory
                                        ? `Viewing ${activeCategoryName}`
                                        : 'All Public Items'}
                                </p>
                            </div>
                        </header>

                        {/* Grid */}
                        <div className="cards-grid">
                            {wishlistItems.length === 0 ? (
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <EmptyState
                                        message={
                                            activeCategory === null
                                                ? isPublic
                                                    ? 'No items in this wishlist.'
                                                    : 'This wishlist is private.'
                                                : 'No items in this category.'
                                        }
                                    />
                                </div>
                            ) : (
                                wishlistItems.map(item => (
                                    <WishlistCard key={item.id} item={item} readOnly={true} />
                                ))
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

export default SharedWishlist;
