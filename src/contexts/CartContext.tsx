import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
  };
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addToCart: (productId: string) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); setCartId(null); return; }
    setLoading(true);
    try {
      // Get or create cart
      let { data: cart } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!cart) {
        const { data: newCart } = await supabase
          .from("carts")
          .insert({ user_id: user.id })
          .select("id")
          .single();
        cart = newCart;
      }

      if (cart) {
        setCartId(cart.id);
        const { data: cartItems } = await supabase
          .from("cart_items")
          .select("id, product_id, quantity, products(id, name, price, image_url)")
          .eq("cart_id", cart.id);

        if (cartItems) {
          setItems(
            cartItems.map((ci: any) => ({
              id: ci.id,
              product_id: ci.product_id,
              quantity: ci.quantity,
              product: ci.products,
            }))
          );
        }
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId: string) => {
    if (!user) {
      toast.error("Please sign in to add items to your cart");
      return;
    }
    if (!cartId) return;

    const existing = items.find((i) => i.product_id === productId);
    if (existing) {
      await updateQuantity(existing.id, existing.quantity + 1);
    } else {
      await supabase.from("cart_items").insert({ cart_id: cartId, product_id: productId, quantity: 1 });
      await fetchCart();
      toast.success("Added to cart");
    }
    setIsOpen(true);
  };

  const removeFromCart = async (itemId: string) => {
    await supabase.from("cart_items").delete().eq("id", itemId);
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    toast.success("Removed from cart");
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return removeFromCart(itemId);
    await supabase.from("cart_items").update({ quantity }).eq("id", itemId);
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity } : i)));
  };

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.quantity * i.product.price, 0);

  return (
    <CartContext.Provider
      value={{ items, loading, isOpen, setIsOpen, addToCart, removeFromCart, updateQuantity, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
