import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const Newsletter = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl bg-primary text-primary-foreground overflow-hidden px-8 py-16 md:px-16 md:py-24 text-center"
        >
          {/* Decorative circles */}
          <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] rounded-full bg-accent/10" />
          <div className="absolute bottom-[-80px] left-[-80px] w-[250px] h-[250px] rounded-full bg-accent/10" />

          <div className="relative z-10 max-w-xl mx-auto">
            <span className="text-sm font-medium tracking-[0.2em] uppercase text-accent mb-4 block">
              Stay Connected
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Join Our World
            </h2>
            <p className="text-primary-foreground/70 mb-8 font-body">
              Be the first to know about new arrivals, exclusive offers, and style inspiration.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3.5 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 text-sm font-body focus:outline-none focus:border-accent transition-colors"
              />
              <button className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-accent text-accent-foreground font-display font-medium text-sm rounded-lg hover:opacity-90 transition-opacity group">
                Subscribe
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;
