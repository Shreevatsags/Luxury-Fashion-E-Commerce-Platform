import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, X } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";

const Wishlist = () => {
  const { items, removeFromWishlist, moveToCart } = useWishlist();
  const { user } = useAuth();

  if (!user) {
    return (
      <PageLayout>
        <div className="container mx-auto px-6 py-24 text-center">
          <Heart size={48} className="mx-auto text-muted-foreground/40 mb-4" />
          <h1 className="font-display text-2xl font-bold mb-3">Sign in to view your wishlist</h1>
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="font-display text-4xl font-bold">Wishlist</h1>
          <p className="text-muted-foreground mt-2">{items.length} saved items</p>
        </motion.div>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <Heart size={48} className="mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground mb-6">Your wishlist is empty</p>
            <Link to="/shop" className="inline-block px-6 py-3 bg-foreground text-background font-display font-semibold rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors">
              Discover Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group"
              >
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-card mb-3">
                  <Link to={`/product/${item.product_id}`}>
                    <img src={item.product.image_url || "/placeholder.svg"} alt={item.product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </Link>
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/95 backdrop-blur-sm flex items-center justify-center text-foreground hover:text-destructive transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                <Link to={`/product/${item.product_id}`} className="block">
                  <h3 className="font-display font-medium text-foreground text-sm mb-1 hover:text-accent transition-colors">
                    {item.product.name}
                  </h3>
                </Link>
                <p className="text-muted-foreground text-sm mb-3">${item.product.price}</p>
                <button
                  onClick={() => moveToCart(item)}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-foreground text-background text-sm font-medium rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <ShoppingBag size={14} /> Move to Cart
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </PageLayout>
  );
};

export default Wishlist;
