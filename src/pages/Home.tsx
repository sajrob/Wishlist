/**
 * Home page component that serves as the main dashboard for users to manage their wishlists
 * and items. It provides functionality for adding, editing, and deleting items and categories.
 */
import React, { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { confirmDelete } from "../utils/toastHelpers";
import WishlistCard from "../components/WishlistCard";
import WishlistForm from "../components/WishlistForm";
import CreateCategoryModal from "../components/CreateCategoryModal";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
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
import { useWishlistData, useFilteredItems } from "../hooks/useWishlistData";
import { useCategories } from "../hooks/useCategories";
import { useWishlistSettings } from "../hooks/useWishlistSettings";
import { createItem, updateItem, deleteItem } from "../utils/supabaseHelpers";
import type { Category, WishlistItem, ItemFormData } from "../types";
import "../App.css";
import "./Home.css";

function Home() {
  const { user } = useAuth();

  const { allItems, categories, loading, setAllItems, setCategories, refetch } =
    useWishlistData(user?.id || null);
  const { isPublic, togglePublic } = useWishlistSettings(user?.id || null);
  const {
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryPrivacy,
  } = useCategories(user?.id || "");

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<
    (Category & { itemIds?: string[] }) | null
  >(null);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const wishlistItems = useFilteredItems(allItems, activeCategory);

  const handleTogglePublic = async () => {
    await togglePublic();
  };

  const handleAddItem = async (newItem: ItemFormData) => {
    if (!user) return;

    const itemData = {
      user_id: user.id,
      category_id: activeCategory,
      name: newItem.name,
      price: parseFloat(newItem.price as string) || 0,
      description: newItem.description,
      image_url: newItem.image_url,
      buy_link: newItem.buy_link,
      is_must_have: newItem.is_must_have || false,
      currency: newItem.currency || 'USD',
    };

    const { data, error } = await createItem(itemData);

    if (error) {
      alert("Error adding item");
      return;
    }

    setAllItems((prev) => (data ? [data, ...prev] : prev));
    setIsFormOpen(false);
  };

  const handleEditItem = (item: WishlistItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleUpdateItem = async (formData: ItemFormData) => {
    if (!editingItem) return;

    const updates = {
      name: formData.name,
      price: parseFloat(formData.price as string) || 0,
      description: formData.description,
      image_url: formData.image_url,
      buy_link: formData.buy_link,
      is_must_have: formData.is_must_have || false,
      currency: formData.currency || 'USD',
    };

    const { data, error } = await updateItem(editingItem.id, updates);

    if (error) {
      alert("Error updating item");
      return;
    }

    setAllItems((prev) =>
      prev.map((item) => (item.id === editingItem.id && data ? data : item))
    );
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleToggleMustHave = async (itemId: string, isMustHave: boolean) => {
    const { data, error } = await updateItem(itemId, {
      is_must_have: isMustHave,
    });

    if (error) {
      toast.error("Failed to update importance");
      return;
    }

    if (data) {
      setAllItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, is_must_have: data.is_must_have }
            : item
        )
      );
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const itemToDelete = allItems.find((i) => i.id === itemId);

    if (activeCategory) {
      // Case 1: Viewing a specific wishlist - just remove from that wishlist (make uncategorized)
      confirmDelete({
        title: "Remove from Wishlist?",
        description: `"${itemToDelete?.name || "this item"
          }" will be removed from this wishlist but will still be available in "All Items".`,
        deleteLabel: "Remove",
        onDelete: async () => {
          const { data, error } = await updateItem(itemId, {
            category_id: null,
          });
          if (error) {
            toast.error("Error removing item");
            return;
          }
          // Update the local state - the item still exists but its category is now null
          setAllItems((prev) =>
            prev.map((item) => (item.id === itemId && data ? data : item))
          );
          toast.success("Item removed from wishlist");
        },
      });
    } else {
      // Case 2: Viewing "All Items" - permanent deletion
      confirmDelete({
        title: "Permanently Delete?",
        description: `This will completely remove "${itemToDelete?.name || "this item"
          }" from your account.`,
        deleteLabel: "Delete Permanently",
        onDelete: async () => {
          const { error } = await deleteItem(itemId);
          if (error) {
            toast.error("Error deleting item");
            return;
          }
          setAllItems((prev) => prev.filter((item) => item.id !== itemId));
          toast.success("Item deleted successfully");
        },
      });
    }
  };

  const handleCreateCategory = async (categoryData: {
    name: string;
    itemIds?: string[];
    is_public: boolean;
  }) => {
    const { data, error } = await createCategory(categoryData as any);

    if (error) {
      alert("Error creating category");
      return;
    }

    if (data && !data.is_public && categories.length < 4) {
      setIsTooltipOpen(true);
      setTimeout(() => setIsTooltipOpen(false), 10000);
    }

    await refetch();
    if (data) {
      setActiveCategory(data.id);
    }
    setIsCategoryModalOpen(false);
  };

  const handleUpdateCategory = async (categoryData: any) => {
    const { error } = await updateCategory(categoryData.id, categoryData);

    if (error) {
      alert("Error updating category");
      return;
    }

    await refetch();
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const catToDelete = categories.find((c) => c.id === categoryId);

    confirmDelete({
      title: "Delete this category?",
      description: `Items in "${catToDelete?.name || "this category"
        }" will be moved to "All Items".`,
      onDelete: async () => {
        const { error } = await deleteCategory(categoryId);
        if (error) {
          toast.error("Error deleting category");
          return;
        }
        setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
        setAllItems((prev) =>
          prev.map((item) =>
            item.category_id === categoryId
              ? { ...item, category_id: null }
              : item
          )
        );

        if (activeCategory === categoryId) {
          setActiveCategory(null);
        }
        toast.success("Category deleted successfully");
      },
    });
  };

  const handleToggleCategoryPrivacy = async (
    categoryId: string,
    currentIsPublic: boolean
  ) => {
    const { data, error } = await toggleCategoryPrivacy(
      categoryId,
      currentIsPublic
    );

    if (error) {
      alert("Failed to update category privacy");
      return;
    }

    if (data) {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId ? { ...cat, is_public: data.is_public } : cat
        )
      );
    }
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

  const isModalOpen = isFormOpen || isCategoryModalOpen;

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
      <SidebarInset className="flex flex-col bg-background overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b px-4 bg-background">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-col">
                <h1 className="text-lg font-semibold leading-none flex items-center gap-2">
                  {activeCategory ? `${activeCategoryName} Wishlist` : "All Items"}
                  <span className="text-muted-foreground font-normal text-xs">({wishlistItems.length})</span>
                </h1>

                <div className="flex items-center gap-2 mt-1">
                  {!activeCategory ? (
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {isPublic
                          ? "Public - Visible to friends"
                          : "Hidden - Only you can see it"}
                      </p>
                      <label className="flex items-center cursor-pointer scale-75 origin-left h-4">
                        <div className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={isPublic}
                            onChange={handleTogglePublic}
                          />
                          <span className="toggle-slider"></span>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      {(() => {
                        const cat = categories.find((c) => c.id === activeCategory);
                        if (!cat) return null;
                        return (
                          <>
                            <TooltipProvider>
                              <Tooltip open={isTooltipOpen} onOpenChange={setIsTooltipOpen}>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="h-5 px-1.5 text-[10px] uppercase tracking-wider font-bold bg-muted/50 hover:bg-muted text-muted-foreground"
                                    onClick={() => {
                                      handleToggleCategoryPrivacy(cat.id, cat.is_public);
                                      setIsTooltipOpen(false);
                                    }}
                                  >
                                    {cat.is_public ? "🌍 Public" : "🔒 Private"}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="max-w-[200px] p-3 bg-white border-2 border-blue-500">
                                  <p className="font-medium text-black">
                                    Wishlist is private by default.
                                    <br />
                                    <span className="text-black/70 font-normal text-xs">
                                      Click to allow other users to see it.
                                    </span>
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-5 px-1.5 text-[10px] uppercase tracking-wider font-bold bg-muted/50 hover:bg-muted text-muted-foreground"
                              onClick={() => handleEditCategory(cat)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-5 px-1.5 text-[10px] uppercase tracking-wider font-bold bg-destructive/10 hover:bg-destructive/20 text-destructive border-none"
                              onClick={() => handleDeleteCategory(cat.id)}
                            >
                              Delete
                            </Button>
                          </>
                        );
                      })()}
                    </div >
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {wishlistItems.length > 0 && (
              <Button onClick={handleOpenForm} size="sm" className="h-8 gap-1.5 px-3 sm:px-4">
                <Plus className="size-4" />
                <span className="hidden sm:inline">Add Item</span>
              </Button>
            )}
          </div>
        </header>

        <div
          className={`flex-1 overflow-y-auto ${isModalOpen ? "blur-sm pointer-events-none" : ""
            }`}
        >

          <div className="flex flex-col gap-4 p-4">
            <div className="cards-grid">
              {loading ? (
                // Show skeleton loading state
                Array.from({ length: 6 }).map((_, i) => (
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
                          : "Your " +
                          activeCategoryName +
                          " wishlist is empty, start adding items."
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
                        <p className="text-muted-foreground italic">
                          or jump to a specific wishlist:
                        </p>
                        <Select
                          onValueChange={(value) => setActiveCategory(value)}
                        >
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

      {/* Add/Edit Item Modal */}
      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => !open && handleCloseForm()}
      >
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl">
          <WishlistForm
            onSubmit={editingItem ? handleUpdateItem : handleAddItem}
            onClose={handleCloseForm}
            editingItem={editingItem || undefined}
          />
        </DialogContent>
      </Dialog>

      {/* Add/Edit Wishlist Modal */}
      <Dialog
        open={isCategoryModalOpen}
        onOpenChange={(open) => !open && handleCloseCategoryModal()}
      >
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
    </SidebarProvider>
  );
}

export default Home;
