import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import { confirmDelete } from '../utils/toastHelpers';
import WishlistCard from '../components/WishlistCard';
import WishlistForm from '../components/WishlistForm';
import CreateCategoryModal from '../components/CreateCategoryModal';
import CategoryNav from '../components/CategoryNav';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus } from "lucide-react";
import { useSearchParams } from 'react-router-dom';
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
    const [searchParams, setSearchParams] = useSearchParams();
    const activeCategory = searchParams.get('category');

    const setActiveCategory = (id: string | null) => {
        if (id) {
            setSearchParams({ category: id });
        } else {
            setSearchParams({});
        }
    };

    const { allItems, categories, loading, setAllItems, setCategories, refetch } = useWishlistData(user?.id || null);
    const { isPublic, togglePublic } = useWishlistSettings(user?.id || null);
    const { createCategory, updateCategory, deleteCategory, toggleCategoryPrivacy } = useCategories(user?.id || '');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

    useEffect(() => {
        const action = searchParams.get('action');
        if (action === 'new-category') {
            setIsCategoryModalOpen(true);
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('action');
            setSearchParams(newParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);

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
            is_must_have: newItem.is_must_have || false,
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
            is_must_have: formData.is_must_have || false,
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

    const handleToggleMustHave = async (itemId: string, isMustHave: boolean) => {
        const { data, error } = await updateItem(itemId, { is_must_have: isMustHave });

        if (error) {
            toast.error('Failed to update importance');
            return;
        }

        if (data) {
            setAllItems(prev => prev.map(item => (item.id === itemId ? { ...item, is_must_have: data.is_must_have } : item)));
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        const itemToDelete = allItems.find(i => i.id === itemId);

        if (activeCategory) {
            // Case 1: Viewing a specific wishlist - just remove from that wishlist (make uncategorized)
            confirmDelete({
                title: "Remove from Wishlist?",
                description: `"${itemToDelete?.name || 'this item'}" will be removed from this wishlist but will still be available in "All Items".`,
                deleteLabel: "Remove",
                onDelete: async () => {
                    const { data, error } = await updateItem(itemId, { category_id: null });
                    if (error) {
                        toast.error('Error removing item');
                        return;
                    }
                    // Update the local state - the item still exists but its category is now null
                    setAllItems(prev => prev.map(item => (item.id === itemId && data ? data : item)));
                    toast.success('Item removed from wishlist');
                }
            });
        } else {
            // Case 2: Viewing "All Items" - permanent deletion
            confirmDelete({
                title: "Permanently Delete?",
                description: `This will completely remove "${itemToDelete?.name || 'this item'}" from your account.`,
                deleteLabel: "Delete Permanently",
                onDelete: async () => {
                    const { error } = await deleteItem(itemId);
                    if (error) {
                        toast.error('Error deleting item');
                        return;
                    }
                    setAllItems(prev => prev.filter(item => item.id !== itemId));
                    toast.success('Item deleted successfully');
                }
            });
        }
    };

    const handleCreateCategory = async (categoryData: { name: string; itemIds?: string[]; is_public: boolean }) => {
        const { data, error } = await createCategory(categoryData as any);

        if (error) {
            alert('Error creating category');
            return;
        }

        await refetch();
        window.dispatchEvent(new Event('categoriesUpdated'));
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
        window.dispatchEvent(new Event('categoriesUpdated'));
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
    };

    const handleDeleteCategory = async (categoryId: string) => {
        const catToDelete = categories.find(c => c.id === categoryId);

        confirmDelete({
            title: "Delete this category?",
            description: `Items in "${catToDelete?.name || 'this category'}" will be moved to "All Items".`,
            onDelete: async () => {
                const { error } = await deleteCategory(categoryId);
                if (error) {
                    toast.error('Error deleting category');
                    return;
                }
                setCategories(prev => prev.filter(cat => cat.id !== categoryId));
                setAllItems(prev => prev.map(item => (item.category_id === categoryId ? { ...item, category_id: null } : item)));
                window.dispatchEvent(new Event('categoriesUpdated'));

                if (activeCategory === categoryId) {
                    setActiveCategory(null);
                }
                toast.success('Category deleted successfully');
            }
        });
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

    if (loading) return <div className="flex-center" style={{ height: '80vh' }}><LoadingSpinner /></div>;

    const activeCategoryName = categories.find(c => c.id === activeCategory)?.name;

    return (
        <>
            <div className={`app-content ${isModalOpen ? 'blurred' : ''}`}>
                {/* Sticky Header */}
                <header className="sticky top-0 z-30 bg-[var(--color-background)] border-b border-transparent shadow-sm">
                    <div className="p-6 max-w-[1200px] mx-auto w-full">
                        <div className="flex flex-wrap justify-between items-center gap-4">
                            <div className="page-title">
                                <h1 className="text-3xl font-bold mb-2">{activeCategory
                                    ? `${activeCategoryName || 'Loading...'} wishlist`
                                    : 'All Items'}</h1>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                    {/* Category Actions */}
                                    {activeCategory && (
                                        <div className="header-category-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                                            {(() => {
                                                const cat = categories.find(c => c.id === activeCategory);
                                                if (!cat) return null;
                                                return (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 px-3 text-xs font-normal"
                                                            onClick={() => handleToggleCategoryPrivacy(cat.id, cat.is_public)}
                                                            title={cat.is_public ? 'Make Private' : 'Make Public'}
                                                        >
                                                            {cat.is_public ? '🌍 Public' : '🔒 Private'}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 px-3 text-xs font-normal"
                                                            onClick={() => handleEditCategory(cat)}
                                                            title="Edit Category"
                                                        >
                                                            Edit Wishlist
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 px-3 text-xs font-normal text-destructive hover:bg-destructive hover:text-destructive-foreground focus:ring-destructive"
                                                            onClick={() => handleDeleteCategory(cat.id)}
                                                            title="Delete Category"
                                                        >
                                                            Delete Wishlist
                                                        </Button>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="header-actions">
                                {allItems.length > 0 && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={handleOpenForm}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Item
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={handleOpenCategoryModal}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Wishlist
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="p-6 max-w-[1200px] mx-auto w-full">
                    <main className="dashboard-main">

                        {!activeCategory && (
                            <div className="settings-card mb-8 max-w-sm">
                                <div className="settings-title">Main Wishlist Privacy</div>
                                <div className="toggle-row" onClick={handleTogglePublic}>
                                    <span className="toggle-text">Make Wishlist Public</span>
                                    <div className="toggle-switch">
                                        <input type="checkbox" checked={isPublic} readOnly />
                                        <span className="toggle-slider"></span>
                                    </div>
                                </div>
                                <p className="toggle-helper">
                                    {isPublic
                                        ? "🌍 Your main wishlist is visible to friends."
                                        : "🔒 Your main wishlist is private by default. Only you can see it."}
                                </p>
                            </div>
                        )}

                        <div className="cards-grid">
                            {wishlistItems.length === 0 ? (
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <EmptyState
                                        message={
                                            categories.length === 0
                                                ? 'Get started by creating your first Wishlist.'
                                                : activeCategory === null
                                                    ? 'Add your first item'
                                                    : 'Your ' + activeCategoryName + ' wishlist is empty, start adding items.'
                                        }
                                        action={
                                            categories.length === 0
                                                ? {
                                                    text: 'Create Wishlist',
                                                    onClick: handleOpenCategoryModal,
                                                }
                                                : {
                                                    text: 'Add Item',
                                                    onClick: handleOpenForm,
                                                }
                                        }
                                    >
                                        {categories.length > 0 && activeCategory === null && (
                                            <div className="flex flex-col items-center gap-2 mt-6">
                                                <p className="text-muted-foreground italic">or jump to a specific wishlist:</p>
                                                <Select onValueChange={(value) => setActiveCategory(value)}>
                                                    <SelectTrigger className="w-[200px] h-8 text-xs">
                                                        <SelectValue placeholder="Select a wishlist" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categories.map((cat) => (
                                                            <SelectItem key={cat.id} value={cat.id}>
                                                                {cat.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </EmptyState>
                                </div>
                            ) : (
                                wishlistItems.map(item => (
                                    <WishlistCard
                                        key={item.id}
                                        item={item}
                                        onEdit={() => handleEditItem(item)}
                                        onDelete={() => handleDeleteItem(item.id)}
                                        onToggleMustHave={handleToggleMustHave}
                                    />
                                ))
                            )}
                        </div>
                    </main>
                </div >
            </div >

            {/* Add/Edit Item Modal */}
            < Dialog open={isFormOpen} onOpenChange={(open) => !open && handleCloseForm()
            }>
                <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl">
                    <WishlistForm
                        onSubmit={editingItem ? handleUpdateItem : handleAddItem}
                        onClose={handleCloseForm}
                        editingItem={editingItem || undefined}
                    />
                </DialogContent>
            </Dialog >

            {/* Add/Edit Wishlist Modal */}
            < Dialog open={isCategoryModalOpen} onOpenChange={(open) => !open && handleCloseCategoryModal()}>
                <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl">
                    <CreateCategoryModal
                        items={allItems}
                        onCreateCategory={handleCreateCategory}
                        onUpdateCategory={handleUpdateCategory}
                        onClose={handleCloseCategoryModal}
                        editingCategory={editingCategory || undefined}
                    />
                </DialogContent>
            </Dialog >
        </>
    );
}

export default Home;
