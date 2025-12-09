/**
 * Category navigation component with tabs for filtering items
 * Displays "All Items" tab plus all categories with privacy indicators
 * 
 * @param {Object} props
 * @param {import('../types').Category[]} props.categories - Array of categories to display
 * @param {string|null} props.activeCategory - Currently active category ID (null for "All Items")
 * @param {Function} props.onCategoryChange - Callback when category is changed
 * @param {boolean} [props.showActions] - Whether to show edit/delete actions (default: false)
 * @param {Function} [props.onEdit] - Callback when edit is clicked
 * @param {Function} [props.onDelete] - Callback when delete is clicked
 * @param {Function} [props.onTogglePrivacy] - Callback when privacy toggle is clicked
 * @param {boolean} [props.showAllTab] - Whether to show "All Items" tab (default: true)
 */
function CategoryNav({
    categories,
    activeCategory,
    onCategoryChange,
    showActions = false,
    onEdit,
    onDelete,
    onTogglePrivacy,
    showAllTab = true
}) {
    if (categories.length === 0) {
        return null;
    }

    return (
        <div className="categories-nav">
            {showAllTab && (
                <button
                    className={`category-tab ${activeCategory === null ? "active" : ""}`}
                    onClick={() => onCategoryChange(null)}
                >
                    All Items
                </button>
            )}
            {categories.map((category) => (
                <div key={category.id} className="category-tab-wrapper">
                    <button
                        className={`category-tab ${activeCategory === category.id ? "active" : ""}`}
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
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onTogglePrivacy(category.id, category.is_public);
                                    }}
                                    title={category.is_public ? "Make Private" : "Make Public"}
                                >
                                    {category.is_public ? '🔒' : '🌍'}
                                </button>
                            )}
                            {onEdit && (
                                <button
                                    className="category-edit-btn"
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
                                    className="category-delete-btn"
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
                </div>
            ))}
        </div>
    );
}

export default CategoryNav;
