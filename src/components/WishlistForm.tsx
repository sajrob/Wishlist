import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import type { ItemFormData, WishlistFormProps } from '../types';

const initialForm: ItemFormData = {
    name: '',
    price: '',
    description: '',
    image_url: '',
    buy_link: '',
    is_must_have: false,
};

const WishlistForm = ({ onSubmit, editingItem = null }: Omit<WishlistFormProps, 'onClose'>) => {
    const [formData, setFormData] = useState<ItemFormData>(initialForm);

    useEffect(() => {
        if (editingItem) {
            setFormData({
                name: editingItem.name || '',
                price: editingItem.price || '',
                description: editingItem.description || '',
                image_url: editingItem.image_url || '',
                buy_link: editingItem.buy_link || '',
                is_must_have: editingItem.is_must_have || false,
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
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            is_must_have: checked,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name.trim()) {
            await onSubmit(formData);
            setFormData(initialForm);
        }
    };

    return (
        <Card className="border-none shadow-none w-full max-w-[600px] overflow-hidden">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold">
                    {editingItem ? 'Edit item' : 'Add new item'}
                </CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Item Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="What's it called?"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Price ($)</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Why do you want this? Add size, color, or other details."
                            rows={3}
                            className="resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="image_url">Image URL</Label>
                        <Input
                            id="image_url"
                            name="image_url"
                            type="url"
                            value={formData.image_url}
                            onChange={handleChange}
                            placeholder="https://example.com/item-photo.jpg"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="buy_link">Shop Link</Label>
                        <Input
                            id="buy_link"
                            name="buy_link"
                            type="url"
                            value={formData.buy_link}
                            onChange={handleChange}
                            placeholder="https://amazon.com/item-link"
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                        <div className="space-y-0.5">
                            <Label htmlFor="is_must_have" className="text-base">Must Have</Label>
                            <p className="text-sm text-muted-foreground">
                                Prioritize this item in your wishlist
                            </p>
                        </div>
                        <Switch
                            id="is_must_have"
                            checked={formData.is_must_have}
                            onCheckedChange={handleSwitchChange}
                        />
                    </div>
                </CardContent>
                <CardFooter className="pt-2">
                    <Button type="submit" className="w-full h-11 text-base font-semibold">
                        {editingItem ? 'Update Item' : 'Add to Wishlist'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default WishlistForm;


