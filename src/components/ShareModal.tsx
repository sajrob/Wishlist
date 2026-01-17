import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Copy,
    Check,
    Share2,
    Facebook,
    Twitter,
    MessageCircle, // For WhatsApp/Bluesky as fallback
    ExternalLink,
    Gift,
    Users,
    Globe,
    Search,
    UserPlus,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSharing } from '../hooks/useSharing';
import { fetchMutualFriends } from '../utils/supabaseHelpers';
import { useAuth } from '../context/AuthContext';
import { Profile } from '../types';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from '../utils/nameUtils';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    categoryId: string;
    categoryName: string;
    ownerName: string;
    avatar_url?: string;
    user_metadata?: {
        first_name?: string;
        last_name?: string;
        full_name?: string;
    };
}

const ShareModal: React.FC<ShareModalProps> = ({
    isOpen,
    onClose,
    categoryId,
    categoryName,
    ownerName
}) => {
    const { user } = useAuth();
    const { shareWithFriends, getShareUrl } = useSharing();
    const [friends, setFriends] = useState<Profile[]>([]);
    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
    const [loadingFriends, setLoadingFriends] = useState(false);
    const [copied, setCopied] = useState(false);
    const [sharingToFriends, setSharingToFriends] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const shareUrl = getShareUrl(categoryId);
    const displayOwnerName = ownerName.endsWith('s') ? ownerName : `${ownerName}'s`;

    useEffect(() => {
        if (isOpen && user) {
            void loadFriends();
        }
    }, [isOpen, user]);

    const loadFriends = async () => {
        if (!user) return;
        setLoadingFriends(true);
        const { data, error } = await fetchMutualFriends(user.id);
        if (!error && data) {
            setFriends(data);
        }
        setLoadingFriends(false);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const toggleFriend = (friendId: string) => {
        setSelectedFriends(prev =>
            prev.includes(friendId)
                ? prev.filter(id => id !== friendId)
                : [...prev, friendId]
        );
    };

    const handleInternalShare = async () => {
        if (selectedFriends.length === 0) return;
        setSharingToFriends(true);
        const { error } = await shareWithFriends(categoryId, selectedFriends);
        setSharingToFriends(false);
        if (!error) {
            onClose();
            setSelectedFriends([]);
        }
    };

    const handleSocialShare = (platform: string) => {
        let url = '';
        const text = encodeURIComponent(`Check out ${displayOwnerName} ${categoryName} Wishlist!`);
        const encodedUrl = encodeURIComponent(shareUrl);

        switch (platform) {
            case 'whatsapp':
                url = `https://wa.me/?text=${text}%20${encodedUrl}`;
                break;
            case 'twitter':
                url = `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`;
                break;
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
                break;
            case 'bluesky':
                url = `https://bsky.app/intent/compose?text=${text}%20${encodedUrl}`;
                break;
            case 'native':
                if (navigator.share) {
                    navigator.share({
                        title: `${displayOwnerName} ${categoryName}`,
                        text: `Check out ${displayOwnerName} ${categoryName} Wishlist!`,
                        url: shareUrl,
                    }).catch(console.error);
                    return;
                }
                break;
        }

        if (url) window.open(url, '_blank');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[92vw] max-w-md p-0 overflow-hidden rounded-[32px] sm:rounded-3xl shadow-2xl border-none max-h-[95vh] flex flex-col">
                <DialogHeader className="p-6 pb-2 bg-gradient-to-b from-blue-50/50 to-transparent">
                    <DialogTitle className="text-xl text-blue-900 flex items-center gap-2">
                        <Gift className="w-5 h-5 text-blue-600" />
                        Share {displayOwnerName} {categoryName}
                    </DialogTitle>
                    <DialogDescription>
                        Choose how you'd like to share this wishlist.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="friends" className="w-full flex flex-col">
                    <div className="px-6 py-2 bg-blue-50/30 border-y">
                        <TabsList className="w-full h-11 bg-muted/50 p-1.5 rounded-xl border-none">
                            <TabsTrigger
                                value="friends"
                                className="flex-1 rounded-lg py-2 gap-2 text-xs font-semibold transition-all data-[state=active]:bg-[#2563eb] data-[state=active]:text-white data-[state=active]:shadow-md"
                            >
                                <Users className="w-3.5 h-3.5" />
                                Friends
                            </TabsTrigger>
                            <TabsTrigger
                                value="external"
                                className="flex-1 rounded-lg py-2 gap-2 text-xs font-semibold transition-all data-[state=active]:bg-[#2563eb] data-[state=active]:text-white data-[state=active]:shadow-md"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Share to App
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 min-h-[360px] w-full relative overflow-y-auto overflow-x-hidden custom-scrollbar">
                        <TabsContent value="friends" className="p-0 m-0 h-full flex flex-col data-[state=inactive]:hidden">
                            <div className="flex-1 overflow-hidden flex flex-col">
                                <div className="p-5 border-b bg-muted/5 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm">
                                    <div>
                                        <h3 className="text-[13px] font-bold text-foreground">Select mutual friends</h3>
                                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Only people you follow who follow you back</p>
                                    </div>
                                    <div className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-full">
                                        {selectedFriends.length} selected
                                    </div>
                                </div>

                                {friends.length > 5 && (
                                    <div className="px-5 py-3 bg-muted/5 border-b border-dashed">
                                        <div className="relative group">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <Input
                                                placeholder="Search friends..."
                                                className="h-9 pl-9 pr-4 text-xs rounded-xl bg-card border-muted-foreground/10 focus-visible:ring-primary/20 transition-all"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                            {searchQuery && (
                                                <button
                                                    onClick={() => setSearchQuery('')}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    <X className="size-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex-1 overflow-hidden p-4">
                                    {loadingFriends ? (
                                        <div className="flex flex-col items-center justify-center p-12 gap-3">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                            <p className="text-xs font-bold text-muted-foreground animate-pulse">FINDING FRIENDS...</p>
                                        </div>
                                    ) : friends.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/20 rounded-[24px] border border-dashed border-muted-foreground/20 m-2">
                                            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                                                <Users className="size-6 text-muted-foreground/40" />
                                            </div>
                                            <p className="font-bold text-sm">No mutual friends found</p>
                                            <p className="text-[11px] text-muted-foreground mt-1 max-w-[200px]">Connect with more people to share wishlists directly!</p>
                                            <Button variant="outline" size="sm" className="mt-4 h-8 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                                                Find Friends
                                            </Button>
                                        </div>
                                    ) : (
                                        <ScrollArea className="h-[280px] pr-2">
                                            <div className="space-y-2 pb-2">
                                                {friends
                                                    .filter(f => f.full_name?.toLowerCase().includes(searchQuery.toLowerCase()))
                                                    .map(friend => {
                                                        const isSelected = selectedFriends.includes(friend.id);
                                                        return (
                                                            <div
                                                                key={friend.id}
                                                                onClick={() => toggleFriend(friend.id)}
                                                                className={cn(
                                                                    "group relative flex items-center gap-3 p-2 pl-2 pr-4 rounded-full border transition-all cursor-pointer",
                                                                    isSelected
                                                                        ? "bg-primary/10 border-primary/40 shadow-sm"
                                                                        : "bg-card hover:bg-muted/50 border-muted-foreground/10"
                                                                )}
                                                            >
                                                                <Avatar className="size-9 border-2 border-background shadow-sm group-hover:scale-105 transition-transform duration-300">
                                                                    <AvatarImage src={friend.avatar_url} />
                                                                    <AvatarFallback className="bg-primary/5 text-primary font-bold text-[10px] lowercase">
                                                                        {getInitials(friend.full_name || "")}
                                                                    </AvatarFallback>
                                                                </Avatar>

                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-bold text-[12px] truncate leading-tight">
                                                                        {friend.full_name}
                                                                    </p>
                                                                    <p className="text-[9px] text-muted-foreground font-semibold flex items-center gap-1 mt-0.5 uppercase tracking-tight">
                                                                        <div className="size-1 rounded-full bg-green-500" />
                                                                        Mutual
                                                                    </p>
                                                                </div>

                                                                <div className={cn(
                                                                    "size-5 rounded-full border-2 flex items-center justify-center transition-all",
                                                                    isSelected
                                                                        ? "bg-primary border-primary"
                                                                        : "border-muted-foreground/20 group-hover:border-primary/50"
                                                                )}>
                                                                    {isSelected && <Check className="size-3 text-white stroke-[3px]" />}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                {friends.filter(f => f.full_name?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && searchQuery && (
                                                    <div className="text-center py-8">
                                                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">No friends match "{searchQuery}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        </ScrollArea>
                                    )}
                                </div>
                            </div>
                            <div className="p-4 bg-muted/5 border-t">
                                <Button
                                    className="w-full h-12 rounded-[18px] font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all gap-2"
                                    disabled={selectedFriends.length === 0 || sharingToFriends}
                                    onClick={handleInternalShare}
                                >
                                    {sharingToFriends ? (
                                        <>
                                            <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Share2 className="size-4" />
                                            Share with {selectedFriends.length} Friend{selectedFriends.length !== 1 ? 's' : ''}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="external" className="p-0 m-0 h-full data-[state=inactive]:hidden flex flex-col overflow-hidden">
                            <div className="p-5 space-y-4 flex-1 flex flex-col min-w-0 overflow-hidden">
                                {/* Share Preview Card */}
                                <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 flex items-center gap-3 shrink-0 min-w-0">
                                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                        <Gift className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[9px] uppercase tracking-wider font-bold text-primary/60">Public Link</p>
                                        <p className="font-semibold truncate text-[13px] leading-tight">{displayOwnerName} {categoryName}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 min-w-0">
                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Wishlist Link</Label>
                                    <div className="flex gap-2 p-1 bg-muted/30 border rounded-lg focus-within:ring-1 focus-within:ring-primary transition-all overflow-hidden min-w-0">
                                        <Input
                                            readOnly
                                            value={shareUrl}
                                            className="bg-transparent border-none focus-visible:ring-0 h-8 text-xs shadow-none flex-1 truncate px-2 min-w-0"
                                        />
                                        <Button
                                            size="sm"
                                            variant={copied ? "ghost" : "default"}
                                            className={cn("h-8 px-3 shrink-0 text-[11px]", copied && "text-green-500")}
                                            onClick={handleCopyLink}
                                        >
                                            {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                                            {copied ? "Copied" : "Copy"}
                                        </Button>
                                    </div>
                                </div>

                                {/* Native Share (Priority Action) */}
                                {navigator.share && (
                                    <Button
                                        variant="secondary"
                                        className="w-full h-10 gap-2 text-sm shadow-sm border border-secondary-foreground/5 shrink-0"
                                        onClick={() => handleSocialShare('native')}
                                    >
                                        <Share2 className="h-4 w-4" />
                                        <span>Other Ways to Share</span>
                                    </Button>
                                )}

                                {/* Social Icons Row at the Bottom */}
                                <div className="pt-4 pb-2 flex flex-col items-center gap-3 mt-auto w-full overflow-hidden shrink-0">
                                    <div className="flex items-center gap-3 w-full px-2">
                                        <div className="h-px bg-border flex-1"></div>
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Quick Social</span>
                                        <div className="h-px bg-border flex-1"></div>
                                    </div>
                                    <div className="flex items-center justify-center gap-4 w-full px-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="size-10 rounded-full border-muted-foreground/10 hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all bg-card"
                                            onClick={() => handleSocialShare('whatsapp')}
                                            title="WhatsApp"
                                        >
                                            <MessageCircle className="h-5 w-5" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="size-10 rounded-full border-muted-foreground/10 hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2] transition-all bg-card"
                                            onClick={() => handleSocialShare('twitter')}
                                            title="X (Twitter)"
                                        >
                                            <Twitter className="h-5 w-5" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="size-10 rounded-full border-muted-foreground/10 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all bg-card"
                                            onClick={() => handleSocialShare('facebook')}
                                            title="Facebook"
                                        >
                                            <Facebook className="h-5 w-5" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="size-10 rounded-full border-muted-foreground/10 hover:bg-primary hover:text-white hover:border-primary transition-all bg-card"
                                            onClick={() => handleSocialShare('native')}
                                            title="More"
                                        >
                                            <Share2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default ShareModal;
