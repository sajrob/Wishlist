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
    Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSharing } from '../hooks/useSharing';
import { fetchMutualFriends } from '../utils/supabaseHelpers';
import { useAuth } from '../context/AuthContext';
import { Profile } from '../types';
import { toast } from 'sonner';

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
                                <Globe className="w-3.5 h-3.5" />
                                External
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 min-h-[360px] w-full relative overflow-y-auto overflow-x-hidden custom-scrollbar">
                        <TabsContent value="friends" className="p-6 m-0 h-full flex flex-col data-[state=inactive]:hidden">
                            <div className="flex-1 overflow-hidden flex flex-col">
                                <h3 className="text-sm font-medium mb-3 text-muted-foreground">Select mutual friends</h3>
                                {loadingFriends ? (
                                    <div className="flex items-center justify-center p-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </div>
                                ) : friends.length === 0 ? (
                                    <div className="text-center p-8 text-muted-foreground bg-muted/20 rounded-lg">
                                        <p>No mutual friends found.</p>
                                        <p className="text-xs mt-1">Connect with more people to share internally!</p>
                                    </div>
                                ) : (
                                    <ScrollArea className="flex-1 pr-4">
                                        <div className="space-y-3">
                                            {friends.map(friend => (
                                                <div key={friend.id} className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                                                    <Checkbox
                                                        id={`friend-${friend.id}`}
                                                        checked={selectedFriends.includes(friend.id)}
                                                        onCheckedChange={() => toggleFriend(friend.id)}
                                                    />
                                                    <Label
                                                        htmlFor={`friend-${friend.id}`}
                                                        className="flex-1 flex items-center cursor-pointer font-normal"
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs mr-3">
                                                            {friend.first_name?.[0] || friend.full_name?.[0]}
                                                        </div>
                                                        <span>{friend.full_name}</span>
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                )}
                            </div>
                            <Button
                                className="w-full mt-4"
                                disabled={selectedFriends.length === 0 || sharingToFriends}
                                onClick={handleInternalShare}
                            >
                                {sharingToFriends ? "Sending..." : `Send to ${selectedFriends.length} Friend${selectedFriends.length !== 1 ? 's' : ''}`}
                            </Button>
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
