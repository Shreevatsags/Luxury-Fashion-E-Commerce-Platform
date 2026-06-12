import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const CartSidebar = () => {
  const { items, isOpen, setIsOpen, removeFromCart, updateQuantity, totalPrice, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const goToCheckout = () => {
    setIsOpen(false);
    navigate("/checkout");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-background border-l border-border z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                <ShoppingBag size={20} />
                Your Cart
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {!user ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground mb-4">Sign in to view your cart</p>
                  <a href="/auth" className="inline-block px-6 py-3 bg-foreground text-background font-display font-semibold rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors">
                    Sign In
                  </a>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag size={48} className="mx-auto text-muted-foreground/40 mb-4" />
                  <p className="text-muted-foreground">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex gap-4 p-3 rounded-xl bg-card"
                    >
                      <div className="w-20 h-20 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.image_url || "/placeholder.svg"}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-medium text-foreground text-sm truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-accent font-semibold text-sm mt-1">
                          ${item.product.price.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-medium text-foreground w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors self-start"
                      >
                        <X size={16} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {user && items.length > 0 && (
              <div className="p-6 border-t border-border space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-display text-xl font-bold text-foreground">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={goToCheckout}
                  className="w-full py-3.5 bg-foreground text-background font-display font-semibold rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  Checkout
                </button>
                <Link to="/cart" onClick={() => setIsOpen(false)} className="block text-center text-sm text-muted-foreground hover:text-accent">
                  View full cart
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;
