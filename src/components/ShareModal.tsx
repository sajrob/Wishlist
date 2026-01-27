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
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Copy,
    Check,
    Share2,
    Facebook,
    Twitter,
    MessageCircle,
    ExternalLink,
    Gift,
    Users,
    Search,
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
            {/* Added fixed h-[85vh] and flex-col to contain the button at the bottom */}
            <DialogContent className="w-[92vw] max-w-md p-0 overflow-hidden rounded-[32px] sm:rounded-xl shadow-2xl border-none h-[85vh] max-h-[640px] flex flex-col">

                <DialogHeader className="p-6 pb-2 bg-gradient-to-b from-blue-50/50 to-transparent shrink-0">
                    <DialogTitle className="text-xl text-blue-900 flex items-center gap-2">
                        <Gift className="w-5 h-5 text-blue-600" />
                        Share {displayOwnerName} {categoryName}
                    </DialogTitle>
                    <DialogDescription>
                        Choose how you'd like to share this wishlist.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="friends" className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <div className="px-6 py-2 bg-blue-50/30 border-y shrink-0">
                        <TabsList className="w-full h-11 bg-blue-50/30 p-1.5 rounded-xl border-none">
                            <TabsTrigger
                                value="friends"
                                className="flex-1 py-2 gap-2 text-xs font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-white"
                            >
                                <Users className="w-3.5 h-3.5" />
                                Friends
                            </TabsTrigger>
                            <TabsTrigger
                                value="external"
                                className="flex-1 rounded-lg py-2 gap-2 text-xs font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-white"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Share to App
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 relative flex flex-col min-h-0 overflow-hidden">
                        {/* FRIENDS TAB CONTENT */}
                        <TabsContent value="friends" className="flex-1 flex flex-col m-0 p-0 min-h-0 data-[state=inactive]:hidden">
                            <div className="p-5 border-b bg-muted/5 flex items-center justify-between shrink-0">
                                <div>
                                    <h3 className="text-[13px] font-bold text-foreground">Select mutual friends</h3>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Only mutual follows</p>
                                </div>
                                <div className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-full">
                                    {selectedFriends.length} selected
                                </div>
                            </div>

                            {friends.length > 5 && (
                                <div className="px-5 py-3 bg-muted/5 border-b shrink-0">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                        <Input
                                            placeholder="Search friends..."
                                            className="h-9 pl-9 text-xs rounded-xl"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex-1 min-h-0 overflow-hidden">
                                {loadingFriends ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-3">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        <p className="text-xs font-bold text-muted-foreground">FINDING FRIENDS...</p>
                                    </div>
                                ) : friends.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                        <Users className="size-10 text-muted-foreground/30 mb-2" />
                                        <p className="font-bold text-sm">No mutual friends found</p>
                                    </div>
                                ) : (
                                    <ScrollArea className="h-full">
                                        <div className="p-4 space-y-2">
                                            {friends
                                                .filter(f => f.full_name?.toLowerCase().includes(searchQuery.toLowerCase()))
                                                .map(friend => {
                                                    const isSelected = selectedFriends.includes(friend.id);
                                                    return (
                                                        <div
                                                            key={friend.id}
                                                            onClick={() => toggleFriend(friend.id)}
                                                            className={cn(
                                                                "flex items-center gap-3 p-2 pr-4 rounded-full border transition-all cursor-pointer",
                                                                isSelected ? "bg-primary/10 border-primary/40" : "bg-card border-muted-foreground/10"
                                                            )}
                                                        >
                                                            <Avatar className="size-9">
                                                                <AvatarImage src={friend.avatar_url} />
                                                                <AvatarFallback>{getInitials(friend.full_name || "")}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-bold text-[12px] truncate leading-tight">{friend.full_name}</p>
                                                                <p className="text-[9px] text-muted-foreground font-semibold flex items-center gap-1 mt-0.5 uppercase tracking-tight">
                                                                    <div className="size-1 rounded-full bg-green-500" /> Mutual
                                                                </p>
                                                            </div>
                                                            <div className={cn(
                                                                "size-5 rounded-full border-2 flex items-center justify-center transition-all",
                                                                isSelected ? "bg-primary border-primary" : "border-muted-foreground/20"
                                                            )}>
                                                                {isSelected && <Check className="size-3 text-white stroke-[3px]" />}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </ScrollArea>
                                )}
                            </div>

                            {/* Pinned Action Button */}
                            <div className="p-4 bg-background border-t shrink-0 pb-6 sm:pb-4">
                                <Button
                                    className="w-full h-12 rounded-[18px] font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all gap-2"
                                    disabled={selectedFriends.length === 0 || sharingToFriends}
                                    onClick={handleInternalShare}
                                >
                                    {sharingToFriends ? "Sending..." : `Share with ${selectedFriends.length} Friend${selectedFriends.length !== 1 ? 's' : ''}`}
                                </Button>
                            </div>
                        </TabsContent>

                        {/* EXTERNAL TAB CONTENT */}
                        <TabsContent value="external" className="flex-1 m-0 p-5 overflow-y-auto min-h-0 data-[state=inactive]:hidden flex flex-col">
                            <div className="space-y-4 flex-1">
                                <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 flex items-center gap-3 shrink-0">
                                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                        <Gift className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[9px] uppercase tracking-wider font-bold text-primary/80">Public Link</p>
                                        <p className="font-semibold truncate text-[13px] leading-tight">{displayOwnerName} {categoryName}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Wishlist Link</Label>
                                    <div className="flex gap-2 p-1 bg-muted/30 border rounded-lg focus-within:ring-1 focus-within:ring-primary overflow-hidden">
                                        <Input
                                            readOnly
                                            value={shareUrl}
                                            className="bg-transparent border-none focus-visible:ring-0 h-8 text-xs shadow-none flex-1 truncate px-2"
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

                                <div className="flex flex-col gap-3 pt-4 border-t">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground text-center">Quick Social</span>
                                    <div className="flex items-center justify-center gap-4">
                                        <Button variant="outline" size="icon" className="size-10 rounded-full hover:bg-[#25D366] hover:text-white" onClick={() => handleSocialShare('whatsapp')}>
                                            <MessageCircle className="h-5 w-5" />
                                        </Button>
                                        <Button variant="outline" size="icon" className="size-10 rounded-full hover:bg-[#1DA1F2] hover:text-white" onClick={() => handleSocialShare('twitter')}>
                                            <Twitter className="h-5 w-5" />
                                        </Button>
                                        <Button variant="outline" size="icon" className="size-10 rounded-full hover:bg-[#1877F2] hover:text-white" onClick={() => handleSocialShare('facebook')}>
                                            <Facebook className="h-5 w-5" />
                                        </Button>
                                        <Button variant="outline" size="icon" className="size-10 rounded-full hover:bg-primary hover:text-white" onClick={() => handleSocialShare('native')}>
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