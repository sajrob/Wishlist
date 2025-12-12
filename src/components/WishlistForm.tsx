import React, { useState, useEffect } from 'react';
import type { ItemFormData, WishlistFormProps } from '../types';
import './WishlistForm.css';

const initialForm: ItemFormData = {
    name: '',
    price: '',
    description: '',
    image_url: '',
    buy_link: '',
};

const WishlistForm = ({ onSubmit, onClose, editingItem = null }: WishlistFormProps) => {
    const [formData, setFormData] = useState<ItemFormData>(initialForm);

    useEffect(() => {
        if (editingItem) {
            setFormData({
                name: editingItem.name || '',
                price: editingItem.price || '',
                description: editingItem.description || '',
                image_url: editingItem.image_url || '',
                buy_link: editingItem.buy_link || '',
            });
        } else {
            setFormData(initialForm);
        }
    }, [editingItem]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (
            formData.name &&
            formData.price !== undefined &&
            formData.description &&
            formData.image_url &&
            formData.buy_link
        ) {
            await onSubmit(formData);
            setFormData(initialForm);
        }
    };

    return (
        <form className="wishlist-form" onSubmit={handleSubmit}>
            <div className="form-header">
                <h2 className="form-title">{editingItem ? 'Edit wishlist item' : 'Add a new wishlist item'}</h2>
                <button type="button" className="form-close-btn" onClick={onClose} aria-label="Close form">
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
                    rows={2}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="image_url" className="form-label">
                    Image URL
                </label>
                <input
                    type="url"
                    id="image_url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="https://example.com/image.jpg"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="buy_link" className="form-label">
                    Buy Link
                </label>
                <input
                    type="url"
                    id="buy_link"
                    name="buy_link"
                    value={formData.buy_link}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="https://example.com/buy"
                    required
                />
            </div>

            <button type="submit" className="form-submit-btn">
                {editingItem ? 'Save Changes' : 'Add to Wishlist'}
            </button>
        </form>
    );
};

export default WishlistForm;


