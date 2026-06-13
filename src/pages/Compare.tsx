import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, X, ShoppingBag, Heart, GitCompare } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { useCompare } from "@/contexts/CompareContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  description: string | null;
  category_id: string | null;
  specifications: Record<string, any> | null;
  rating: number | null;
  reviews_count: number | null;
}

const Compare = () => {
  const { ids, remove, clear } = useCompare();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) { setProducts([]); setLoading(false); return; }
    setLoading(true);
    supabase.from("products").select("*").in("id", ids).then(({ data }) => {
      const sorted = ids.map((id) => (data ?? []).find((p: any) => p.id === id)).filter(Boolean) as Product[];
      setProducts(sorted);
      setLoading(false);
    });
  }, [ids]);

  // Collect all spec keys across products
  const specKeys = Array.from(
    new Set(products.flatMap((p) => Object.keys(p.specifications || {})))
  );

  return (
    <PageLayout>
      <section className="container mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Side by side</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold">Compare Products</h1>
          </div>
          {products.length > 0 && (
            <button onClick={clear} className="text-sm text-muted-foreground hover:text-accent underline-offset-4 hover:underline">
              Clear all
            </button>
          )}
        </motion.div>

        {loading ? (
          <div className="py-32 text-center text-muted-foreground">Loading…</div>
        ) : products.length === 0 ? (
          <div className="py-32 text-center">
            <GitCompare size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-6">No products selected for comparison yet.</p>
            <Link to="/shop" className="inline-block px-6 py-3 bg-foreground text-background font-display font-semibold rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors">
              Browse the shop
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6 pb-4">
            <table className="w-full min-w-[720px] border-separate border-spacing-x-4">
              <thead>
                <tr>
                  <th className="w-32"></th>
                  {products.map((p) => (
                    <th key={p.id} className="align-top text-left">
                      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-4 relative">
                        <button onClick={() => remove(p.id)} className="absolute top-3 right-3 p-1.5 rounded-full bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground transition-colors">
                          <X size={14} />
                        </button>
                        <Link to={`/product/${p.id}`} className="block">
                          <div className="aspect-[3/4] rounded-xl overflow-hidden bg-background mb-3">
                            <img src={p.image_url || "/placeholder.svg"} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                          <h3 className="font-display text-base font-semibold leading-tight hover:text-accent transition-colors">{p.name}</h3>
                        </Link>
                      </motion.div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm font-body">
                <Row label="Price">
                  {products.map((p) => (
                    <td key={p.id} className="py-4 align-top">
                      <span className="font-display text-xl font-bold">${Number(p.price).toFixed(2)}</span>
                    </td>
                  ))}
                </Row>
                <Row label="Rating">
                  {products.map((p) => (
                    <td key={p.id} className="py-4 align-top">
                      <div className="flex items-center gap-1.5">
                        {[1,2,3,4,5].map((i) => (
                          <Star key={i} size={14} className={i <= Math.round(Number(p.rating) || 0) ? "fill-accent text-accent" : "text-muted-foreground/40"} />
                        ))}
                        <span className="text-muted-foreground ml-1">({p.reviews_count ?? 0})</span>
                      </div>
                    </td>
                  ))}
                </Row>
                <Row label="Description">
                  {products.map((p) => (
                    <td key={p.id} className="py-4 align-top text-muted-foreground leading-relaxed">
                      {p.description || "—"}
                    </td>
                  ))}
                </Row>
                {specKeys.map((key) => (
                  <Row key={key} label={key}>
                    {products.map((p) => (
                      <td key={p.id} className="py-4 align-top">
                        {String(p.specifications?.[key] ?? "—")}
                      </td>
                    ))}
                  </Row>
                ))}
                <tr>
                  <td className="py-4 text-xs uppercase tracking-wider text-muted-foreground align-top">Actions</td>
                  {products.map((p) => (
                    <td key={p.id} className="py-4 align-top">
                      <div className="flex flex-col gap-2">
                        <button onClick={() => addToCart(p.id)} className="flex items-center justify-center gap-2 px-3 py-2.5 bg-foreground text-background text-xs font-display font-semibold rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
                          <ShoppingBag size={14} /> Add to Cart
                        </button>
                        <button onClick={() => toggleWishlist(p.id)} className="flex items-center justify-center gap-2 px-3 py-2.5 border border-border text-xs font-display rounded-lg hover:border-accent hover:text-accent transition-colors">
                          <Heart size={14} fill={isInWishlist(p.id) ? "currentColor" : "none"} />
                          {isInWishlist(p.id) ? "Saved" : "Save"}
                        </button>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageLayout>
  );
};

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <tr className="border-t border-border">
    <td className="py-4 text-xs uppercase tracking-wider text-muted-foreground align-top capitalize">{label}</td>
    {children}
  </tr>
);

export default Compare;
