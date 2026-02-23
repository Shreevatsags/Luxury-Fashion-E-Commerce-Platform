import { motion } from "framer-motion";
import catAccessories from "@/assets/category-accessories.jpg";
import catClothing from "@/assets/category-clothing.jpg";
import catHome from "@/assets/category-home.jpg";

const categories = [
  { name: "Accessories", image: catAccessories, count: "48 items" },
  { name: "Clothing", image: catClothing, count: "126 items" },
  { name: "Home & Living", image: catHome, count: "63 items" },
];

const Categories = () => {
  return (
    <section id="categories" className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-sm font-medium tracking-[0.2em] uppercase text-accent mb-3 block">
            Explore
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            Shop by Category
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <motion.a
              key={cat.name}
              href="#"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h3 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mb-1">
                  {cat.name}
                </h3>
                <p className="text-primary-foreground/70 text-sm font-body">
                  {cat.count}
                </p>
                <div className="mt-4 h-[2px] bg-primary-foreground/50 w-0 group-hover:w-full transition-all duration-500" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
