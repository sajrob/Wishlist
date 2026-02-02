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
import { formatCurrency } from '../utils/numberUtils';
import { getInitials } from '../utils/nameUtils';
import { useAuth } from '../context/AuthContext';
import { toggleClaim } from '../utils/supabaseHelpers';
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Pencil, Trash2, ExternalLink } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import './WishlistCard.css';

const WishlistCard = ({ item, onEdit, onDelete, onToggleMustHave, readOnly }: WishlistCardProps) => {
    const { id, name, price, description, image_url, is_must_have, buy_link, currency, claims: initialClaims } = item;
    const { user } = useAuth();
    const [claims, setClaims] = useState<Claim[]>(initialClaims || []);
    const [isClaiming, setIsClaiming] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

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
                        created_at: '',
                        avatar_url: user.user_metadata?.avatar_url,
                        user_metadata: user.user_metadata
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

    const formattedPrice = formatCurrency(price, currency);

    return (
        <>
            <div className="wishlist-card" onClick={() => setIsDetailOpen(true)}>
                {readOnly && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div
                                    className={`claim-badge ${isClaimedByUser ? 'claimed' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleClaim();
                                    }}
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
                    <img src={image_url || 'https://placehold.co/600x400/grey/black?text=No+Image'} alt={name} className="card-image" />
                    {is_must_have && (
                        <div className="must-have-badge">
                            Must Have
                        </div>
                    )}
                </div>
                <div className="card-content">
                    <div className="item-header">
                        <h2 className="item-name" title={name}>{name}</h2>
                        <span className="item-price">{formattedPrice}</span>
                    </div>

                    <p className="item-description">{description || 'No description provided.'}</p>

                    {readOnly && claims.length > 0 && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border" onClick={(e) => e.stopPropagation()}>
                            <div className="flex -space-x-2">
                                {claims.slice(0, 5).map((claim) => (
                                    <TooltipProvider key={claim.id}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Avatar className="h-8 w-8 border-2 border-background transition-transform hover:z-10 hover:scale-110">
                                                    <AvatarImage
                                                        src={claim.profiles?.avatar_url || (claim.profiles?.user_metadata as any)?.avatar_url}
                                                        alt={claim.profiles?.full_name || 'User'}
                                                    />
                                                    <AvatarFallback className="text-[10px]">
                                                        {getInitials(claim.profiles?.full_name || '')}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{claim.profiles?.full_name || 'A friend'} has claimed this</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ))}
                                {claims.length > 5 && (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium z-0 hover:z-10">
                                        +{claims.length - 5}
                                    </div>
                                )}
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">
                                {claims.length} {claims.length === 1 ? 'friend' : 'friends'} claimed
                            </span>
                        </div>
                    )}

                    <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                        {readOnly ? (
                            <div className="shared-actions">
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
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                                    >
                                        Must Have
                                    </label>
                                </div>

                                <div className="flex gap-1">
                                    {onEdit && (
                                        <button
                                            className="action-icon-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEdit(item);
                                            }}
                                            title="Edit Item"
                                        >
                                            <Pencil className="size-4" />

                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            className="action-icon-btn delete"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(item.id);
                                            }}
                                            title="Delete Item"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden gap-0 wishlist-detail-dialog">
                    <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
                        <div className="md:w-1/2 bg-muted flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-border">
                            <img
                                src={image_url || 'https://placehold.co/600x400/grey/black?text=No+Image'}
                                alt={name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="md:w-1/2 p-6 flex flex-col gap-4 overflow-y-auto">
                            <DialogHeader>
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    {is_must_have && (
                                        <Badge className="bg-gradient-to-r from-primary to-accent text-white border-none text-[10px] py-0 px-2 uppercase font-bold tracking-wider">
                                            Must Have
                                        </Badge>
                                    )}
                                    <span className="text-xl font-bold text-primary">{formattedPrice}</span>
                                </div>
                                <DialogTitle className="text-2xl font-bold leading-tight">{name}</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</h4>
                                    <DialogDescription className="text-base text-foreground leading-relaxed whitespace-pre-wrap">
                                        {description || 'No description provided.'}
                                    </DialogDescription>
                                </div>

                                {readOnly && (
                                    <div className="space-y-3 pt-2">
                                        {buy_link && (
                                            <a
                                                href={ensureAbsoluteUrl(buy_link)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-3 rounded-md font-semibold transition-colors shadow-md"
                                            >
                                                <ExternalLink className="size-4" />
                                                View Online / Buy
                                            </a>
                                        )}
                                        <button
                                            onClick={handleToggleClaim}
                                            disabled={isClaiming}
                                            className={`w-full px-4 py-3 rounded-md font-semibold transition-all shadow-sm flex items-center justify-center gap-2 ${isClaimedByUser
                                                ? 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                                }`}
                                        >
                                            {isClaimedByUser ? '🎁 Unclaim Item' : '🤝 Claim this Item'}
                                        </button>
                                        {claims.length > 0 && (
                                            <p className="text-xs text-center text-muted-foreground">
                                                {claims.length} {claims.length === 1 ? 'person has' : 'people have'} claimed this
                                            </p>
                                        )}
                                    </div>
                                )}

                                {!readOnly && (
                                    <div className="flex gap-2 pt-4">
                                        <button
                                            className="flex-1 flex items-center justify-center gap-2 border border-border hover:bg-muted py-2.5 rounded-md font-medium transition-colors"
                                            onClick={() => {
                                                setIsDetailOpen(false);
                                                onEdit?.(item);
                                            }}
                                        >
                                            <Pencil className="size-4" />
                                            Edit
                                        </button>
                                        <button
                                            className="flex-1 flex items-center justify-center gap-2 border border-danger/20 text-danger hover:bg-danger/5 py-2.5 rounded-md font-medium transition-colors"
                                            onClick={() => {
                                                if (window.confirm('Are you sure you want to delete this item?')) {
                                                    setIsDetailOpen(false);
                                                    onDelete?.(item.id);
                                                }
                                            }}
                                        >
                                            <Trash2 className="size-4" />
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default WishlistCard;
