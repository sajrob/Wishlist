import React, { useState } from "react";
import WishlistCard from "../components/WishlistCard";
import WishlistForm from "../components/WishlistForm";
import CreateCategoryModal from "../components/CreateCategoryModal";
import CategoryNav from "../components/CategoryNav";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { useWishlistData, useFilteredItems } from "../hooks/useWishlistData";
import { useCategories } from "../hooks/useCategories";
import { useWishlistSettings } from "../hooks/useWishlistSettings";
import { createItem, updateItem, deleteItem } from "../utils/supabaseHelpers";
import { getUserPossessiveTitle } from "../utils/nameUtils";
import "../App.css";

function Home() {
    const { user } = useAuth();

    // Use custom hooks for data management
    const { allItems, categories, loading, setAllItems, setCategories, refetch } = useWishlistData(user?.id);
    const { isPublic, togglePublic } = useWishlistSettings(user?.id);
    const { createCategory, updateCategory, deleteCategory, toggleCategoryPrivacy } = useCategories(user?.id);

    // UI state
    const [activeCategory, setActiveCategory] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);

    // Filter items based on active category
    const wishlistItems = useFilteredItems(allItems, activeCategory);

    const handleTogglePublic = async (e) => {
        await togglePublic();
    };

    const handleAddItem = async (newItem) => {
        if (!user) return;

        const itemData = {
            user_id: user.id,
            category_id: activeCategory,
            name: newItem.name,
            price: parseFloat(newItem.price) || 0,
            description: newItem.description,
            image_url: newItem.image_url,
            buy_link: newItem.buy_link
        };

        const { data, error } = await createItem(itemData);

        if (error) {
            alert('Error adding item');
            return;
        }

        setAllItems((prev) => [data, ...prev]);
        setIsFormOpen(false);
    };

    const handleEditItem = (item) => {
        setEditingItem(item);
        setIsFormOpen(true);
    };

    const handleUpdateItem = async (formData) => {
        if (!editingItem) return;

        const updates = {
            name: formData.name,
            price: parseFloat(formData.price) || 0,
            description: formData.description,
            image_url: formData.image_url,
            buy_link: formData.buy_link
        };

        const { data, error } = await updateItem(editingItem.id, updates);

        if (error) {
            alert('Error updating item');
            return;
        }

        setAllItems((prev) =>
            prev.map((item) => (item.id === editingItem.id ? data : item))
        );
        setIsFormOpen(false);
        setEditingItem(null);
    };

    const handleDeleteItem = async (itemId) => {
        if (!window.confirm("Delete this item?")) return;

        const { error } = await deleteItem(itemId);

        if (error) {
            alert('Error deleting item');
            return;
        }

        setAllItems(prev => prev.filter(item => item.id !== itemId));
    };

    const handleCreateCategory = async (categoryData) => {
        const { data, error } = await createCategory(categoryData);

        if (error) {
            alert('Error creating category');
            return;
        }

        // Refresh data and set new category as active
        await refetch();
        if (data) {
            setActiveCategory(data.id);
        }
        setIsCategoryModalOpen(false);
    };

    const handleUpdateCategory = async (categoryData) => {
        const { error } = await updateCategory(categoryData.id, categoryData);

        if (error) {
            alert('Error updating category');
            return;
        }

        await refetch();
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
    };

    const handleDeleteCategory = async (categoryId) => {
        if (!window.confirm("Delete this category? Items will be uncategorized.")) return;

        const { error } = await deleteCategory(categoryId);

        if (error) {
            alert('Error deleting category: ' + (error.message || 'Unknown error'));
            return;
        }

        // Update local state
        setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
        setAllItems((prev) => prev.map(item =>
            item.category_id === categoryId ? { ...item, category_id: null } : item
        ));

        if (activeCategory === categoryId) {
            setActiveCategory(null);
        }
    };

    const handleToggleCategoryPrivacy = async (categoryId, currentIsPublic) => {
        const { data, error } = await toggleCategoryPrivacy(categoryId, currentIsPublic);

        if (error) {
            alert('Failed to update category privacy');
            return;
        }

        // Optimistically update local state
        if (data) {
            setCategories(prev =>
                prev.map(cat =>
                    cat.id === categoryId ? { ...cat, is_public: data.is_public } : cat
                )
            );
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

    if (loading && !user) return <LoadingSpinner />;

    return (
        <div className="app">
            <div className={isModalOpen ? "app-content blurred" : "app-content"}>
                <header className="app-header">
                    <div className="header-top">
                        <h1>
                            {getUserPossessiveTitle(user)}
                        </h1>
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
                    <CategoryNav
                        categories={categories}
                        activeCategory={activeCategory}
                        onCategoryChange={setActiveCategory}
                        showActions={true}
                        onEdit={handleEditCategory}
                        onDelete={handleDeleteCategory}
                        onTogglePrivacy={handleToggleCategoryPrivacy}
                    />
                </header>
                <main className="app-main">
                    <div className="content-container">
                        <div className="cards-container">
                            {wishlistItems.length === 0 ? (
                                <EmptyState
                                    message={activeCategory === null
                                        ? "No items in your wishlist. Add some items!"
                                        : "No items in this category."}
                                />
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
