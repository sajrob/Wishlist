import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import WishlistCard from "../components/WishlistCard";
import { supabase } from "../supabaseClient";
import "../App.css";

function SharedWishlist() {
    const { userId } = useParams();
    const [allItems, setAllItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (userId) {
            fetchProfile();
            fetchData();
        }
    }, [userId]);

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            setProfile(data);
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: itemsData, error: itemsError } = await supabase
                .from('items')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            const { data: catsData, error: catsError } = await supabase
                .from('categories')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: true });

            if (itemsError) throw itemsError;
            if (catsError) throw catsError;

            setAllItems(itemsData || []);
            setCategories(catsData || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError("Could not load wishlist. You might not be friends with this user.");
        } finally {
            setLoading(false);
        }
    };

    // Filter items based on active category
    const wishlistItems = activeCategory === null
        ? allItems
        : allItems.filter((item) => item.category_id === activeCategory);

    if (loading) return <div className="loading">Loading...</div>;

    if (error) return (
        <div className="app-content">
            <div className="error-container" style={{ textAlign: 'center', marginTop: '4rem' }}>
                <h2>Oops!</h2>
                <p>{error}</p>
                <Link to="/find-users" className="auth-button" style={{ display: 'inline-block', marginTop: '1rem', width: 'auto' }}>
                    Go Back to Find Users
                </Link>
            </div>
        </div>
    );

    const firstName = profile?.first_name || (profile?.full_name ? profile.full_name.split(' ')[0] : 'User');
    const title = profile
        ? `${firstName}${firstName.slice(-1).toLowerCase() === 's' ? "'" : "'s"} Wishlist`
        : "Wishlist";

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

                    {categories.length > 0 && (
                        <div className="categories-nav">
                            <button
                                className={`category-tab ${activeCategory === null ? "active" : ""}`}
                                onClick={() => setActiveCategory(null)}
                            >
                                All Items
                            </button>
                            {categories.map((category) => (
                                <div key={category.id} className="category-tab-wrapper">
                                    <button
                                        className={`category-tab ${activeCategory === category.id ? "active" : ""}`}
                                        onClick={() => setActiveCategory(category.id)}
                                    >
                                        {category.name}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </header>
                <main className="app-main">
                    <div className="content-container">
                        <div className="cards-container">
                            {wishlistItems.length === 0 ? (
                                <div className="empty-state">
                                    <p>
                                        {activeCategory === null
                                            ? "No publicly visible items in this wishlist."
                                            : "No items in this category."}
                                    </p>
                                </div>
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
