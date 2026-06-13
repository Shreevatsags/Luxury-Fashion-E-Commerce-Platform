import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { X, GitCompare } from "lucide-react";
import { useCompare } from "@/contexts/CompareContext";

const CompareBar = () => {
  const { ids, remove, clear, count } = useCompare();

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-foreground text-background rounded-full shadow-2xl pl-2 pr-2 py-2 flex items-center gap-3 max-w-[95vw]"
        >
          <div className="flex items-center gap-2 pl-2">
            <GitCompare size={16} />
            <span className="text-xs font-body uppercase tracking-wider hidden sm:inline">Compare</span>
            <span className="text-sm font-semibold">{count}</span>
          </div>
          <div className="flex items-center gap-1">
            {ids.map((id) => (
              <button
                key={id}
                onClick={() => remove(id)}
                className="px-2 py-1 text-xs rounded-full bg-background/10 hover:bg-background/20 flex items-center gap-1"
                title="Remove"
              >
                <span className="font-mono">{id.slice(0, 4)}</span>
                <X size={12} />
              </button>
            ))}
          </div>
          <Link
            to="/compare"
            className="ml-2 px-4 py-2 bg-accent text-accent-foreground text-xs font-display font-semibold rounded-full hover:opacity-90 transition-opacity"
          >
            Compare →
          </Link>
          <button onClick={clear} className="px-2 text-xs text-background/60 hover:text-background" title="Clear">
            Clear
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CompareBar;
