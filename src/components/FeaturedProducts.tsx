import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import catAccessories from "@/assets/category-accessories.jpg";
import catClothing from "@/assets/category-clothing.jpg";
import catHome from "@/assets/category-home.jpg";
import heroImage from "@/assets/hero-image.jpg";

const products = [
  { name: "Linen Oversized Blazer", price: "$189", image: catClothing, tag: "New" },
  { name: "Handcrafted Leather Tote", price: "$245", image: catAccessories },
  { name: "Ceramic Table Vase", price: "$68", image: catHome, tag: "Best Seller" },
  { name: "Merino Wool Sweater", price: "$145", image: heroImage },
  { name: "Silk Scarf Collection", price: "$95", image: catAccessories, tag: "Limited" },
  { name: "Organic Cotton Tee", price: "$55", image: catClothing },
  { name: "Artisan Candle Set", price: "$42", image: catHome },
  { name: "Cashmere Wrap", price: "$220", image: heroImage, tag: "New" },
];

const FeaturedProducts = () => {
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
              key={product.name}
              {...product}
              delay={i * 0.08}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
