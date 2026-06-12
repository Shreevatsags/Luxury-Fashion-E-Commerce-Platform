import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <PageLayout>
        <div className="container mx-auto px-6 py-24 text-center">
          <ShoppingBag size={48} className="mx-auto text-muted-foreground/40 mb-4" />
          <h1 className="font-display text-2xl font-bold mb-3">Sign in to view your cart</h1>
          <Link to="/auth" className="inline-block px-6 py-3 bg-foreground text-background font-display font-semibold rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors">
            Sign In
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <section className="container mx-auto px-6 py-12">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl font-bold mb-10">
          Shopping Cart
        </motion.h1>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBag size={48} className="mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground mb-6">Your cart is empty</p>
            <Link to="/shop" className="inline-block px-6 py-3 bg-foreground text-background font-display font-semibold rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 p-4 rounded-xl bg-card"
                >
                  <Link to={`/product/${item.product_id}`} className="w-24 h-32 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                    <img src={item.product.image_url || "/placeholder.svg"} alt={item.product.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex justify-between gap-2">
                      <Link to={`/product/${item.product_id}`} className="font-display font-medium text-foreground hover:text-accent transition-colors">
                        {item.product.name}
                      </Link>
                      <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive">
                        <X size={18} />
                      </button>
                    </div>
                    <p className="text-accent font-semibold mt-1">${item.product.price.toFixed(2)}</p>
                    <div className="mt-auto flex items-center gap-3">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors">
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors">
                        <Plus size={14} />
                      </button>
                      <span className="ml-auto font-display font-semibold text-foreground">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <aside className="lg:sticky lg:top-28 self-start">
              <div className="bg-card rounded-2xl p-6 space-y-4">
                <h2 className="font-display text-xl font-bold">Order Summary</h2>
                <div className="space-y-2 pb-4 border-b border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-muted-foreground">Calculated at checkout</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-display font-semibold">Total</span>
                  <span className="font-display text-xl font-bold">${totalPrice.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full py-3.5 bg-foreground text-background font-display font-semibold rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Proceed to Checkout
                </button>
                <Link to="/shop" className="block text-center text-sm text-muted-foreground hover:text-accent">
                  Continue shopping
                </Link>
              </div>
            </aside>
          </div>
        )}
      </section>
    </PageLayout>
  );
};

export default Cart;
