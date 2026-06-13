import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { Loader2, TrendingUp, DollarSign, Users, Package, ArrowUpRight } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import PageLayout from "@/components/PageLayout";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";

const MOCK_REVENUE = [
  { m: "Jan", revenue: 12400, orders: 84 }, { m: "Feb", revenue: 15800, orders: 102 },
  { m: "Mar", revenue: 14200, orders: 96 }, { m: "Apr", revenue: 19500, orders: 128 },
  { m: "May", revenue: 22300, orders: 142 }, { m: "Jun", revenue: 26100, orders: 168 },
  { m: "Jul", revenue: 28800, orders: 184 }, { m: "Aug", revenue: 31200, orders: 201 },
  { m: "Sep", revenue: 29400, orders: 192 }, { m: "Oct", revenue: 34800, orders: 224 },
  { m: "Nov", revenue: 41200, orders: 268 }, { m: "Dec", revenue: 48600, orders: 312 },
];
const MOCK_PRODUCTS = [
  { name: "Cashmere Wrap", sold: 142 }, { name: "Silk Blazer", sold: 118 },
  { name: "Leather Tote", sold: 96 }, { name: "Linen Tee", sold: 84 }, { name: "Ceramic Vase", sold: 62 },
];
const MOCK_CATEGORIES = [
  { name: "Apparel", value: 42 }, { name: "Accessories", value: 28 },
  { name: "Home", value: 18 }, { name: "Beauty", value: 12 },
];
const PALETTE = ["hsl(var(--accent))", "hsl(var(--foreground))", "hsl(var(--muted-foreground))", "hsl(var(--accent) / 0.5)"];

const AdminAnalytics = () => {
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState<typeof MOCK_REVENUE>([]);
  const [topProducts, setTopProducts] = useState<typeof MOCK_PRODUCTS>([]);
  const [categories, setCategories] = useState<typeof MOCK_CATEGORIES>([]);
  const [kpis, setKpis] = useState({ revenue: 0, orders: 0, customers: 0, products: 0, isReal: false });

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const [{ data: orders }, { data: items }, { count: customers }, { count: products }] = await Promise.all([
        (supabase as any).from("orders").select("id, total, created_at"),
        (supabase as any).from("order_items").select("quantity, price, product_id, products(name, category_id, categories(name))"),
        (supabase as any).from("profiles").select("id", { count: "exact", head: true }),
        (supabase as any).from("products").select("id", { count: "exact", head: true }),
      ]);

      const hasRealOrders = (orders?.length ?? 0) > 0;
      if (hasRealOrders) {
        // Aggregate revenue per month
        const byMonth = new Map<string, { revenue: number; orders: number }>();
        for (const o of orders!) {
          const d = new Date(o.created_at);
          const k = d.toLocaleString("en", { month: "short" });
          const cur = byMonth.get(k) ?? { revenue: 0, orders: 0 };
          cur.revenue += Number(o.total) || 0;
          cur.orders += 1;
          byMonth.set(k, cur);
        }
        setRevenue(Array.from(byMonth, ([m, v]) => ({ m, ...v })));

        const byProd = new Map<string, number>();
        const byCat = new Map<string, number>();
        for (const it of items ?? []) {
          const name = it.products?.name ?? "Unknown";
          byProd.set(name, (byProd.get(name) ?? 0) + (it.quantity ?? 0));
          const cat = it.products?.categories?.name ?? "Other";
          byCat.set(cat, (byCat.get(cat) ?? 0) + (it.quantity ?? 0));
        }
        setTopProducts(Array.from(byProd, ([name, sold]) => ({ name, sold })).sort((a, b) => b.sold - a.sold).slice(0, 5));
        setCategories(Array.from(byCat, ([name, value]) => ({ name, value })));

        const totalRev = orders!.reduce((s, o) => s + (Number(o.total) || 0), 0);
        setKpis({ revenue: totalRev, orders: orders!.length, customers: customers ?? 0, products: products ?? 0, isReal: true });
      } else {
        setRevenue(MOCK_REVENUE);
        setTopProducts(MOCK_PRODUCTS);
        setCategories(MOCK_CATEGORIES);
        const totalRev = MOCK_REVENUE.reduce((s, x) => s + x.revenue, 0);
        const totalOrd = MOCK_REVENUE.reduce((s, x) => s + x.orders, 0);
        setKpis({ revenue: totalRev, orders: totalOrd, customers: customers ?? 1284, products: products ?? 48, isReal: false });
      }
      setLoading(false);
    })();
  }, [isAdmin]);

  const kpiCards = useMemo(() => ([
    { label: "Revenue", value: `$${kpis.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, delta: "+12.4%", icon: DollarSign },
    { label: "Orders", value: kpis.orders.toLocaleString(), delta: "+8.2%", icon: Package },
    { label: "Customers", value: kpis.customers.toLocaleString(), delta: "+4.6%", icon: Users },
    { label: "Avg. Order", value: `$${kpis.orders ? (kpis.revenue / kpis.orders).toFixed(2) : "0.00"}`, delta: "+2.1%", icon: TrendingUp },
  ]), [kpis]);

  if (roleLoading) return <PageLayout><div className="flex justify-center py-32"><Loader2 className="animate-spin" /></div></PageLayout>;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <PageLayout>
      <section className="container mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Admin</p>
          <div className="flex items-end justify-between flex-wrap gap-3">
            <h1 className="font-display text-4xl md:text-5xl font-bold">Analytics</h1>
            {!kpis.isReal && (
              <span className="text-xs px-3 py-1.5 rounded-full bg-accent/10 text-accent font-body uppercase tracking-wider">Demo data</span>
            )}
          </div>
        </motion.div>

        {loading ? (
          <div className="py-32 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {kpiCards.map((k, i) => (
                <motion.div
                  key={k.label}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">{k.label}</span>
                    <div className="p-2 rounded-lg bg-accent/10 text-accent"><k.icon size={16} /></div>
                  </div>
                  <p className="font-display text-2xl md:text-3xl font-bold leading-tight">{k.value}</p>
                  <p className="text-xs text-accent flex items-center gap-1 mt-2"><ArrowUpRight size={12} />{k.delta} <span className="text-muted-foreground">vs last period</span></p>
                </motion.div>
              ))}
            </div>

            {/* Revenue area + orders line */}
            <div className="grid lg:grid-cols-3 gap-4 mb-8">
              <div className="lg:col-span-2 bg-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-lg font-bold">Revenue</h2>
                  <span className="text-xs text-muted-foreground">Last 12 months</span>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={revenue}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="m" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#g1)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card rounded-2xl p-6">
                <h2 className="font-display text-lg font-bold mb-6">Category Mix</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={categories} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={3}>
                      {categories.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                    </Pie>
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4 mb-8">
              <div className="bg-card rounded-2xl p-6">
                <h2 className="font-display text-lg font-bold mb-6">Orders Trend</h2>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={revenue}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="m" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                    <Line type="monotone" dataKey="orders" stroke="hsl(var(--foreground))" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card rounded-2xl p-6">
                <h2 className="font-display text-lg font-bold mb-6">Top Products</h2>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={topProducts} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={110} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                    <Bar dataKey="sold" fill="hsl(var(--accent))" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </section>
    </PageLayout>
  );
};

export default AdminAnalytics;
