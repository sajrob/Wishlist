import React, { useState, useEffect } from "react";
import WishlistCard from "../components/WishlistCard";
import WishlistForm from "../components/WishlistForm";
import CreateCategoryModal from "../components/CreateCategoryModal";
import "../App.css";

function Home() {
    const [allItems, setAllItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);

    // Load data from localStorage on mount
    useEffect(() => {
        const savedItems = localStorage.getItem('wishlist_items');
        const savedCategories = localStorage.getItem('wishlist_categories');

        if (savedItems) setAllItems(JSON.parse(savedItems));
        if (savedCategories) setCategories(JSON.parse(savedCategories));
    }, []);

    // Save to localStorage whenever data changes
    useEffect(() => {
        localStorage.setItem('wishlist_items', JSON.stringify(allItems));
    }, [allItems]);

    useEffect(() => {
        localStorage.setItem('wishlist_categories', JSON.stringify(categories));
    }, [categories]);

    // Filter items based on active category
    const wishlistItems = activeCategory === null
        ? allItems
        : allItems.filter((item) => item.categoryId === activeCategory);

    const handleAddItem = (newItem) => {
        const item = {
            id: Date.now(),
            categoryId: activeCategory,
            name: newItem.name,
            price: parseFloat(newItem.price) || 0,
            description: newItem.description,
            imageUrl: newItem.imageUrl,
            buyLink: newItem.buyLink,
            createdAt: new Date().toISOString()
        };

        setAllItems((prev) => [item, ...prev]);
        setIsFormOpen(false);
    };

    const handleEditItem = (item) => {
        setEditingItem(item);
        setIsFormOpen(true);
    };

    const handleUpdateItem = (formData) => {
        setAllItems((prev) =>
            prev.map((item) =>
                item.id === editingItem.id
                    ? { ...item, ...formData, price: parseFloat(formData.price) || 0 }
                    : item
            )
        );
        setIsFormOpen(false);
        setEditingItem(null);
    };

    const handleDeleteItem = (itemId) => {
        if (window.confirm("Delete this item?")) {
            setAllItems(prev => prev.filter(item => item.id !== itemId));
        }
    };

    const handleCreateCategory = (categoryData) => {
        const newCategory = {
            id: Date.now(),
            name: categoryData.name,
            createdAt: new Date().toISOString()
        };

        if (categoryData.itemIds && categoryData.itemIds.length > 0) {
            setAllItems(prev => prev.map(item =>
                categoryData.itemIds.includes(item.id)
                    ? { ...item, categoryId: newCategory.id }
                    : item
            ));
        }

        setCategories((prev) => [...prev, newCategory]);
        setActiveCategory(newCategory.id);
        setIsCategoryModalOpen(false);
    };

    const handleUpdateCategory = (categoryData) => {
        setCategories((prev) =>
            prev.map((cat) =>
                cat.id === categoryData.id ? { ...cat, name: categoryData.name } : cat
            )
        );

        if (categoryData.itemIds && categoryData.itemIds.length > 0) {
            setAllItems(prev => prev.map(item =>
                categoryData.itemIds.includes(item.id)
                    ? { ...item, categoryId: categoryData.id }
                    : item
            ));
        }

        setIsCategoryModalOpen(false);
        setEditingCategory(null);
    };

    const handleDeleteCategory = (categoryId) => {
        if (window.confirm("Delete this category? Items will be uncategorized.")) {
            // Uncategorize items
            setAllItems(prev => prev.map(item =>
                item.categoryId === categoryId ? { ...item, categoryId: null } : item
            ));

            setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
            if (activeCategory === categoryId) {
                setActiveCategory(null);
            }
        }
    };

    const handleEditCategory = (category) => {
        const itemsInCategory = allItems
            .filter(item => item.categoryId === category.id)
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
