import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  price: string;
  image: string;
  tag?: string;
  delay?: number;
}

const ProductCard = ({ id, name, price, image, tag, delay = 0 }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const saved = isInWishlist(id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}
      className="group"
    >
      <Link to={`/product/${id}`} className="block">
        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-card mb-4">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
          {tag && (
            <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
              {tag}
            </span>
          )}
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-500" />
          <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(id); }}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-background/95 backdrop-blur-sm text-foreground text-sm font-medium rounded-lg hover:bg-background transition-colors"
            >
              <ShoppingBag size={16} />
              Add to Cart
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(id); }}
              className={cn(
                "p-3 bg-background/95 backdrop-blur-sm rounded-lg hover:bg-background transition-colors",
                saved ? "text-accent" : "text-foreground hover:text-accent"
              )}
            >
              <Heart size={16} fill={saved ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
        <h3 className="font-display font-medium text-foreground text-sm tracking-wide mb-1 group-hover:text-accent transition-colors duration-300">
          {name}
        </h3>
        <p className="text-muted-foreground text-sm font-body">{price}</p>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
