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
    editingCategory = null,
}: Omit<CreateCategoryModalProps, 'onClose'>) => {
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
        <Card className="border-none shadow-none w-full max-w-[600px] overflow-hidden">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold">
                    {editingCategory ? 'Edit Wishlist' : 'Create Wishlist'}
                </CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="categoryName">Wishlist Name</Label>
                        <Input
                            id="categoryName"
                            value={categoryName}
                            onChange={e => setCategoryName(e.target.value)}
                            placeholder="e.g., Birthday, Christmas, Dream Home"
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                        <div className="space-y-0.5">
                            <Label htmlFor="cat-is-public" className="text-base">Public Wishlist</Label>
                            <p className="text-sm text-muted-foreground">
                                Allow friends to see this wishlist
                            </p>
                        </div>
                        <Switch
                            id="cat-is-public"
                            checked={isPublic}
                            onCheckedChange={setIsPublic}
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-base">Select Items</Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleSelectAll}
                                className="h-8 text-xs text-primary hover:text-primary hover:bg-primary/10"
                            >
                                {selectedItems.size === items.length ? 'Deselect All' : 'Select All'}
                            </Button>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search your items..."
                                className="pl-9 h-9 text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <ScrollArea className="h-[200px] rounded-md border p-4 bg-muted/10">
                            {filteredItems.length === 0 ? (
                                <p className="text-center text-muted-foreground text-sm py-8">
                                    {searchQuery ? "No matching items found." : "No items available. Add items first."}
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {filteredItems.map(item => (
                                        <label
                                            key={item.id}
                                            className="flex items-center space-x-3 space-y-0 cursor-pointer p-2 rounded-md hover:bg-muted/50 transition-colors"
                                        >
                                            <Checkbox
                                                checked={selectedItems.has(item.id)}
                                                onCheckedChange={() => handleToggleItem(item.id)}
                                            />
                                            <span className="text-sm font-medium leading-none">
                                                {item.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </CardContent>
                <CardFooter className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" className="flex-1 font-semibold" disabled={!categoryName.trim()}>
                        {editingCategory ? 'Save Changes' : 'Create Wishlist'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default CreateCategoryModal;


