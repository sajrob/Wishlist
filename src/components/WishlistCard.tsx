/**
 * WishlistCard component that represents an individual item within a wishlist.
 * Displays item details, price, and actions like editing, deleting, or claiming (for friends).
 */
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { WishlistCardProps, Claim } from '../types';
import { CURRENCIES } from './CurrencySelect';
import { ensureAbsoluteUrl } from '../utils/urlUtils';
import { useAuth } from '../context/AuthContext';
import { toggleClaim } from '../utils/supabaseHelpers';
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './WishlistCard.css';

const WishlistCard = ({ item, onEdit, onDelete, onToggleMustHave, readOnly }: WishlistCardProps) => {
    const { id, name, price, description, image_url, is_must_have, buy_link, currency, claims: initialClaims } = item;
    const { user } = useAuth();
    const [claims, setClaims] = useState<Claim[]>(initialClaims || []);
    const [isClaiming, setIsClaiming] = useState(false);

    useEffect(() => {
        setClaims(initialClaims || []);
    }, [initialClaims]);

    // Set up real-time subscription for claims
    useEffect(() => {
        if (!readOnly) return; // Only friends see real-time updates for claims

        const channel = supabase
            .channel(`claims-${id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'claims',
                    filter: `item_id=eq.${id}`,
                },
                async () => {
                    // When something changes, we should ideally refetch claims with profiles
                    // For now, let's just trigger a re-fetch if we had a more global state
                    // But since it's per card, maybe we just fetch item claims
                    const { data } = await supabase
                        .from('claims')
                        .select('*, profiles(*)')
                        .eq('item_id', id);
                    if (data) setClaims(data as Claim[]);
                }
            )
            .subscribe();

        return () => {
            void supabase.removeChannel(channel);
        };
    }, [id, readOnly]);

    const isClaimedByUser = claims.some(c => c.user_id === user?.id);

    const handleToggleClaim = async () => {
        if (!user || isClaiming) return;
        setIsClaiming(true);
        try {
            const { error } = await toggleClaim(id, user.id, isClaimedByUser);
            if (error) throw error;
            // Local update will be handled by realtime or we can do it manually for speed
            if (isClaimedByUser) {
                setClaims(prev => prev.filter(c => c.user_id !== user.id));
            } else {
                // We don't have the full profile here easily without another fetch,
                // but realtime will pick it up. For instant feedback:
                const newClaim: Claim = {
                    id: 'temp',
                    item_id: id,
                    user_id: user.id,
                    created_at: new Date().toISOString(),
                    profiles: {
                        id: user.id,
                        full_name: user.user_metadata.full_name || '',
                        first_name: user.user_metadata.first_name || '',
                        last_name: user.user_metadata.last_name || '',
                        email: user.email || '',
                        created_at: ''
                    }
                };
                setClaims(prev => [...prev, newClaim]);
            }
        } catch (err) {
            console.error('Failed to toggle claim:', err);
        } finally {
            setIsClaiming(false);
        }
    };

    // Formatting currency
    const displayCurrency = currency || 'SLE';
    let formattedPrice;

    if (displayCurrency === 'SLE') {
        formattedPrice = `Le ${Number(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
        try {
            formattedPrice = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: displayCurrency,
            }).format(Number(price));
        } catch (e) {
            const cur = CURRENCIES.find(c => c.code === displayCurrency);
            const symbol = cur?.symbol || displayCurrency;
            formattedPrice = `${symbol}${Number(price).toFixed(2)}`;
        }
    }

    return (
        <div className="wishlist-card">
            {readOnly && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div
                                className={`claim-badge ${isClaimedByUser ? 'claimed' : ''}`}
                                onClick={handleToggleClaim}
                            >
                                <Badge variant={isClaimedByUser ? "default" : "outline"} className="cursor-pointer">
                                    {isClaimedByUser ? '🎁 Claimed' : '🤝 Claim'}
                                </Badge>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{isClaimedByUser ? 'You have pledged to buy this' : 'Pledge to buy this item'}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}

            <div className="card-image-container">
                <img src={image_url || 'https://via.placeholder.com/400x300?text=No+Image'} alt={name} className="card-image" />
            </div>
            <div className="card-content">
                <div className="item-header">
                    <h2 className="item-name" title={name}>{name}</h2>
                    <span className="item-price">{formattedPrice}</span>
                </div>

                <p className="item-description">{description || 'No description provided.'}</p>

                {readOnly && claims.length > 0 && (
                    <div className="avatar-stack-container">
                        <div className="avatar-stack">
                            {claims.slice(0, 5).map((claim) => (
                                <TooltipProvider key={claim.id}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Avatar className="h-8 w-8 border-2 border-background">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${claim.user_id}`} />
                                                <AvatarFallback>{claim.profiles?.first_name?.[0] || '?'}</AvatarFallback>
                                            </Avatar>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{claim.profiles?.full_name || 'A friend'} has claimed this</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
                            {claims.length > 5 && (
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold border-2 border-background ml-[-12px] z-0">
                                    +{claims.length - 5}
                                </div>
                            )}
                        </div>
                        <span className="claimed-text">
                            {claims.length} {claims.length === 1 ? 'friend' : 'friends'} pledged
                        </span>
                    </div>
                )}

                <div className="card-actions">
                    {readOnly ? (
                        <div className="shared-actions">
                            {is_must_have && (
                                <div className="must-have-tag">
                                    Must Have
                                </div>
                            )}
                            {buy_link && (
                                <a
                                    href={ensureAbsoluteUrl(buy_link)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="buy-button"
                                >
                                    Buy Now
                                </a>
                            )}
                        </div>
                    ) : (
                        <div className="owner-actions">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id={`must-have-${id}`}
                                    checked={is_must_have}
                                    onCheckedChange={(checked) => onToggleMustHave?.(id, checked)}
                                />
                                <label
                                    htmlFor={`must-have-${id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600"
                                >
                                    Must Have
                                </label>
                            </div>

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
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WishlistCard;
