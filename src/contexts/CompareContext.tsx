import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { toast } from "sonner";

const KEY = "eleve_compare";
const MAX = 4;

interface CompareContextType {
  ids: string[];
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  isComparing: (id: string) => boolean;
  count: number;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider = ({ children }: { children: ReactNode }) => {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setIds(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(ids));
  }, [ids]);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX) {
        toast.error(`You can compare up to ${MAX} products`);
        return prev;
      }
      toast.success("Added to compare");
      return [...prev, id];
    });
  }, []);

  const remove = useCallback((id: string) => setIds((p) => p.filter((x) => x !== id)), []);
  const clear = useCallback(() => setIds([]), []);
  const isComparing = useCallback((id: string) => ids.includes(id), [ids]);

  return (
    <CompareContext.Provider value={{ ids, toggle, remove, clear, isComparing, count: ids.length }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
};
