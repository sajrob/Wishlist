import React, { useState, useEffect } from "react";
import WishlistCard from "../components/WishlistCard";
import WishlistForm from "../components/WishlistForm";
import CreateCategoryModal from "../components/CreateCategoryModal";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import "../App.css";

function Home() {
    const { user } = useAuth();
    const [allItems, setAllItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: itemsData, error: itemsError } = await supabase
                .from('items')
                .select('*')
                .order('created_at', { ascending: false });

            const { data: catsData, error: catsError } = await supabase
                .from('categories')
                .select('*')
                .order('created_at', { ascending: true });

            if (itemsError) throw itemsError;
            if (catsError) throw catsError;

            setAllItems(itemsData || []);
            setCategories(catsData || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter items based on active category
    const wishlistItems = activeCategory === null
        ? allItems
        : allItems.filter((item) => item.category_id === activeCategory);

    const handleAddItem = async (newItem) => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('items')
                .insert([{
                    user_id: user.id,
                    category_id: activeCategory,
                    name: newItem.name,
                    price: parseFloat(newItem.price) || 0,
                    description: newItem.description,
                    image_url: newItem.image_url,
                    buy_link: newItem.buy_link
                }])
                .select()
                .single();

            if (error) throw error;

            setAllItems((prev) => [data, ...prev]);
            setIsFormOpen(false);
        } catch (error) {
            console.error('Error adding item:', error);
            alert('Error adding item');
        }
    };

    const handleEditItem = (item) => {
        setEditingItem(item);
        setIsFormOpen(true);
    };

    const handleUpdateItem = async (formData) => {
        if (!editingItem) return;

        try {
            const { data, error } = await supabase
                .from('items')
                .update({
                    name: formData.name,
                    price: parseFloat(formData.price) || 0,
                    description: formData.description,
                    image_url: formData.image_url,
                    buy_link: formData.buy_link
                })
                .eq('id', editingItem.id)
                .select()
                .single();

            if (error) throw error;

            setAllItems((prev) =>
                prev.map((item) => (item.id === editingItem.id ? data : item))
            );
            setIsFormOpen(false);
            setEditingItem(null);
        } catch (error) {
            console.error('Error updating item:', error);
            alert('Error updating item');
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (window.confirm("Delete this item?")) {
            try {
                const { error } = await supabase
                    .from('items')
                    .delete()
                    .eq('id', itemId);

                if (error) throw error;

                setAllItems(prev => prev.filter(item => item.id !== itemId));
            } catch (error) {
                console.error('Error deleting item:', error);
                alert('Error deleting item');
            }
        }
    };

    const handleCreateCategory = async (categoryData) => {
        if (!user) return;

        try {
            // 1. Create category
            const { data: newCategory, error: catError } = await supabase
                .from('categories')
                .insert([{
                    user_id: user.id,
                    name: categoryData.name
                }])
                .select()
                .single();

            if (catError) throw catError;

            // 2. Update items if any selected
            if (categoryData.itemIds && categoryData.itemIds.length > 0) {
                const { error: itemsError } = await supabase
                    .from('items')
                    .update({ category_id: newCategory.id })
                    .in('id', categoryData.itemIds);

                if (itemsError) throw itemsError;
            }

            // Refresh data to ensure consistency
            await fetchData();
            setActiveCategory(newCategory.id);
            setIsCategoryModalOpen(false);
        } catch (error) {
            console.error('Error creating category:', error);
            alert('Error creating category');
        }
    };

    const handleUpdateCategory = async (categoryData) => {
        try {
            // 1. Update category name
            const { error: catError } = await supabase
                .from('categories')
                .update({ name: categoryData.name })
                .eq('id', categoryData.id);

            if (catError) throw catError;

            // 2. Handle items
            // First, remove all items from this category
            const { error: clearError } = await supabase
                .from('items')
                .update({ category_id: null })
                .eq('category_id', categoryData.id);

            if (clearError) throw clearError;

            // Then add selected items to this category
            if (categoryData.itemIds && categoryData.itemIds.length > 0) {
                const { error: addError } = await supabase
                    .from('items')
                    .update({ category_id: categoryData.id })
                    .in('id', categoryData.itemIds);

                if (addError) throw addError;
            }

            await fetchData();
            setIsCategoryModalOpen(false);
            setEditingCategory(null);
        } catch (error) {
            console.error('Error updating category:', error);
            alert('Error updating category');
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        if (window.confirm("Delete this category? Items will be uncategorized.")) {
            try {
                // 1. Uncategorize items (Supabase might handle this with ON DELETE SET NULL if configured, 
                // but our schema didn't specify, so we do it manually or rely on RLS/FK behavior. 
                // Default FK behavior restricts delete if referenced. We should update items first.)

                const { error: itemsError } = await supabase
                    .from('items')
                    .update({ category_id: null })
                    .eq('category_id', categoryId);

                if (itemsError) throw itemsError;

                // 2. Delete category
                const { error: catError } = await supabase
                    .from('categories')
                    .delete()
                    .eq('id', categoryId);

                if (catError) throw catError;

                setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
                setAllItems((prev) => prev.map(item =>
                    item.category_id === categoryId ? { ...item, category_id: null } : item
                ));

                if (activeCategory === categoryId) {
                    setActiveCategory(null);
                }
            } catch (error) {
                console.error('Error deleting category:', error);
                alert('Error deleting category: ' + error.message);
            }
        }
    };

    const handleEditCategory = (category) => {
        const itemsInCategory = allItems
            .filter(item => item.category_id === category.id)
            .map(item => item.id);

        setEditingCategory({
            ...category,
            itemIds: itemsInCategory
        });
        setIsCategoryModalOpen(true);
    };

    const handleOpenForm = () => {
        setEditingItem(null);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingItem(null);
    };

    const handleOpenCategoryModal = () => {
        setEditingCategory(null);
        setIsCategoryModalOpen(true);
    };

    const handleCloseCategoryModal = () => {
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
    };

    const isModalOpen = isFormOpen || isCategoryModalOpen;

    if (loading && !user) return <div className="loading">Loading...</div>;

    return (
        <div className="app">
            <div className={isModalOpen ? "app-content blurred" : "app-content"}>
                <header className="app-header">
                    <div className="header-top">
                        <h1>{user?.user_metadata?.full_name ? `${user.user_metadata.full_name}'s Wishlist` : "My Wishlist"}</h1>
                    </div>
                    <div className="header-actions">
                        <button className="add-item-btn" onClick={handleOpenForm}>
                            Add New Wishlist Item
                        </button>
                        <button
                            className="create-category-btn"
                            onClick={handleOpenCategoryModal}
                        >
                            Create Wishlist Category
                        </button>
                    </div>
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
                                    {activeCategory === category.id && (
                                        <div className="category-actions">
                                            <button
                                                className="category-edit-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditCategory(category);
                                                }}
                                                title="Edit category"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="category-delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteCategory(category.id);
                                                }}
                                                title="Delete category"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    )}
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
                                            ? "No items in your wishlist. Add some items!"
                                            : "No items in this category."}
                                    </p>
                                </div>
                            ) : (
                                wishlistItems.map((item) => (
                                    <WishlistCard
                                        key={item.id}
                                        item={item}
                                        onEdit={() => handleEditItem(item)}
                                        onDelete={() => handleDeleteItem(item.id)}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </main>
            </div>
            {isFormOpen && (
                <div className="modal-overlay" onClick={handleCloseForm}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <WishlistForm
                            onSubmit={editingItem ? handleUpdateItem : handleAddItem}
                            onClose={handleCloseForm}
                            editingItem={editingItem}
                        />
                    </div>
                </div>
            )}
            {isCategoryModalOpen && (
                <div className="modal-overlay" onClick={handleCloseCategoryModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <CreateCategoryModal
                            items={allItems}
                            onClose={handleCloseCategoryModal}
                            onCreateCategory={handleCreateCategory}
                            onUpdateCategory={handleUpdateCategory}
                            editingCategory={editingCategory}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;
