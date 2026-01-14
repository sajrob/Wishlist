/**
 * CategoryNav component that handles filtering and navigation of wishlist categories.
 * Allows users to switch between different wishlists and manage category-specific actions.
 */
import React from 'react';
import type { Category } from '../types';
import './CategoryNav.css';

interface CategoryNavProps {
    categories: Category[];
    activeCategory: string | null;
    onCategoryChange: (categoryId: string | null) => void;
    showActions?: boolean;
    onEdit?: (category: Category) => void;
    onDelete?: (categoryId: string) => void;
    onTogglePrivacy?: (categoryId: string, isPublic: boolean) => void;
    showAllTab?: boolean;
}

function CategoryNav({
    categories,
    activeCategory,
    onCategoryChange,
    showActions = false,
    onEdit,
    onDelete,
    onTogglePrivacy,
    showAllTab = true,
}: CategoryNavProps) {
    if (categories.length === 0 && !showAllTab) {
        return null;
    }

    return (
        <nav className="category-nav">
            <div className="category-header">Categories</div>

            {showAllTab && (
                <button
                    className={`category-item ${activeCategory === null ? 'active' : ''}`}
                    onClick={() => onCategoryChange(null)}
                >
                    <span className="category-name">📦 All Items</span>
                </button>
            )}

            {categories.map(category => (
                <button
                    key={category.id}
                    className={`category-item ${activeCategory === category.id ? 'active' : ''}`}
                    onClick={() => onCategoryChange(category.id)}
                >
                    <span className="category-name">
                        <span className="truncate">{category.name}</span>
                        {/* Privacy Indicator */}
                        {category.is_public ? (
                            <span title="Public Category" style={{ fontSize: '0.8em', opacity: 0.7 }}>🌍</span>
                        ) : (
                            <span title="Private Category" style={{ fontSize: '0.8em', opacity: 0.7 }}>🔒</span>
                        )}
                    </span>

                    {showActions && (
                        <div className="category-actions" onClick={(e) => e.stopPropagation()}>
                            {onTogglePrivacy && (
                                <button
                                    className="action-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onTogglePrivacy(category.id, category.is_public);
                                    }}
                                    title={category.is_public ? 'Make Private' : 'Make Public'}
                                >
                                    {category.is_public ? '🔒' : '🌍'}
                                </button>
                            )}
                            {onEdit && (
                                <button
                                    className="action-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(category);
                                    }}
                                    title="Edit category"
                                >
                                    ✏️
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    className="action-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(category.id);
                                    }}
                                    title="Delete category"
                                >
                                    🗑️
                                </button>
                            )}
                        </div>
                    )}
                </button>
            ))}
        </nav>
    );
}

export default CategoryNav;
