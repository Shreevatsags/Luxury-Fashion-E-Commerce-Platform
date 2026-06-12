import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Search, Menu, X, Heart, User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { user, signOut } = useAuth();
  const { totalItems, setIsOpen: setCartOpen } = useCart();
  const { totalItems: wishCount } = useWishlist();
  const navigate = useNavigate();

  const links = [
    { name: "Shop", to: "/shop" },
    { name: "New Arrivals", to: "/shop?sort=newest" },
    { name: "Women", to: "/shop?search=women" },
    { name: "Men", to: "/shop?search=men" },
    { name: "Accessories", to: "/shop?search=accessories" },
  ];

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/shop?search=${encodeURIComponent(search.trim())}`);
      setSearchOpen(false);
      setSearch("");
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
    >
      <div className="container mx-auto px-6 flex items-center justify-between h-16 md:h-20">
        <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link to="/" className="font-display text-xl md:text-2xl font-bold tracking-tight text-foreground">
          ÉLEVE
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.to}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300 relative after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[1.5px] after:bg-accent after:scale-x-0 after:origin-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-left"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button onClick={() => setSearchOpen((s) => !s)} className="text-foreground hover:text-accent transition-colors duration-300">
            <Search size={20} />
          </button>
          <Link to="/wishlist" className="hidden md:block text-foreground hover:text-accent transition-colors duration-300 relative">
            <Heart size={20} />
            {wishCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {wishCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link to="/profile" className="hidden md:block text-foreground hover:text-accent transition-colors duration-300" title="Account">
                <User size={20} />
              </Link>
              <button onClick={() => signOut()} className="hidden md:block text-foreground hover:text-accent transition-colors duration-300" title="Sign out">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <Link to="/auth" className="hidden md:block text-foreground hover:text-accent transition-colors duration-300" title="Sign in">
              <User size={20} />
            </Link>
          )}

          <button onClick={() => setCartOpen(true)} className="text-foreground hover:text-accent transition-colors duration-300 relative">
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.form
            onSubmit={submitSearch}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border overflow-hidden"
          >
            <div className="container mx-auto px-6 py-4">
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          </motion.form>
        )}
      </AnimatePresence>

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
                <Link key={link.name} to={link.to} onClick={() => setIsOpen(false)} className="text-base font-medium text-foreground py-2">
                  {link.name}
                </Link>
              ))}
              <Link to="/wishlist" onClick={() => setIsOpen(false)} className="text-base font-medium text-foreground py-2">Wishlist</Link>
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="text-base font-medium text-foreground py-2">Profile</Link>
                  <button onClick={() => { signOut(); setIsOpen(false); }} className="text-base font-medium text-foreground py-2 text-left">Sign Out</button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setIsOpen(false)} className="text-base font-medium text-accent py-2">Sign In</Link>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
