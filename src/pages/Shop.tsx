import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, SlidersHorizontal, X } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import ProductCard from "@/components/ProductCard";
import { productsService, type Product, type Category } from "@/services/products";

const PAGE_SIZE = 8;

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const search = searchParams.get("search") ?? "";
  const categoryId = searchParams.get("category") ?? "";
  const minPrice = Number(searchParams.get("min") ?? 0);
  const maxPrice = Number(searchParams.get("max") ?? 1000);
  const sortBy = (searchParams.get("sort") ?? "newest") as any;
  const page = Number(searchParams.get("page") ?? 1);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  useEffect(() => {
    productsService.categories().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    productsService
      .list({
        search: search || undefined,
        categoryId: categoryId || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice < 1000 ? maxPrice : undefined,
        sortBy,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      })
      .then(({ data, count }) => {
        setProducts(data);
        setCount(count);
      })
      .finally(() => setLoading(false));
  }, [search, categoryId, minPrice, maxPrice, sortBy, page]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== "page") next.delete("page");
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams({});
  const hasFilters = useMemo(() => Array.from(searchParams.keys()).length > 0, [searchParams]);

  return (
    <PageLayout>
      <section className="container mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <span className="text-sm font-medium tracking-[0.2em] uppercase text-accent mb-3 block">Collection</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">Shop All</h1>
          <p className="text-muted-foreground mt-3">{count} products</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Filters */}
          <aside className={`lg:w-64 lg:block ${showFilters ? "block" : "hidden"}`}>
            <div className="lg:sticky lg:top-28 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-foreground">Filters</h3>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs text-accent hover:underline">Clear all</button>
                )}
              </div>

              <div>
                <h4 className="text-xs font-medium tracking-wide uppercase text-muted-foreground mb-3">Category</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => updateParam("category", "")}
                    className={`block text-sm w-full text-left transition-colors ${!categoryId ? "text-accent font-medium" : "text-foreground hover:text-accent"}`}
                  >
                    All categories
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => updateParam("category", c.id)}
                      className={`block text-sm w-full text-left transition-colors ${categoryId === c.id ? "text-accent font-medium" : "text-foreground hover:text-accent"}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-medium tracking-wide uppercase text-muted-foreground mb-3">Price range</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={searchParams.get("min") ?? ""}
                    onChange={(e) => updateParam("min", e.target.value)}
                    placeholder="Min"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                  <span className="text-muted-foreground">—</span>
                  <input
                    type="number"
                    value={searchParams.get("max") ?? ""}
                    onChange={(e) => updateParam("max", e.target.value)}
                    placeholder="Max"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6 gap-3">
              <button
                onClick={() => setShowFilters((s) => !s)}
                className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm"
              >
                {showFilters ? <X size={16} /> : <SlidersHorizontal size={16} />}
                {showFilters ? "Hide" : "Filters"}
              </button>
              <select
                value={sortBy}
                onChange={(e) => updateParam("sort", e.target.value)}
                className="ml-auto px-4 py-2 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A–Z</option>
              </select>
            </div>

            {loading ? (
              <div className="flex justify-center py-24"><Loader2 className="animate-spin text-muted-foreground" /></div>
            ) : products.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-muted-foreground mb-4">No products match your filters.</p>
                <button onClick={clearFilters} className="text-accent hover:underline">Clear filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {products.map((p, i) => (
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
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => updateParam("page", String(i + 1))}
                    className={`w-10 h-10 rounded-lg text-sm transition-colors ${page === i + 1 ? "bg-foreground text-background" : "bg-card text-foreground hover:bg-secondary"}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Shop;
