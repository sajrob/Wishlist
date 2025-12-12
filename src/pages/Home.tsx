import React, { useState } from 'react';
import WishlistCard from '../components/WishlistCard';
import WishlistForm from '../components/WishlistForm';
import CreateCategoryModal from '../components/CreateCategoryModal';
import CategoryNav from '../components/CategoryNav';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useWishlistData, useFilteredItems } from '../hooks/useWishlistData';
import { useCategories } from '../hooks/useCategories';
import { useWishlistSettings } from '../hooks/useWishlistSettings';
import { createItem, updateItem, deleteItem } from '../utils/supabaseHelpers';
import { getUserPossessiveTitle } from '../utils/nameUtils';
import type { Category, WishlistItem, ItemFormData } from '../types';
import '../App.css';

function Home() {
    const { user } = useAuth();

    const { allItems, categories, loading, setAllItems, setCategories, refetch } = useWishlistData(user?.id || null);
    const { isPublic, togglePublic } = useWishlistSettings(user?.id || null);
    const { createCategory, updateCategory, deleteCategory, toggleCategoryPrivacy } = useCategories(user?.id || '');

    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
    const [editingCategory, setEditingCategory] = useState<(Category & { itemIds?: string[] }) | null>(null);

    const wishlistItems = useFilteredItems(allItems, activeCategory);

    const handleTogglePublic = async () => {
        await togglePublic();
    };

    const handleAddItem = async (newItem: ItemFormData) => {
        if (!user) return;

        const itemData = {
            user_id: user.id,
            category_id: activeCategory,
            name: newItem.name,
            price: parseFloat(newItem.price as string) || 0,
            description: newItem.description,
            image_url: newItem.image_url,
            buy_link: newItem.buy_link,
        };

        const { data, error } = await createItem(itemData);

        if (error) {
            alert('Error adding item');
            return;
        }

        setAllItems(prev => (data ? [data, ...prev] : prev));
        setIsFormOpen(false);
    };

    const handleEditItem = (item: WishlistItem) => {
        setEditingItem(item);
        setIsFormOpen(true);
    };

    const handleUpdateItem = async (formData: ItemFormData) => {
        if (!editingItem) return;

        const updates = {
            name: formData.name,
            price: parseFloat(formData.price as string) || 0,
            description: formData.description,
            image_url: formData.image_url,
            buy_link: formData.buy_link,
        };

        const { data, error } = await updateItem(editingItem.id, updates);

        if (error) {
            alert('Error updating item');
            return;
        }

        setAllItems(prev => prev.map(item => (item.id === editingItem.id && data ? data : item)));
        setIsFormOpen(false);
        setEditingItem(null);
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!window.confirm('Delete this item?')) return;

        const { error } = await deleteItem(itemId);

        if (error) {
            alert('Error deleting item');
            return;
        }

        setAllItems(prev => prev.filter(item => item.id !== itemId));
    };

    const handleCreateCategory = async (categoryData: { name: string; itemIds?: string[]; is_public: boolean }) => {
        const { data, error } = await createCategory(categoryData as any);

        if (error) {
            alert('Error creating category');
            return;
        }

        await refetch();
        if (data) {
            setActiveCategory(data.id);
        }
        setIsCategoryModalOpen(false);
    };

    const handleUpdateCategory = async (categoryData: any) => {
        const { error } = await updateCategory(categoryData.id, categoryData);

        if (error) {
            alert('Error updating category');
            return;
        }

        await refetch();
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
    };

    const handleDeleteCategory = async (categoryId: string) => {
        if (!window.confirm('Delete this category? Items will be uncategorized.')) return;

        const { error } = await deleteCategory(categoryId);

        if (error) {
            alert('Error deleting category: ' + (error.message || 'Unknown error'));
            return;
        }

        setCategories(prev => prev.filter(cat => cat.id !== categoryId));
        setAllItems(prev => prev.map(item => (item.category_id === categoryId ? { ...item, category_id: null } : item)));

        if (activeCategory === categoryId) {
            setActiveCategory(null);
        }
    };

    const handleToggleCategoryPrivacy = async (categoryId: string, currentIsPublic: boolean) => {
        const { data, error } = await toggleCategoryPrivacy(categoryId, currentIsPublic);

        if (error) {
            alert('Failed to update category privacy');
            return;
        }

        if (data) {
            setCategories(prev =>
                prev.map(cat => (cat.id === categoryId ? { ...cat, is_public: data.is_public } : cat)),
            );
        }
    };

    const handleEditCategory = (category: Category) => {
        const itemsInCategory = allItems.filter(item => item.category_id === category.id).map(item => item.id);

        setEditingCategory({
            ...category,
            itemIds: itemsInCategory,
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
            <div className={isModalOpen ? 'app-content blurred' : 'app-content'}>
                <header className="app-header">
                    <div className="header-top">
                        <h1>{getUserPossessiveTitle(user)}</h1>
                    </div>
                    <div className="header-actions">
                        <button className="add-item-btn" onClick={handleOpenForm}>
                            Add New Wishlist Item
                        </button>
                        <button className="create-category-btn" onClick={handleOpenCategoryModal}>
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
                                    message={
                                        activeCategory === null
                                            ? 'No items in your wishlist. Add some items!'
                                            : 'No items in this category.'
                                    }
                                />
                            ) : (
                                wishlistItems.map(item => (
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
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <WishlistForm
                            onSubmit={editingItem ? handleUpdateItem : handleAddItem}
                            onClose={handleCloseForm}
                            editingItem={editingItem || undefined}
                        />
                    </div>
                </div>
            )}
            {isCategoryModalOpen && (
                <div className="modal-overlay" onClick={handleCloseCategoryModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <CreateCategoryModal
                            items={allItems}
                            onClose={handleCloseCategoryModal}
                            onCreateCategory={handleCreateCategory}
                            onUpdateCategory={handleUpdateCategory}
                            editingCategory={editingCategory || undefined}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;


