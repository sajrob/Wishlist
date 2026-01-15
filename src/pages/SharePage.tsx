import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { fetchWishlistSettings, fetchProfile } from '../utils/supabaseHelpers';
import { WishlistCardSkeleton } from '../components/WishlistCardSkeleton';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Gift, Lock, UserPlus, ArrowRight, UserCheck } from 'lucide-react';
import { getFirstName, getPossessiveName } from '../utils/nameUtils';
import { toast } from 'sonner';
import type { WishlistItem, Profile, Category } from '../types';

const SharePage = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState<Category | null>(null);
    const [ownerProfile, setOwnerProfile] = useState<Profile | null>(null);
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [isPrivate, setIsPrivate] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowLoading, setIsFollowLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (categoryId && !authLoading) {
            void loadShareData();
        }
    }, [categoryId, authLoading, user]);

    const loadShareData = async () => {
        setLoading(true);
        try {
            // 1. Fetch category
            const { data: catData, error: catError } = await supabase
                .from('categories')
                .select('*')
                .eq('id', categoryId)
                .single();

            if (catError || !catData) throw new Error('Category not found');
            setCategory(catData);

            const ownerId = catData.user_id;

            // 2. Fetch owner profile
            const { data: profData, error: profError } = await fetchProfile(ownerId);
            if (profError) throw profError;
            setOwnerProfile(profData);

            // 3. Check Friendship/Following if logged in
            let followingStatus = false;
            if (user) {
                const { data: friendData } = await supabase
                    .from('friends')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('friend_id', ownerId)
                    .maybeSingle();
                followingStatus = !!friendData;
                setIsFollowing(followingStatus);
            }

            // 4. Fetch owner's privacy setting
            const { data: settings } = await fetchWishlistSettings(ownerId);
            const listIsPublic = settings?.is_public ?? false;

            // 5. Smart Redirect Logic
            // If logged in AND following, go to the full wishlist.
            // Even if public, we now require following to see the full page per user request.
            if (user && followingStatus) {
                navigate(`/wishlist/${ownerId}?category=${categoryId}`, { replace: true });
                return;
            }

            // 6. Privacy Check for rendering
            // We show the "Private" UI if NOT (public OR following)
            const isTargetPrivate = !catData.is_public && !listIsPublic;
            setIsPrivate(isTargetPrivate);

            // 7. Fetch items (preview items)
            const { data: itemsData, error: itemsError } = await supabase
                .from('items')
                .select('*')
                .eq('category_id', categoryId);

            if (itemsError) throw itemsError;
            setItems(itemsData || []);

        } catch (err: any) {
            console.error('Error loading share data:', err);
            setError(err.message || 'Could not load shared wishlist');
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        if (!user || !ownerProfile) return;
        setIsFollowLoading(true);
        try {
            const { error } = await supabase
                .from('friends')
                .insert([{ user_id: user.id, friend_id: ownerProfile.id }]);

            if (error) throw error;
            setIsFollowing(true);
            toast.success(`You are now following ${getFirstName(ownerProfile)}!`);

            // Redirect now that follow is successful
            navigate(`/wishlist/${ownerProfile.id}?category=${categoryId}`, { replace: true });
        } catch (err: any) {
            console.error('Error following user:', err);
            toast.error('Could not follow user.');
        } finally {
            setIsFollowLoading(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="container max-w-4xl mx-auto py-12 px-4 space-y-8 mt-16">
                <div className="space-y-4">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <WishlistCardSkeleton key={i} />)}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container max-w-md mx-auto py-24 px-4 text-center mt-16">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                        <Lock className="w-8 h-8" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold mb-2">Private Wishlist</h1>
                <p className="text-muted-foreground mb-8">This wishlist is private or doesn't exist.</p>
                <Button asChild className="w-full">
                    <Link to="/">Go Home</Link>
                </Button>
            </div>
        );
    }

    const firstName = getFirstName(ownerProfile);
    const possessiveName = getPossessiveName(firstName);
    const isGuest = !user;

    return (
        <div className="h-[calc(100vh-64px)] w-full overflow-hidden flex flex-col pt-4">
            <div className="container max-w-6xl mx-auto px-4 flex flex-col h-full">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b pb-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-primary font-medium text-sm">
                            <Gift className="w-4 h-4" />
                            <span>Shared Wishlist</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                            {possessiveName} {category?.name} List
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Discover items {firstName} wants and claim them to help celebrate!
                        </p>
                    </div>

                    {isGuest && (
                        <div className="hidden md:block">
                            <Button asChild size="sm" className="shadow hover:shadow-md transition-all h-9">
                                <Link to={`/signup?redirect_to=${encodeURIComponent(window.location.pathname)}`}>
                                    Sign up to claim <ArrowRight className="ml-2 size-3" />
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>

                {/* Teaser or Content */}
                <div className="relative flex-1 overflow-hidden min-h-0">
                    {(!user || !isFollowing) && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none p-4">
                            <div className="bg-background/90 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border text-center max-w-sm mx-auto pointer-events-auto transform -translate-y-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                                    {user ? <UserPlus className="size-6" /> : <Lock className="size-6" />}
                                </div>
                                <h2 className="text-xl font-bold mb-2">
                                    Access Restricted
                                </h2>
                                <p className="text-sm text-muted-foreground mb-6">
                                    {!user
                                        ? `Sign up to see items in ${firstName}'s wishlist and start celebrating together!`
                                        : `Follow ${firstName} to view their wishlist and celebrate together!`
                                    }
                                </p>

                                {user ? (
                                    <Button
                                        className="w-full h-11 text-sm font-semibold shadow-md active:scale-[0.98] transition-all gap-2"
                                        onClick={handleFollow}
                                        disabled={isFollowLoading}
                                    >
                                        {isFollowLoading ? 'Following...' : (
                                            <>
                                                <UserPlus className="size-4" />
                                                Follow {firstName} to View
                                            </>
                                        )}
                                    </Button>
                                ) : (
                                    <Button asChild className="w-full h-11 text-sm font-semibold shadow-md active:scale-[0.98] transition-all">
                                        <Link to={`/signup?redirect_to=${encodeURIComponent(window.location.pathname)}`}>
                                            Sign Up to View List
                                        </Link>
                                    </Button>
                                )}

                                {!user && (
                                    <p className="mt-4 text-[11px] text-muted-foreground">
                                        Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link>
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 transition-all duration-700 h-full overflow-y-auto pb-4 pr-1 scrollbar-hide ${(!user || !isFollowing) ? 'blur-md grayscale-[0.5] opacity-50 pointer-events-none' : ''}`}>
                        {items.length === 0 && !isGuest ? (
                            <div className="col-span-full py-20 text-center">
                                <p className="text-muted-foreground">No items in this category yet.</p>
                            </div>
                        ) : (items.length === 0 && isGuest ? [1, 2, 3, 4, 5, 6, 7, 8] : items).map((itemOrId, idx) => {
                            const item = typeof itemOrId === 'object' ? itemOrId : null;
                            return (
                                <div key={item?.id || idx} className="group bg-card border rounded-lg overflow-hidden hover:shadow-sm transition-shadow h-fit">
                                    <div className="aspect-square bg-muted/30 relative overflow-hidden">
                                        {item?.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.name}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                {item ? <Gift className="w-8 h-8 opacity-20" /> : <Skeleton className="w-full h-full" />}
                                            </div>
                                        )}
                                        {item?.is_must_have && (
                                            <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                Must Have
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 space-y-1">
                                        {item ? (
                                            <>
                                                <h3 className="font-medium text-sm line-clamp-1">{item.name}</h3>
                                                <p className="text-primary text-sm font-bold">
                                                    {item.currency || '$'}{item.price}
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <Skeleton className="h-4 w-3/4" />
                                                <Skeleton className="h-4 w-1/4" />
                                            </>
                                        )}
                                        <div className="pt-1">
                                            <Button variant="outline" size="sm" className="w-full h-7 text-[10px]" disabled>
                                                Claim Item
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SharePage;
