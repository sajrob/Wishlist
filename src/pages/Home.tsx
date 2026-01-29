/**
 * Home page component that serves as the main dashboard for users to manage their wishlists
 * and items. It provides functionality for adding, editing, and deleting items and categories.
 */
import React, { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import { Plus, Share2, Pencil, Trash2, Globe, Lock, MoreHorizontal } from "lucide-react";
import { confirmDelete } from "../utils/toastHelpers";
import { WelcomeModal } from "../components/welcomeModal";
import WishlistCard from "../components/WishlistCard";
import WishlistForm from "../components/WishlistForm";
import CreateCategoryModal from "../components/CreateCategoryModal";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import ShareModal from '../components/ShareModal';
import { AppSidebar } from "../components/AppSidebar";
import { WishlistCardSkeleton } from "../components/WishlistCardSkeleton";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "../context/AuthContext";
import { useFilteredItems } from "../hooks/useWishlistData";
import { useWishlistContext } from "../context/WishlistContext";
import { useCategories } from "../hooks/useCategories";
import { useWishlistSettings } from "../hooks/useWishlistSettings";
import { useItems } from "../hooks/useItems";
import type { Category, WishlistItem, ItemFormData } from "../types";
import { Switch } from "@/components/ui/switch";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import "../App.css";
import "./Home.css";

function Home() {
    const { user } = useAuth();
    const location = useLocation();

    const { allItems, categories, loading, refresh: refetch } =
        useWishlistContext();
    const { isPublic, togglePublic } = useWishlistSettings(user?.id || null);
    const {
        createCategory,
        updateCategory,
        deleteCategory,
        toggleCategoryPrivacy,
    } = useCategories(user?.id || "");
    const { createItem, updateItem, deleteItem } = useItems(user?.id);

    const [activeCategory, setActiveCategory] = useState<string | null>(
        location.state?.categoryId || null
    );
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
    const [editingCategory, setEditingCategory] = useState<
        (Category & { itemIds?: string[] }) | null
    >(null);
    const [isTooltipOpen, setIsTooltipOpen] = useState(false);

    const wishlistItems = useFilteredItems(allItems as WishlistItem[], activeCategory);

    const handleTogglePublic = async () => {
        await togglePublic();
    };

    const handleAddItem = async (newItem: ItemFormData) => {
        if (!user) return;

        await createItem({
            user_id: user.id,
            category_id: activeCategory,
            name: newItem.name,
            price: parseFloat(newItem.price as string) || 0,
            description: newItem.description,
            image_url: newItem.image_url,
            buy_link: newItem.buy_link,
            is_must_have: newItem.is_must_have || false,
            currency: newItem.currency || 'USD',
        });

        setIsFormOpen(false);
    };

    const handleEditItem = (item: WishlistItem) => {
        setEditingItem(item);
        setIsFormOpen(true);
    };

    const handleUpdateItem = async (formData: ItemFormData) => {
        if (!editingItem) return;

        await updateItem({
            itemId: editingItem.id,
            updates: {
                name: formData.name,
                price: parseFloat(formData.price as string) || 0,
                description: formData.description,
                image_url: formData.image_url,
                buy_link: formData.buy_link,
                is_must_have: formData.is_must_have || false,
                currency: formData.currency || 'USD',
            }
        });

        setIsFormOpen(false);
        setEditingItem(null);
    };

    const handleToggleMustHave = async (itemId: string, isMustHave: boolean) => {
        await updateItem({
            itemId,
            updates: { is_must_have: isMustHave }
        });
    };

    const handleDeleteItem = async (itemId: string) => {
        const itemToDelete = (allItems as WishlistItem[]).find((i) => i.id === itemId);

        if (activeCategory) {
            confirmDelete({
                title: "Remove from Wishlist?",
                description: `"${itemToDelete?.name || "this item"}" will be removed from this wishlist but will still be available in "All Items".`,
                deleteLabel: "Remove",
                onDelete: async () => {
                    await updateItem({
                        itemId,
                        updates: { category_id: null }
                    });
                    toast.success("Item removed from wishlist");
                },
            });
        } else {
            confirmDelete({
                title: "Permanently Delete?",
                description: `This will completely remove "${itemToDelete?.name || "this item"}" from your account.`,
                deleteLabel: "Delete Permanently",
                onDelete: async () => {
                    await deleteItem(itemId);
                },
            });
        }
    };

    const handleCreateCategory = async (categoryData: {
        name: string;
        itemIds?: string[];
        is_public: boolean;
    }) => {
        const data = await createCategory(categoryData as any);

        if (data && !data.is_public && categories.length < 4) {
            setIsTooltipOpen(true);
            setTimeout(() => setIsTooltipOpen(false), 10000);
        }

        if (data) {
            setActiveCategory(data.id);
        }
        setIsCategoryModalOpen(false);
    };

    const handleUpdateCategory = async (categoryData: any) => {
        await updateCategory(categoryData.id, categoryData);
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
    };

    const handleDeleteCategory = async (categoryId: string) => {
        const catToDelete = categories.find((c) => c.id === categoryId);

        confirmDelete({
            title: "Delete this category?",
            description: `Items in "${catToDelete?.name || "this category"}" will be moved to "All Items".`,
            onDelete: async () => {
                await deleteCategory(categoryId);

                if (activeCategory === categoryId) {
                    setActiveCategory(null);
                }
            },
        });
    };

    const handleToggleCategoryPrivacy = async (
        categoryId: string,
        currentIsPublic: boolean
    ) => {
        await toggleCategoryPrivacy(
            categoryId,
            currentIsPublic
        );
    };

    const handleEditCategory = (category: Category) => {
        const itemsInCategory = allItems
            .filter((item) => item.category_id === category.id)
            .map((item) => item.id);

        setEditingCategory({
            ...category,
            itemIds: itemsInCategory,
        });
        setIsCategoryModalOpen(true);
    };

    const handleOpenForm = () => {
        setEditingItem(null);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingItem(null);
    };

    const handleOpenCategoryModal = () => {
        setEditingCategory(null);
        setIsCategoryModalOpen(true);
    };

    const handleCloseCategoryModal = () => {
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
    };

    const isModalOpen = isFormOpen || isCategoryModalOpen || isShareModalOpen;

    if (loading && !user)
        return (
            <div className="flex-center" style={{ height: "80vh" }}>
                <LoadingSpinner />
            </div>
        );

    const activeCategoryName = categories.find(
        (c) => c.id === activeCategory
    )?.name;

    return (
        <SidebarProvider className="min-h-0 h-[calc(100vh-64px)]">
            <AppSidebar
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                onCreateCategory={handleOpenCategoryModal}
                categories={categories}
                loading={loading}
            />
            <SidebarInset className="flex flex-col bg-background overflow-hidden border-l">
                <header className="sticky top-0 z-20 flex flex-col md:flex-row h-auto md:h-16 shrink-0 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-foreground px-6 py-2.5 md:py-0 shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-4 w-full">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="-ml-1 h-11 w-11 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" />
                            <Separator orientation="vertical" className="h-5 mx-1" />
                        </div>

                        <div className="flex flex-1 flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4 min-w-0">
                            {/* Context Section */}
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="flex flex-col">
                                    <h1 className="text-lg md:text-xl font-bold tracking-tight text-foreground truncate flex items-center gap-2">
                                        {activeCategory ? `${activeCategoryName} Wishlist` : "All Items"}
                                        <span className="flex items-center justify-center bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[11px] font-bold border border-primary/20 tabular-nums">
                                            {wishlistItems.length}
                                        </span>
                                    </h1>
                                </div>
                            </div>

                            {/* Actions Section */}
                            <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
                                <div className="flex items-center gap-3">
                                    {!activeCategory ? (
                                        <div className="flex items-center gap-2.5 bg-muted/50 border border-border px-3 h-10 rounded-xl">
                                            <div className="flex items-center gap-1.5 grayscale opacity-70 text-foreground">
                                                {isPublic ? <Globe className="size-3.5" /> : <Lock className="size-3.5" />}
                                                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">
                                                    {isPublic ? "Public" : "Private"}
                                                </span>
                                            </div>
                                            <Switch
                                                checked={isPublic}
                                                onCheckedChange={handleTogglePublic}
                                                className="scale-90 data-[state=checked]:bg-primary"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            {(() => {
                                                const cat = categories.find((c) => c.id === activeCategory);
                                                if (!cat) return null;
                                                return (
                                                    <>
                                                        {/* Privacy Button */}
                                                        <button
                                                            onClick={() => handleToggleCategoryPrivacy(cat.id, cat.is_public)}
                                                            className={`flex items-center gap-2 px-3 h-11 rounded-xl border transition-all active:scale-95 ${cat.is_public
                                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                                                : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                                                                }`}
                                                        >
                                                            {cat.is_public ? <Globe className="size-3.5" /> : <Lock className="size-3.5" />}
                                                            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">
                                                                {cat.is_public ? "Public" : "Private"}
                                                            </span>
                                                        </button>

                                                        {/* Desktop Actions */}
                                                        <div className="hidden lg:flex items-center gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-11 px-4 gap-2 rounded-xl border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all font-bold text-[11px] uppercase tracking-wider"
                                                                onClick={() => handleEditCategory(cat)}
                                                            >
                                                                <Pencil className="size-4" />
                                                                <span>Edit</span>
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-11 px-4 gap-2 rounded-xl border-primary/20 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all font-bold text-[11px] uppercase tracking-wider shadow-none"
                                                                onClick={() => setIsShareModalOpen(true)}
                                                            >
                                                                <Share2 className="size-4" />
                                                                <span>Share</span>
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-11 w-11 rounded-xl border-destructive/20 text-destructive hover:bg-destructive hover:text-white transition-all shadow-none"
                                                                onClick={() => handleDeleteCategory(cat.id)}
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        </div>

                                                        {/* Mobile/Tablet Actions */}
                                                        <div className="lg:hidden">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-border bg-muted/50 transition-colors">
                                                                        <MoreHorizontal className="size-4 text-muted-foreground" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl shadow-xl border-border">
                                                                    <DropdownMenuItem onClick={() => handleEditCategory(cat)} className="gap-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-foreground">
                                                                        <Pencil className="size-4" />
                                                                        <span>Edit Wishlist</span>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => setIsShareModalOpen(true)} className="gap-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-indigo-700">
                                                                        <Share2 className="size-4" />
                                                                        <span>Share Link</span>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleDeleteCategory(cat.id)}
                                                                        className="gap-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-red-600 focus:bg-red-600 focus:text-white transition-colors"
                                                                    >
                                                                        <Trash2 className="size-4" />
                                                                        <span>Delete</span>
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>

                                {/* Main Action Button */}
                                {wishlistItems.length > 0 && (
                                    <Button
                                        onClick={handleOpenForm}
                                        className="h-11 px-5 md:px-4 gap-1 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-[0.05em] shadow-[0_4px_12px_-2px_rgba(37,99,235,0.3)] hover:shadow-[0_8px_16px_-4px_rgba(37,99,235,0.4)] transition-all active:scale-95"
                                    >
                                        <Plus className="size-4 stroke-[3]" />
                                        <span>Add</span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <div className={`flex-1 overflow-y-auto ${isModalOpen ? "blur-sm pointer-events-none" : ""}`}>
                    <div className="flex flex-col gap-4 p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="cards-grid">
                            {loading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <WishlistCardSkeleton key={i} />
                                ))
                            ) : wishlistItems.length === 0 ? (
                                <div style={{ gridColumn: "1 / -1" }}>
                                    <EmptyState
                                        message={
                                            categories.length === 0
                                                ? "Get started by creating your first Wishlist."
                                                : activeCategory === null
                                                    ? "Add your first item"
                                                    : "Your " + activeCategoryName + " wishlist is empty, start adding items."
                                        }
                                        action={
                                            categories.length === 0
                                                ? {
                                                    text: "Create Wishlist",
                                                    onClick: handleOpenCategoryModal,
                                                }
                                                : {
                                                    text: "Add Item",
                                                    onClick: handleOpenForm,
                                                }
                                        }
                                    >
                                        {categories.length > 0 && activeCategory === null && (
                                            <div className="flex flex-col items-center gap-2 mt-2">
                                                <p className="text-muted-foreground italic">or jump to a specific wishlist:</p>
                                                <Select onValueChange={(value) => setActiveCategory(value)}>
                                                    <SelectTrigger className="w-[200px] h-8 text-xs">
                                                        <SelectValue placeholder="Select a wishlist" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categories.map((cat) => (
                                                            <SelectItem key={cat.id} value={cat.id}>
                                                                {cat.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </EmptyState>
                                </div>
                            ) : (
                                wishlistItems.map((item) => (
                                    <WishlistCard
                                        key={item.id}
                                        item={item}
                                        onEdit={() => handleEditItem(item)}
                                        onDelete={() => handleDeleteItem(item.id)}
                                        onToggleMustHave={handleToggleMustHave}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </SidebarInset>

            <Dialog open={isFormOpen} onOpenChange={(open) => !open && handleCloseForm()}>
                <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl">
                    <WishlistForm
                        onSubmit={editingItem ? handleUpdateItem : handleAddItem}
                        onClose={handleCloseForm}
                        editingItem={editingItem || undefined}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={isCategoryModalOpen} onOpenChange={(open) => !open && handleCloseCategoryModal()}>
                <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl">
                    <CreateCategoryModal
                        items={allItems}
                        onCreateCategory={handleCreateCategory}
                        onUpdateCategory={handleUpdateCategory}
                        onClose={handleCloseCategoryModal}
                        editingCategory={editingCategory || undefined}
                    />
                </DialogContent>
            </Dialog>

            {activeCategory && (
                <ShareModal
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    categoryId={activeCategory}
                    categoryName={activeCategoryName || ''}
                    ownerName={user?.user_metadata?.first_name || 'My'}
                />
            )}
            <WelcomeModal />
        </SidebarProvider>
    );
}

export default Home;
