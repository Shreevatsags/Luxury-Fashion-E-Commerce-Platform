import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "./ProductCard";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  description: string | null;
}

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    supabase.from("products").select("*").limit(8).then(({ data }) => {
      if (data) setProducts(data);
    });
  }, []);

  return (
    <section id="products" className="py-24 md:py-32 bg-secondary/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-14"
        >
          <div>
            <span className="text-sm font-medium tracking-[0.2em] uppercase text-accent mb-3 block">
              Curated for You
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
              Featured Products
            </h2>
          </div>
          <a
            href="#"
            className="mt-4 md:mt-0 text-sm font-medium text-accent hover:text-foreground transition-colors duration-300 underline underline-offset-4"
          >
            View all products →
          </a>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, i) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={`$${product.price}`}
              image={product.image_url || "/placeholder.svg"}
              delay={i * 0.08}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
