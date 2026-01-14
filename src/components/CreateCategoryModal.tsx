/**
 * CreateCategoryModal component that provides a modal interface for creating or editing categories/wishlists.
 * Users can name the category, set its privacy, and associate existing items with it.
 */
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Search } from "lucide-react";
import type { CreateCategoryModalProps } from '../types';

const CreateCategoryModal = ({
    items,
    onCreateCategory,
    onUpdateCategory,
    onClose,
    editingCategory = null,
}: CreateCategoryModalProps) => {
    const [categoryName, setCategoryName] = useState('');
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [isPublic, setIsPublic] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (editingCategory) {
            setCategoryName(editingCategory.name);
            setSelectedItems(new Set(editingCategory.itemIds));
            setIsPublic(editingCategory.is_public || false);
        } else {
            setCategoryName('');
            setSelectedItems(new Set());
            setIsPublic(false);
        }
    }, [editingCategory]);

    const handleToggleItem = (itemId: string) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedItems.size === items.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(items.map(item => item.id)));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (categoryName.trim()) {
            if (editingCategory) {
                await onUpdateCategory({
                    id: editingCategory.id,
                    name: categoryName.trim(),
                    itemIds: Array.from(selectedItems),
                    is_public: isPublic,
                });
            } else {
                await onCreateCategory({
                    name: categoryName.trim(),
                    itemIds: Array.from(selectedItems),
                    is_public: isPublic,
                });
            }
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Card className="border-none shadow-none w-full max-w-[450px] overflow-hidden">
            <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-lg font-bold">
                    {editingCategory ? 'Edit Wishlist' : 'Create Wishlist'}
                </CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="categoryName" className="text-sm">Wishlist Name</Label>
                        <Input
                            id="categoryName"
                            value={categoryName}
                            onChange={e => setCategoryName(e.target.value)}
                            placeholder="e.g., Birthday, Christmas"
                            className="h-9"
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between p-2.5 border rounded-lg bg-muted/20">
                        <div className="space-y-0.5">
                            <Label htmlFor="cat-is-public" className="text-sm">Public Wishlist</Label>
                            <p className="text-[11px] text-muted-foreground">
                                Allow friends to see this wishlist
                            </p>
                        </div>
                        <Switch
                            id="cat-is-public"
                            className="scale-90"
                            checked={isPublic}
                            onCheckedChange={setIsPublic}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm">Add Items (Optional)</Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleSelectAll}
                                className="h-6 px-2 text-[10px] text-primary hover:text-primary hover:bg-primary/5"
                            >
                                {selectedItems.size === items.length ? 'Deselect All' : 'Select All'}
                            </Button>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Search items..."
                                className="pl-8 h-8 text-xs"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <ScrollArea className="h-[140px] rounded-md border p-2 bg-muted/5">
                            {filteredItems.length === 0 ? (
                                <p className="text-center text-muted-foreground text-[11px] py-4">
                                    {searchQuery ? "No matching items found." : "No items available yet."}
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 gap-1">
                                    {filteredItems.map(item => (
                                        <label
                                            key={item.id}
                                            className="flex items-center space-x-2 space-y-0 cursor-pointer p-1.5 rounded-md hover:bg-muted/50 transition-colors"
                                        >
                                            <Checkbox
                                                checked={selectedItems.has(item.id)}
                                                onCheckedChange={() => handleToggleItem(item.id)}
                                                className="h-3.5 w-3.5"
                                            />
                                            <span className="text-[13px] font-medium truncate">
                                                {item.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </CardContent>
                <CardFooter className="flex gap-2 pt-2 pb-4">
                    <Button type="button" variant="outline" size="sm" className="flex-1 h-9" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" size="sm" className="flex-1 h-9 font-semibold" disabled={!categoryName.trim()}>
                        {editingCategory ? 'Save Changes' : 'Create Wishlist'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default CreateCategoryModal;


