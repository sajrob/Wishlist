/**
 * WishlistForm component that provides a form for adding or editing wishlist items.
 * Includes features like automatic product detail scraping and currency selection.
 */
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { CurrencySelect, CURRENCIES } from './CurrencySelect';
import type { ItemFormData, WishlistFormProps } from '../types';
import { toast } from "sonner";
import { Loader2, Link2, Sparkles } from "lucide-react";

const initialForm: ItemFormData = {
    name: '',
    price: '',
    description: '',
    image_url: '',
    buy_link: '',
    is_must_have: false,
    is_received: false,
    currency: 'USD',
};

const WishlistForm = ({ onSubmit, onClose, editingItem = null }: WishlistFormProps) => {
    const [formData, setFormData] = useState<ItemFormData>(initialForm);
    const [isScraping, setIsScraping] = useState(false);

    const handleScrape = async (url: string) => {
        if (!url || !url.startsWith('http')) return;

        setIsScraping(true);
        const promise = (async () => {
            // Get current session for Auth token
            const { data: { session } } = await import('../supabaseClient').then(m => m.supabase.auth.getSession());
            const token = session?.access_token;

            const res = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`, {
                headers: token ? {
                    'Authorization': `Bearer ${token}`
                } : undefined
            });

            // Check content type to catch Vite returning index.html for unknown routes
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("text/html")) {
                throw new Error("API not running? Try: npx vercel dev");
            }

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `Error ${res.status}`);
            }

            const data = await res.json();

            setFormData(prev => ({
                ...prev,
                name: data.title || prev.name,
                description: data.description || prev.description,
                image_url: data.image || prev.image_url,
                price: data.price || prev.price,
                currency: data.currency || prev.currency,
                buy_link: url
            }));
            return data;
        })();

        toast.promise(promise, {
            loading: 'Fetching item details...',
            success: (data) => `Magically filled: ${data.title || 'Item details'}`,
            error: (err) => err.message || 'Could not fetch details automatically',
        });

        try {
            await promise;
        } catch (e) {
            // Error handled by toast.promise
        } finally {
            setIsScraping(false);
        }
    };

    useEffect(() => {
        if (editingItem) {
            setFormData({
                name: editingItem.name || '',
                price: editingItem.price || '',
                description: editingItem.description || '',
                image_url: editingItem.image_url || '',
                buy_link: editingItem.buy_link || '',
                is_must_have: editingItem.is_must_have || false,
                is_received: editingItem.is_received || false,
                currency: editingItem.currency || 'USD',
            });
        } else {
            setFormData(initialForm);
        }
    }, [editingItem]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        // If pasting into buy_link and it's a URL, try scraping
        if (name === 'buy_link' && value.length > 10 && value.startsWith('http') && !editingItem) {
            // We use a small delay or check if it looks like a full URL
            if (value.includes('.') && (value.endsWith('/') || value.split('/').length > 3)) {
                // Potential auto-scrape trigger removed to avoid too many calls on typing
                // Instead, we'll use a better approach with a button or onBlur
            }
        }
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            is_must_have: checked,
        }));
    };

    const handleReceivedChange = (checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            is_received: checked,
        }));
    };

    const handleCurrencyChange = (currencyCode: string) => {
        setFormData(prev => ({
            ...prev,
            currency: currencyCode,
        }));
    };

    const selectedCurrency = React.useMemo(() =>
        CURRENCIES.find(c => c.code === formData.currency) || CURRENCIES.find(c => c.code === 'USD'),
        [formData.currency]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name.trim()) {
            await onSubmit(formData);
            setFormData(initialForm);
        }
    };

    return (
        <Card className="border-none shadow-none w-full max-w-[550px] overflow-hidden">
            <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-lg font-bold">
                    {editingItem ? 'Edit Item' : 'Add New Item'}
                </CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-3.5 pt-2">
                    {/* URL Input (Magic Scrape) */}
                    <div className="space-y-1">
                        <Label htmlFor="buy_link" className="text-xs flex items-center gap-1.5">
                            <Link2 className="w-3 h-3" />
                            Product URL (Optional)
                            <span className="text-[10px] text-primary font-normal ml-auto flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                                Auto-fills details
                            </span>
                        </Label>
                        <div className="relative">
                            <Input
                                id="buy_link"
                                name="buy_link"
                                type="url"
                                value={formData.buy_link}
                                onChange={handleChange}
                                onBlur={(e) => {
                                    if (!editingItem && e.target.value.startsWith('http') && !formData.name) {
                                        handleScrape(e.target.value);
                                    }
                                }}
                                placeholder="Paste link here (Amazon, Etsy, etc.)"
                                className={`h-9 text-sm pr-9 transition-all ${isScraping ? 'border-primary/50 ring-1 ring-primary/20' : ''}`}
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                {isScraping ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                ) : (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 hover:bg-transparent"
                                        onClick={() => handleScrape(formData.buy_link)}
                                        disabled={!formData.buy_link.startsWith('http')}
                                    >
                                        <Sparkles className={`w-4 h-4 ${formData.buy_link.startsWith('http') ? 'text-amber-500' : 'text-muted-foreground/30'}`} />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="relative py-1">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-muted-foreground/10" />
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase">
                            <span className="bg-background px-2 text-muted-foreground/50 font-medium">Item Details</span>
                        </div>
                    </div>

                    {/* Row 1: Item Name and Options */}
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                        <div className="flex-1 w-full space-y-1">
                            <Label htmlFor="name" className="text-xs">Item Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Item name"
                                className="h-8 text-sm"
                                required
                            />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <div className="flex flex-1 sm:w-[100px] items-center justify-between px-2 border rounded-lg bg-muted/5 h-8">
                                <Label htmlFor="is_must_have" className="text-[11px] font-medium cursor-pointer truncate mr-1">Must Have</Label>
                                <Switch
                                    id="is_must_have"
                                    className="scale-65 origin-right"
                                    checked={formData.is_must_have}
                                    onCheckedChange={handleSwitchChange}
                                />
                            </div>
                            {editingItem && (
                                <div className="flex flex-1 sm:w-[100px] items-center justify-between px-2 border rounded-lg bg-muted/5 h-8">
                                    <Label htmlFor="is_received" className="text-[11px] font-medium cursor-pointer truncate mr-1">Received</Label>
                                    <Switch
                                        id="is_received"
                                        className="scale-65 origin-right data-[state=checked]:bg-emerald-500"
                                        checked={formData.is_received}
                                        onCheckedChange={handleReceivedChange}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Row 2: Price (Full Width) */}
                    <div className="space-y-1">
                        <Label htmlFor="price" className="text-xs">Price</Label>
                        <div className="flex -space-x-px w-full">
                            <div className="w-[110px] shrink-0">
                                <CurrencySelect
                                    value={formData.currency}
                                    onValueChange={handleCurrencyChange}
                                    variant="small"
                                />
                            </div>
                            <div className="relative flex-1">
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="h-8 pr-7 text-sm rounded-l-none focus:z-10"
                                    required
                                />
                                {selectedCurrency && (
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-sm opacity-50">
                                        {selectedCurrency.symbol}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="description" className="text-xs">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Add details like size or color..."
                            rows={2}
                            className="resize-none text-sm min-h-[60px]"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="image_url" className="text-xs">Image URL (Optional)</Label>
                        <Input
                            id="image_url"
                            name="image_url"
                            type="url"
                            value={formData.image_url}
                            onChange={handleChange}
                            placeholder="https://..."
                            className="h-8 text-sm"
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex gap-2 pt-2 pb-4">
                    <Button type="button" variant="outline" size="sm" className="flex-1 h-9" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" size="sm" className="flex-1 h-9 font-semibold">
                        {editingItem ? 'Update Item' : 'Add Item'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default WishlistForm;
