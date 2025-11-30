import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import WishlistCard from "../components/WishlistCard";
import WishlistForm from "../components/WishlistForm";
import CreateCategoryModal from "../components/CreateCategoryModal";
import { supabase } from "../supabaseClient";
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
    const [isLoading, setIsLoading] = useState(true);

    // Fetch data on load
    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setIsLoading(true);
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
            setIsLoading(false);
        }
    };

    // Filter items based on active category
    // Note: We are now using category_id on the item itself
    const wishlistItems = activeCategory === null
        ? allItems
        : allItems.filter((item) => item.category_id === activeCategory);

    const handleAddItem = async (newItem) => {
        console.log('Attempting to add item:', newItem);
        console.log('Current User ID:', user?.id);

        if (!user?.id) {
            console.error('No user ID found, cannot add item');
            alert('You must be logged in to add items');
            return;
        }

        try {
            const itemToInsert = {
                user_id: user.id,
                category_id: activeCategory, // Add to current category if selected
                name: newItem.name,
                price: parseFloat(newItem.price) || 0,
                description: newItem.description,
                image_url: newItem.imageUrl,
                buy_link: newItem.buyLink,
            };

            console.log('Payload to insert:', itemToInsert);

            const { data, error } = await supabase
                .from('items')
                .insert([itemToInsert])
                .select()
                .single();

            if (error) {
                console.error('Supabase insert error:', error);
                throw error;
            }

            console.log('Item added successfully:', data);

            setAllItems((prev) => [data, ...prev]);
            setIsFormOpen(false);
            setEditingItem(null);
        } catch (error) {
            console.error('Error adding item:', error);
            alert('Failed to add item: ' + error.message);
        }
    };

    const handleEditItem = (item) => {
        setEditingItem({
            ...item,
            imageUrl: item.image_url, // Map DB field to form field
            buyLink: item.buy_link
        });
        setIsFormOpen(true);
    };

    const handleUpdateItem = async (formData) => {
        try {
            const updates = {
                name: formData.name,
                price: parseFloat(formData.price),
                description: formData.description,
                image_url: formData.imageUrl,
                buy_link: formData.buyLink,
            };

            const { data, error } = await supabase
                .from('items')
                .update(updates)
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
            alert('Failed to update item');
        }
    };

    const handleCreateCategory = async (categoryData) => {
        try {
            // 1. Create Category
            const { data: newCategory, error: catError } = await supabase
                .from('categories')
                .insert([{
                    user_id: user.id,
                    name: categoryData.name
                }])
                .select()
                .single();

            if (catError) throw catError;

            // 2. Update items if any were selected
            if (categoryData.itemIds && categoryData.itemIds.length > 0) {
                const { error: itemsError } = await supabase
                    .from('items')
                    .update({ category_id: newCategory.id })
                    .in('id', categoryData.itemIds);

                if (itemsError) throw itemsError;

                // Refresh items to show new category association
                fetchData();
            } else {
                setCategories((prev) => [...prev, newCategory]);
                setActiveCategory(newCategory.id);
            }
        } catch (error) {
            console.error('Error creating category:', error);
            alert('Failed to create category');
        }
    };

    const handleUpdateCategory = async (categoryData) => {
        try {
            // 1. Update Category Name
            const { error: catError } = await supabase
                .from('categories')
                .update({ name: categoryData.name })
                .eq('id', categoryData.id);

            if (catError) throw catError;

            // 2. Update Items (Move them to this category)
            // Note: This simple implementation just moves selected items IN.
            // It doesn't move unselected items OUT because the modal UI implies "Select items to be in this category".
            // For a robust implementation, we might want to set category_id=null for items NOT in the list but currently in this category.
            // But for now, let's just move selected items IN.
            if (categoryData.itemIds && categoryData.itemIds.length > 0) {
                const { error: itemsError } = await supabase
                    .from('items')
                    .update({ category_id: categoryData.id })
                    .in('id', categoryData.itemIds);

                if (itemsError) throw itemsError;
                fetchData(); // Refresh all
            } else {
                setCategories((prev) =>
                    prev.map((cat) =>
                        cat.id === categoryData.id ? { ...cat, name: categoryData.name } : cat
                    )
                );
            }
            setEditingCategory(null);
        } catch (error) {
            console.error('Error updating category:', error);
            alert('Failed to update category');
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        if (window.confirm("Are you sure you want to delete this category? Items will be uncategorized.")) {
            try {
                // 1. Uncategorize items (Set category_id to null)
                const { error: itemsError } = await supabase
                    .from('items')
                    .update({ category_id: null })
                    .eq('category_id', categoryId);

                if (itemsError) throw itemsError;

                // 2. Delete Category
                const { error: catError } = await supabase
                    .from('categories')
                    .delete()
                    .eq('id', categoryId);

                if (catError) throw catError;

                setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
                if (activeCategory === categoryId) {
                    setActiveCategory(null);
                }
                // Update local items state to reflect null category
                setAllItems(prev => prev.map(item => item.category_id === categoryId ? { ...item, category_id: null } : item));

            } catch (error) {
                console.error('Error deleting category:', error);
                alert('Failed to delete category');
            }
        }
    };

    const handleEditCategory = (category) => {
        // Find items currently in this category for the modal
        const itemsInCategory = allItems
            .filter(item => item.category_id === category.id)
            .map(item => item.id);

        setEditingCategory({
            ...category,
            itemIds: itemsInCategory
        });
        setIsCategoryModalOpen(true);
    };

    const handleOpenCategoryModal = () => {
        setEditingCategory(null);
        setIsCategoryModalOpen(true);
    };

    const handleCloseCategoryModal = () => {
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
    };

    const handleOpenForm = () => {
        setEditingItem(null);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingItem(null);
    };

    const isModalOpen = isFormOpen || isCategoryModalOpen;

    return (
        <div className="app">
            <div className={isModalOpen ? "app-content blurred" : "app-content"}>
                <header className="app-header">
                    <div className="header-top">
                        <h1>My Wishlist</h1>
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
                                className={`category-tab ${activeCategory === null ? "active" : ""
                                    }`}
                                onClick={() => setActiveCategory(null)}
                            >
                                All Items
                            </button>
                            {categories.map((category) => (
                                <div key={category.id} className="category-tab-wrapper">
                                    <button
                                        className={`category-tab ${activeCategory === category.id ? "active" : ""
                                            }`}
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
                            {isLoading ? (
                                <div className="loading-state">Loading...</div>
                            ) : wishlistItems.length === 0 ? (
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
                                        item={{
                                            ...item,
                                            imageUrl: item.image_url, // Map DB field to component prop
                                            buyLink: item.buy_link
                                        }}
                                        onEdit={() => handleEditItem(item)}
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
                            editingItem={editingItem ? {
                                ...editingItem,
                                imageUrl: editingItem.image_url,
                                buyLink: editingItem.buy_link
                            } : null}
                        />
                    </div>
                </div>
            )}
            {isCategoryModalOpen && (
                <div className="modal-overlay" onClick={handleCloseCategoryModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <CreateCategoryModal
                            items={allItems} // Pass all items so user can select from them
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
