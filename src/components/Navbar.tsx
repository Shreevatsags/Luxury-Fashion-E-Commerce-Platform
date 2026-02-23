import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Search, Menu, X, Heart } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const links = ["New Arrivals", "Women", "Men", "Accessories", "Sale"];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
    >
      <div className="container mx-auto px-6 flex items-center justify-between h-16 md:h-20">
        <button
          className="md:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <a href="/" className="font-display text-xl md:text-2xl font-bold tracking-tight text-foreground">
          ÉLEVE
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link}
              href="#"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300 relative after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[1.5px] after:bg-accent after:scale-x-0 after:origin-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-left"
            >
              {link}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button className="text-foreground hover:text-accent transition-colors duration-300">
            <Search size={20} />
          </button>
          <button className="hidden md:block text-foreground hover:text-accent transition-colors duration-300">
            <Heart size={20} />
          </button>
          <button className="text-foreground hover:text-accent transition-colors duration-300 relative">
            <ShoppingBag size={20} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              3
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden bg-background border-t border-border"
          >
            <div className="px-6 py-4 flex flex-col gap-3">
              {links.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-base font-medium text-foreground py-2"
                >
                  {link}
                </a>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
