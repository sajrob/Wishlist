import React, { useState, useEffect } from "react";
import "./WishlistForm.css";

const WishlistForm = ({ onSubmit, onClose, editingItem = null }) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    imageUrl: "",
    buyLink: "",
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name || "",
        price: editingItem.price || "",
        description: editingItem.description || "",
        imageUrl: editingItem.imageUrl || "",
        buyLink: editingItem.buyLink || "",
      });
    } else {
      setFormData({
        name: "",
        price: "",
        description: "",
        imageUrl: "",
        buyLink: "",
      });
    }
  }, [editingItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      formData.name &&
      formData.price &&
      formData.description &&
      formData.imageUrl &&
      formData.buyLink
    ) {
      onSubmit(formData);
      setFormData({
        name: "",
        price: "",
        description: "",
        imageUrl: "",
        buyLink: "",
      });
    }
  };

  return (
    <form className="wishlist-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2 className="form-title">
          {editingItem ? "Edit wishlist item" : "Add a new wishlist item"}
        </h2>
        <button
          type="button"
          className="form-close-btn"
          onClick={onClose}
          aria-label="Close form"
        >
          ×
        </button>
      </div>

      <div className="form-row">
        <div className="form-group form-group-half">
          <label htmlFor="name" className="form-label">
            Item Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter item name"
            required
          />
        </div>

        <div className="form-group form-group-half">
          <label htmlFor="price" className="form-label">
            Price
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="form-input"
            placeholder="enter number only"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="form-textarea"
          placeholder="Say why you want/need this item"
          rows="2"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="imageUrl" className="form-label">
          Image URL
        </label>
        <input
          type="url"
          id="imageUrl"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          className="form-input"
          placeholder="https://example.com/image.jpg"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="buyLink" className="form-label">
          Buy Link
        </label>
        <input
          type="url"
          id="buyLink"
          name="buyLink"
          value={formData.buyLink}
          onChange={handleChange}
          className="form-input"
          placeholder="https://example.com/buy"
          required
        />
      </div>

      <button type="submit" className="form-submit-btn">
        {editingItem ? "Save Changes" : "Add to Wishlist"}
      </button>
    </form>
  );
};

export default WishlistForm;
