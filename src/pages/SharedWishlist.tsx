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
import type { Category, WishlistItem } from '../types';
import '../App.css';

function SharedWishlist() {
    const { userId } = useParams<{ userId: string }>();

    const { allItems, categories, loading } = useWishlistData(userId || null);
    const { isPublic } = useWishlistSettingsReadOnly(userId || null);

    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [profile, setProfile] = useState<any>(null);
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

    if (loading) return <LoadingSpinner />;

    if (error)
        return (
            <div className="app-content">
                <EmptyState title="Oops!" message={error} action={{ text: 'Go Back to Find Users', to: '/find-users' }} />
            </div>
        );

    return (
        <div className="app">
            <div className="app-content">
                <header className="app-header">
                    <div className="header-top">
                        <Link
                            to="/find-users"
                            className="back-link"
                            style={{ marginRight: '1rem', textDecoration: 'none', fontSize: '1.5rem' }}
                        >
                            ←
                        </Link>
                        <h1>{title}</h1>
                    </div>

                    <CategoryNav
                        categories={categories as Category[]}
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
                                    message={
                                        activeCategory === null
                                            ? isPublic
                                                ? 'No items in this wishlist.'
                                                : 'This wishlist is private.'
                                            : 'No items in this category.'
                                    }
                                />
                            ) : (
                                wishlistItems.map(item => (
                                    <WishlistCard key={item.id} item={item} readOnly={true} />
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


