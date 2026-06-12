import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  description: string | null;
  category_id: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  image_url: string | null;
}

export const productsService = {
  async list(filters?: {
    search?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: "newest" | "price-asc" | "price-desc" | "name";
    limit?: number;
    offset?: number;
  }): Promise<{ data: Product[]; count: number }> {
    let q = supabase.from("products").select("*", { count: "exact" });

    if (filters?.search) q = q.ilike("name", `%${filters.search}%`);
    if (filters?.categoryId) q = q.eq("category_id", filters.categoryId);
    if (filters?.minPrice !== undefined) q = q.gte("price", filters.minPrice);
    if (filters?.maxPrice !== undefined) q = q.lte("price", filters.maxPrice);

    switch (filters?.sortBy) {
      case "price-asc": q = q.order("price", { ascending: true }); break;
      case "price-desc": q = q.order("price", { ascending: false }); break;
      case "name": q = q.order("name", { ascending: true }); break;
      default: q = q.order("created_at", { ascending: false });
    }

    if (filters?.limit !== undefined) {
      const from = filters.offset ?? 0;
      q = q.range(from, from + filters.limit - 1);
    }

    const { data, count, error } = await q;
    if (error) throw error;
    return { data: (data ?? []) as Product[], count: count ?? 0 };
  },

  async get(id: string): Promise<Product | null> {
    const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data as Product | null;
  },

  async related(categoryId: string | null, excludeId: string, limit = 4): Promise<Product[]> {
    let q = supabase.from("products").select("*").neq("id", excludeId).limit(limit);
    if (categoryId) q = q.eq("category_id", categoryId);
    const { data } = await q;
    return (data ?? []) as Product[];
  },

  async categories(): Promise<Category[]> {
    const { data } = await supabase.from("categories").select("*").order("name");
    return (data ?? []) as Category[];
  },
};
