import React from "react";
import "./WishlistCard.css";

const WishlistCard = ({ item, onEdit, onDelete }) => {
  const { name, price, description, imageUrl, buyLink } = item;

  return (
    <div className="wishlist-card">
      <div className="card-image-container">
        <img src={imageUrl} alt={name} className="card-image" />
      </div>
      <div className="card-content">
        <div className="text-box name-box">
          <h2 className="item-name">{name}</h2>
        </div>
        <div className="text-box price-box">
          <p className="item-price">${price}</p>
        </div>
        <div className="text-box description-box">
          <p className="item-description">{description}</p>
        </div>
        <div className="card-actions">
          <a
            href={buyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="buy-link"
          >
            Buy Item
          </a>
          <button className="edit-btn" onClick={() => onEdit(item)}>
            Edit
          </button>
          <button className="delete-btn" onClick={() => onDelete(item.id)} style={{ marginLeft: '8px', backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistCard;
