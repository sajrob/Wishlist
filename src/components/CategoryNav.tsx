import type { Category } from '../types';

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
    if (categories.length === 0) {
        return null;
    }

    return (
        <div className="categories-nav">
            {showAllTab && (
                <button
                    className={`category-tab ${activeCategory === null ? 'active' : ''}`}
                    onClick={() => onCategoryChange(null)}
                >
                    All Items
                </button>
            )}
            {categories.map(category => (
                <div key={category.id} className="category-tab-wrapper">
                    <button
                        className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
                        onClick={() => onCategoryChange(category.id)}
                    >
                        {category.name}
                        {category.is_public && (
                            <span style={{ marginLeft: '6px', fontSize: '0.8rem' }} title="Public Category">
                                🌍
                            </span>
                        )}
                        {!category.is_public && (
                            <span style={{ marginLeft: '6px', fontSize: '0.8rem' }} title="Private Category">
                                🔒
                            </span>
                        )}
                    </button>
                    {showActions && activeCategory === category.id && (
                        <div className="category-actions">
                            {onTogglePrivacy && (
                                <button
                                    className="category-privacy-btn"
                                    onClick={e => {
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
                                    className="category-edit-btn"
                                    onClick={e => {
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
                                    className="category-delete-btn"
                                    onClick={e => {
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
                </div>
            ))}
        </div>
    );
}

export default CategoryNav;


