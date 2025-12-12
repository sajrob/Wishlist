import type { WishlistCardProps } from '../types';
import './WishlistCard.css';

const WishlistCard = ({ item, onEdit, onDelete, readOnly }: WishlistCardProps) => {
    const { name, price, description, image_url, buy_link } = item;

    // Formatting currency
    const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(price);

    return (
        <div className="wishlist-card">
            <div className="card-image-container">
                <img src={image_url || 'https://via.placeholder.com/400x300?text=No+Image'} alt={name} className="card-image" />
            </div>
            <div className="card-content">
                <div className="item-header">
                    <h2 className="item-name" title={name}>{name}</h2>
                    <span className="item-price">{formattedPrice}</span>
                </div>

                <p className="item-description">{description || 'No description provided.'}</p>

                <div className="card-actions">
                    {buy_link && (
                        <a
                            href={buy_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="buy-link"
                        >
                            Buy Now
                        </a>
                    )}

                    {!readOnly && (
                        <>
                            {onEdit && (
                                <button
                                    className="action-icon-btn"
                                    onClick={() => onEdit(item)}
                                    title="Edit Item"
                                >
                                    ✏️
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    className="action-icon-btn delete"
                                    onClick={() => onDelete(item.id)}
                                    title="Delete Item"
                                >
                                    🗑️
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WishlistCard;
