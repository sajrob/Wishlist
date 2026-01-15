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
    ExternalLink
} from 'lucide-react';
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
            <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-xl">Share {displayOwnerName} {categoryName}</DialogTitle>
                    <DialogDescription>
                        Choose how you'd like to share this wishlist.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="friends" className="w-full">
                    <TabsList className="w-full grid grid-cols-2 rounded-none bg-muted/50 border-y">
                        <TabsTrigger value="friends" className="rounded-none py-3">Friends</TabsTrigger>
                        <TabsTrigger value="external" className="rounded-none py-3">External</TabsTrigger>
                    </TabsList>

                    <TabsContent value="friends" className="p-6 m-0 h-[300px] flex flex-col">
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

                    <TabsContent value="external" className="p-6 m-0 space-y-6">
                        <div className="space-y-3">
                            <Label className="text-sm font-medium text-muted-foreground">Wishlist Link</Label>
                            <div className="flex gap-2">
                                <Input
                                    readOnly
                                    value={shareUrl}
                                    className="bg-muted/30 border-muted-foreground/20"
                                />
                                <Button size="icon" variant="outline" onClick={handleCopyLink}>
                                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-sm font-medium text-muted-foreground">Share to social</Label>
                            <div className="grid grid-cols-4 gap-4">
                                <Button
                                    variant="outline"
                                    className="flex-col h-auto py-4 gap-2 hover:bg-[#25D366] hover:text-white hover:border-[#25D366]"
                                    onClick={() => handleSocialShare('whatsapp')}
                                >
                                    <MessageCircle className="h-5 w-5" />
                                    <span className="text-[10px]">WhatsApp</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-col h-auto py-4 gap-2 hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2]"
                                    onClick={() => handleSocialShare('twitter')}
                                >
                                    <Twitter className="h-5 w-5" />
                                    <span className="text-[10px]">X (Twitter)</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-col h-auto py-4 gap-2 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]"
                                    onClick={() => handleSocialShare('facebook')}
                                >
                                    <Facebook className="h-5 w-5" />
                                    <span className="text-[10px]">Facebook</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-col h-auto py-4 gap-2 hover:bg-[#0085FF] hover:text-white hover:border-[#0085FF]"
                                    onClick={() => handleSocialShare('bluesky')}
                                >
                                    <Share2 className="h-5 w-5" />
                                    <span className="text-[10px]">Bluesky</span>
                                </Button>
                            </div>

                            {navigator.share && (
                                <Button
                                    variant="secondary"
                                    className="w-full gap-2"
                                    onClick={() => handleSocialShare('native')}
                                >
                                    <Share2 className="h-4 w-4" />
                                    Open Native Share Sheet
                                </Button>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default ShareModal;
