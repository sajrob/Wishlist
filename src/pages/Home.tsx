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
import './Home.css';

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

    if (loading && !user) return <div className="flex-center" style={{ height: '80vh' }}><LoadingSpinner /></div>;

    const activeCategoryName = categories.find(c => c.id === activeCategory)?.name;

    return (
        <>
            <div className={`app-content ${isModalOpen ? 'blurred' : ''}`}>
                <div className="dashboard-container">
                    {/* Sidebar */}
                    <aside className="dashboard-sidebar">
                        <div className="sidebar-sticky">
                            <div className="sidebar-section">
                                <h2>Your Wishlists</h2>
                                <CategoryNav
                                    categories={categories}
                                    activeCategory={activeCategory}
                                    onCategoryChange={setActiveCategory}
                                    showActions={false}
                                />
                                <button className="btn btn-secondary w-full" style={{ marginTop: '1rem' }} onClick={handleOpenCategoryModal}>
                                    <span>+</span> New Category
                                </button>
                            </div>

                            {!activeCategory && (
                                <div className="settings-card">
                                    <div className="settings-title">Settings</div>
                                    <label className="toggle-row">
                                        <span className="toggle-text">Public Wishlist</span>
                                        <div className="toggle-switch">
                                            <input type="checkbox" checked={isPublic} onChange={handleTogglePublic} />
                                            <span className="toggle-slider"></span>
                                        </div>
                                    </label>
                                    <p className="toggle-helper">
                                        {isPublic ? 'Your main list is visible to friends.' : 'Only you can see uncategorized items.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="dashboard-main">
                        <header className="page-header">
                            <div className="page-title">
                                <h1>{getUserPossessiveTitle(user)}</h1>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                    <p className="page-subtitle">
                                        {activeCategory
                                            ? `Filtering by ${activeCategoryName}`
                                            : 'All Items'}
                                    </p>

                                    {/* Category Actions moved from Sidebar */}
                                    {activeCategory && (
                                        <div className="header-category-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                                            {(() => {
                                                const cat = categories.find(c => c.id === activeCategory);
                                                if (!cat) return null;
                                                return (
                                                    <>
                                                        <button
                                                            className="btn-icon"
                                                            onClick={() => handleToggleCategoryPrivacy(cat.id, cat.is_public)}
                                                            title={cat.is_public ? 'Make Private' : 'Make Public'}
                                                            style={{ border: '1px solid var(--color-border)' }}
                                                        >
                                                            {cat.is_public ? '🌍' : '🔒'}
                                                        </button>
                                                        <button
                                                            className="btn-icon"
                                                            onClick={() => handleEditCategory(cat)}
                                                            title="Edit Category"
                                                            style={{ border: '1px solid var(--color-border)' }}
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            className="btn-icon"
                                                            onClick={() => handleDeleteCategory(cat.id)}
                                                            title="Delete Category"
                                                            style={{ border: '1px solid var(--color-border)' }}
                                                        >
                                                            🗑️
                                                        </button>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="header-actions">
                                <button className="btn btn-primary" onClick={handleOpenForm}>
                                    <span style={{ fontSize: '1.2em', lineHeight: 1 }}>+</span> Add Item
                                </button>
                            </div>
                        </header>

                        {/* Grid */}
                        <div className="cards-grid">
                            {wishlistItems.length === 0 ? (
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <EmptyState
                                        message={
                                            activeCategory === null
                                                ? 'Your wishlist is looking empty. Add your first item!'
                                                : 'No items in this category yet.'
                                        }
                                    />
                                </div>
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
                    </main>
                </div>
            </div>

            {/* Modals - Outside the blurred container */}
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
        </>
    );
}

export default Home;
