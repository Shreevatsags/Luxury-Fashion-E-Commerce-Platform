import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { useCart } from "./CartContext";
import { toast } from "sonner";
import type { Product } from "@/services/products";

interface WishlistItem {
  id: string;
  product_id: string;
  product: Product;
}

interface WishlistContextType {
  items: WishlistItem[];
  loading: boolean;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (itemId: string) => Promise<void>;
  moveToCart: (item: WishlistItem) => Promise<void>;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    const { data } = await (supabase as any)
      .from("wishlist_items")
      .select("id, product_id, products(*)")
      .eq("user_id", user.id);
    if (data) {
      setItems(data.map((w: any) => ({ id: w.id, product_id: w.product_id, product: w.products })));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const isInWishlist = (productId: string) => items.some((i) => i.product_id === productId);

  const toggleWishlist = async (productId: string) => {
    if (!user) { toast.error("Sign in to save items"); return; }
    const existing = items.find((i) => i.product_id === productId);
    if (existing) {
      await (supabase as any).from("wishlist_items").delete().eq("id", existing.id);
      setItems((p) => p.filter((i) => i.id !== existing.id));
      toast.success("Removed from wishlist");
    } else {
      const { data } = await (supabase as any)
        .from("wishlist_items")
        .insert({ user_id: user.id, product_id: productId })
        .select("id, product_id, products(*)")
        .single();
      if (data) {
        setItems((p) => [...p, { id: data.id, product_id: data.product_id, product: data.products }]);
        toast.success("Added to wishlist");
      }
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    await (supabase as any).from("wishlist_items").delete().eq("id", itemId);
    setItems((p) => p.filter((i) => i.id !== itemId));
  };

  const moveToCart = async (item: WishlistItem) => {
    await addToCart(item.product_id);
    await removeFromWishlist(item.id);
  };

  return (
    <WishlistContext.Provider value={{ items, loading, isInWishlist, toggleWishlist, removeFromWishlist, moveToCart, totalItems: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};
