import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Heart, Minus, Plus, ShoppingBag, Loader2, ArrowLeft } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import ProductCard from "@/components/ProductCard";
import { productsService, type Product } from "@/services/products";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { cn } from "@/lib/utils";

const SIZES = ["XS", "S", "M", "L", "XL"];

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState<string>("M");
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  // 3D tilt
  const tiltRef = useRef<HTMLDivElement>(null);
  const rx = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 });
  const rotateX = useTransform(rx, (v) => `${v}deg`);
  const rotateY = useTransform(ry, (v) => `${v}deg`);

  const onMove = (e: React.MouseEvent) => {
    const el = tiltRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 14);
    rx.set(-py * 14);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    productsService.get(id).then(async (p) => {
      setProduct(p);
      if (p) setRelated(await productsService.related(p.category_id, p.id));
      setLoading(false);
    });
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center py-32"><Loader2 className="animate-spin text-muted-foreground" /></div>
      </PageLayout>
    );
  }

  if (!product) {
    return (
      <PageLayout>
        <div className="container mx-auto px-6 py-32 text-center">
          <p className="text-muted-foreground mb-4">Product not found.</p>
          <Link to="/shop" className="text-accent hover:underline">Back to shop</Link>
        </div>
      </PageLayout>
    );
  }

  const img = product.image_url || "/placeholder.svg";
  const gallery = [img, img, img]; // single image used as gallery (placeholder structure)
  const saved = isInWishlist(product.id);

  return (
    <PageLayout>
      <section className="container mx-auto px-6 py-12">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent mb-8">
          <ArrowLeft size={16} /> Back to shop
        </Link>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, rotateY: -25, x: -40 }}
            animate={{ opacity: 1, rotateY: 0, x: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            style={{ perspective: 1200 }}
            className="space-y-4"
          >
            <motion.div
              ref={tiltRef}
              onMouseMove={onMove}
              onMouseLeave={onLeave}
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              className="aspect-[3/4] rounded-2xl overflow-hidden bg-card shadow-2xl will-change-transform"
            >
              <motion.img
                key={activeImg}
                initial={{ opacity: 0, scale: 1.08, rotateY: 30 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                src={gallery[activeImg]}
                alt={product.name}
                style={{ transform: "translateZ(40px)" }}
                className="w-full h-full object-cover"
              />
            </motion.div>
            <div className="grid grid-cols-3 gap-3" style={{ perspective: 800 }}>
              {gallery.map((g, i) => (
                <motion.button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  whileHover={{ rotateY: 8, rotateX: -4, scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  style={{ transformStyle: "preserve-3d" }}
                  className={cn(
                    "aspect-square rounded-lg overflow-hidden border-2 transition-colors",
                    activeImg === i ? "border-accent" : "border-transparent"
                  )}
                >
                  <img src={g} alt="" className="w-full h-full object-cover" />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">{product.name}</h1>
            <p className="text-2xl text-accent font-display font-semibold mb-6">${product.price}</p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              {product.description || "A timeless piece crafted with intention and attention to detail."}
            </p>

            <div className="mb-6">
              <label className="block text-xs font-medium tracking-wide uppercase text-muted-foreground mb-3">Size</label>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={cn(
                      "min-w-12 h-12 px-4 rounded-lg border text-sm font-medium transition-colors",
                      size === s ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-accent"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-xs font-medium tracking-wide uppercase text-muted-foreground mb-3">Quantity</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-secondary">
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-medium">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-secondary">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={async () => { for (let i = 0; i < qty; i++) await addToCart(product.id); }}
                className="flex-1 inline-flex items-center justify-center gap-2 py-4 bg-foreground text-background font-display font-semibold rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <ShoppingBag size={18} /> Add to Cart
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={cn(
                  "inline-flex items-center justify-center gap-2 py-4 px-6 border rounded-xl transition-colors",
                  saved ? "border-accent text-accent" : "border-border text-foreground hover:border-accent hover:text-accent"
                )}
              >
                <Heart size={18} fill={saved ? "currentColor" : "none"} />
                {saved ? "Saved" : "Wishlist"}
              </button>
            </div>
          </motion.div>
        </div>

        {related.length > 0 && (
          <div className="mt-24">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">You may also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p, i) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  price={`$${p.price}`}
                  image={p.image_url || "/placeholder.svg"}
                  delay={i * 0.05}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </PageLayout>
  );
};

export default ProductDetails;
