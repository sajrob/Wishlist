import React, { useState, useEffect } from "react";
import "./CreateCategoryModal.css";

const CreateCategoryModal = ({
  items,
  onClose,
  onCreateCategory,
  onUpdateCategory,
  editingCategory = null,
}) => {
  const [categoryName, setCategoryName] = useState("");
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (editingCategory) {
      setCategoryName(editingCategory.name);
      setSelectedItems(new Set(editingCategory.itemIds));
      setIsPublic(editingCategory.is_public || false);
    } else {
      setCategoryName("");
      setSelectedItems(new Set());
      setIsPublic(false);
    }
  }, [editingCategory]);

  const handleToggleItem = (itemId) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((item) => item.id)));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (categoryName.trim()) {
      if (editingCategory) {
        onUpdateCategory({
          id: editingCategory.id,
          name: categoryName.trim(),
          itemIds: Array.from(selectedItems),
          is_public: isPublic,
        });
      } else {
        onCreateCategory({
          name: categoryName.trim(),
          itemIds: Array.from(selectedItems),
          is_public: isPublic,
        });
      }
      setCategoryName("");
      setSelectedItems(new Set());
      setIsPublic(false);
      onClose();
    }
  };

  return (
    <div className="create-category-modal">
      <div className="modal-header">
        <h2 className="modal-title">
          {editingCategory
            ? "Edit Wishlist Category"
            : "Create New Wishlist Category"}
        </h2>
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="category-form">
        <div className="form-group">
          <label htmlFor="categoryName" className="form-label">
            Category Name
          </label>
          <input
            type="text"
            id="categoryName"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="form-input"
            placeholder="e.g., Birthday, Christmas"
            required
          />
        </div>

        <div className="form-group row" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label className="switch">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            <span className="slider round"></span>
          </label>
          <span style={{ fontSize: '0.9rem', color: '#333' }}>
            Make Category Public?
          </span>
        </div>

        <div className="form-group">
          <div className="select-all-container">
            <label className="form-label">Select Items</label>
            <button
              type="button"
              className="select-all-btn"
              onClick={handleSelectAll}
            >
              {selectedItems.size === items.length ? "Deselect All" : "Select All"}
            </button>
          </div>
          <div className="items-checklist">
            {items.length === 0 ? (
              <p className="no-items">No items available. Add items first.</p>
            ) : (
              items.map((item) => (
                <label key={item.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => handleToggleItem(item.id)}
                    className="checkbox-input"
                  />
                  <span className="checkbox-label">{item.name}</span>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="create-btn"
            disabled={!categoryName.trim()}
          >
            {editingCategory ? "Save Changes" : "Create Category"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCategoryModal;

