import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { CurrencySelect, CURRENCIES, type Currency } from './CurrencySelect';
import type { ItemFormData, WishlistFormProps } from '../types';

const initialForm: ItemFormData = {
    name: '',
    price: '',
    description: '',
    image_url: '',
    buy_link: '',
    is_must_have: false,
    currency: 'USD',
};

const WishlistForm = ({ onSubmit, onClose, editingItem = null }: WishlistFormProps) => {
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
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            is_must_have: checked,
        }));
    };

    const handleCurrencyChange = (currencyCode: string) => {
        setFormData(prev => ({
            ...prev,
            currency: currencyCode,
        }));
    };

    const selectedCurrency = CURRENCIES.find(c => c.code === formData.currency) || CURRENCIES.find(c => c.code === 'USD');

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
                    {/* Row 1: Item Name (2/3) and Must Have (1/3) */}
                    <div className="grid grid-cols-3 gap-3 items-end">
                        <div className="col-span-2 space-y-1">
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
                        <div className="col-span-1">
                            <div className="flex items-center justify-between px-2 border rounded-lg bg-muted/5 h-8">
                                <Label htmlFor="is_must_have" className="text-[11px] font-medium cursor-pointer truncate mr-1">Must Have</Label>
                                <Switch
                                    id="is_must_have"
                                    className="scale-65 origin-right"
                                    checked={formData.is_must_have}
                                    onCheckedChange={handleSwitchChange}
                                />
                            </div>
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

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="image_url" className="text-xs">Image URL</Label>
                            <Input
                                id="image_url"
                                name="image_url"
                                type="url"
                                value={formData.image_url}
                                onChange={handleChange}
                                placeholder="https://..."
                                className="h-8 text-sm"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="buy_link" className="text-xs">Shop Link</Label>
                            <Input
                                id="buy_link"
                                name="buy_link"
                                type="url"
                                value={formData.buy_link}
                                onChange={handleChange}
                                placeholder="https://..."
                                className="h-8 text-sm"
                                required
                            />
                        </div>
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


