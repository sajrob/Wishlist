import { Switch } from "@/components/ui/switch";
import type { WishlistCardProps } from '../types';
import './WishlistCard.css';

const WishlistCard = ({ item, onEdit, onDelete, onToggleMustHave, readOnly }: WishlistCardProps) => {
    const { id, name, price, description, image_url, is_must_have } = item;

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
                    <div className="flex items-center space-x-2">
                        <Switch
                            id={`must-have-${id}`}
                            checked={is_must_have}
                            onCheckedChange={(checked) => onToggleMustHave?.(id, checked)}
                            disabled={readOnly}
                        />
                        <label
                            htmlFor={`must-have-${id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600"
                        >
                            Must Have
                        </label>
                    </div>

                    {!readOnly && (
                        <div className="flex gap-1">
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
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WishlistCard;
