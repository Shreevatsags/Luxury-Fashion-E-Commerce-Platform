import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, Navigate } from "react-router-dom";
import { Loader2, Plus, Trash2, Star, Heart, Package, MapPin, User as UserIcon } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Profile { id: string; full_name: string | null; email: string | null; address: string | null; }
interface Address {
  id: string; full_name: string; street: string; city: string; state: string | null;
  postal_code: string; country: string; phone: string | null; is_default: boolean;
}
interface Order { id: string; created_at: string; status: string; total_amount: number; }

type Tab = "info" | "orders" | "addresses" | "wishlist";

const Profile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { items: wishlist, removeFromWishlist, moveToCart } = useWishlist();
  const [tab, setTab] = useState<Tab>("info");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddrForm, setShowAddrForm] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const [{ data: prof }, { data: ords }, { data: addrs }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("orders").select("id, created_at, status, total_amount").eq("user_id", user.id).order("created_at", { ascending: false }),
        (supabase as any).from("shipping_addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false }),
      ]);
      setProfile(prof as any);
      setOrders((ords as Order[]) ?? []);
      setAddresses((addrs as Address[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  if (authLoading) return <PageLayout><div className="flex justify-center py-32"><Loader2 className="animate-spin" /></div></PageLayout>;
  if (!user) return <Navigate to="/auth" replace />;

  const saveProfile = async () => {
    if (!profile) return;
    const { error } = await supabase.from("profiles").update({
      full_name: profile.full_name, address: profile.address,
    }).eq("user_id", user.id);
    if (error) toast.error(error.message); else toast.success("Profile updated");
  };

  const deleteAddress = async (id: string) => {
    await (supabase as any).from("shipping_addresses").delete().eq("id", id);
    setAddresses((p) => p.filter((a) => a.id !== id));
    toast.success("Address removed");
  };

  const setDefault = async (id: string) => {
    await (supabase as any).from("shipping_addresses").update({ is_default: false }).eq("user_id", user.id);
    await (supabase as any).from("shipping_addresses").update({ is_default: true }).eq("id", id);
    setAddresses((p) => p.map((a) => ({ ...a, is_default: a.id === id })));
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "info", label: "Personal Info", icon: UserIcon },
    { id: "orders", label: "Orders", icon: Package },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "wishlist", label: "Wishlist", icon: Heart },
  ];

  return (
    <PageLayout>
      <section className="container mx-auto px-6 py-12">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl font-bold mb-2">My Account</motion.h1>
        <p className="text-muted-foreground mb-10">{user.email}</p>

        <div className="grid lg:grid-cols-4 gap-10">
          <aside className="lg:col-span-1">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${tab === t.id ? "bg-foreground text-background" : "text-foreground hover:bg-card"}`}
                >
                  <t.icon size={16} /> {t.label}
                </button>
              ))}
              <button onClick={() => signOut()} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive transition-colors mt-2">
                Sign Out
              </button>
            </nav>
          </aside>

          <div className="lg:col-span-3">
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                {tab === "info" && profile && (
                  <div className="bg-card rounded-2xl p-8 max-w-xl">
                    <h2 className="font-display text-xl font-bold mb-6">Personal Information</h2>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Name</label>
                        <input
                          value={profile.full_name ?? ""}
                          onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input disabled value={profile.email ?? user.email ?? ""} className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-muted-foreground" />
                      </div>
                      <button onClick={saveProfile} className="px-6 py-3 bg-foreground text-background font-display font-semibold rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors">
                        Save Changes
                      </button>
                    </div>
                  </div>
                )}

                {tab === "orders" && (
                  <div className="space-y-4">
                    <h2 className="font-display text-xl font-bold mb-2">Order History</h2>
                    {orders.length === 0 ? (
                      <div className="bg-card rounded-2xl p-10 text-center">
                        <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
                        <Link to="/shop" className="text-accent hover:underline">Start shopping</Link>
                      </div>
                    ) : orders.map((o) => (
                      <div key={o.id} className="bg-card rounded-xl p-5 flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-foreground text-sm">Order #{o.id.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground mt-1">{new Date(o.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className="text-xs px-3 py-1 rounded-full bg-secondary capitalize">{o.status}</span>
                        <p className="font-display font-semibold">${Number(o.total_amount).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}

                {tab === "addresses" && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="font-display text-xl font-bold">Shipping Addresses</h2>
                      <button onClick={() => setShowAddrForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-medium rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
                        <Plus size={16} /> Add Address
                      </button>
                    </div>

                    {showAddrForm && (
                      <AddressForm
                        userId={user.id}
                        onCancel={() => setShowAddrForm(false)}
                        onSaved={(a) => { setAddresses((p) => [a, ...p]); setShowAddrForm(false); }}
                      />
                    )}

                    {addresses.length === 0 && !showAddrForm ? (
                      <div className="bg-card rounded-2xl p-10 text-center text-muted-foreground">No addresses saved yet.</div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4 mt-4">
                        {addresses.map((a) => (
                          <div key={a.id} className="bg-card rounded-xl p-5 relative">
                            {a.is_default && <span className="absolute top-3 right-3 text-xs px-2 py-1 rounded-full bg-accent/20 text-accent">Default</span>}
                            <p className="font-medium">{a.full_name}</p>
                            <p className="text-sm text-muted-foreground mt-1">{a.street}</p>
                            <p className="text-sm text-muted-foreground">{a.city}{a.state ? `, ${a.state}` : ""} {a.postal_code}</p>
                            <p className="text-sm text-muted-foreground">{a.country}</p>
                            {a.phone && <p className="text-sm text-muted-foreground mt-1">{a.phone}</p>}
                            <div className="flex gap-3 mt-4">
                              {!a.is_default && (
                                <button onClick={() => setDefault(a.id)} className="text-xs inline-flex items-center gap-1 text-accent hover:underline">
                                  <Star size={12} /> Set default
                                </button>
                              )}
                              <button onClick={() => deleteAddress(a.id)} className="text-xs inline-flex items-center gap-1 text-muted-foreground hover:text-destructive ml-auto">
                                <Trash2 size={12} /> Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {tab === "wishlist" && (
                  <div>
                    <h2 className="font-display text-xl font-bold mb-6">My Wishlist ({wishlist.length})</h2>
                    {wishlist.length === 0 ? (
                      <div className="bg-card rounded-2xl p-10 text-center">
                        <p className="text-muted-foreground mb-4">Your wishlist is empty.</p>
                        <Link to="/shop" className="text-accent hover:underline">Browse products</Link>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {wishlist.map((item) => (
                          <div key={item.id} className="bg-card rounded-xl p-3">
                            <Link to={`/product/${item.product_id}`} className="block aspect-[3/4] rounded-lg overflow-hidden mb-3">
                              <img src={item.product.image_url || "/placeholder.svg"} alt={item.product.name} className="w-full h-full object-cover" />
                            </Link>
                            <p className="font-medium text-sm">{item.product.name}</p>
                            <p className="text-accent text-sm mb-3">${item.product.price}</p>
                            <div className="flex gap-2">
                              <button onClick={() => moveToCart(item)} className="flex-1 text-xs py-2 bg-foreground text-background rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
                                Move to Cart
                              </button>
                              <button onClick={() => removeFromWishlist(item.id)} className="p-2 text-muted-foreground hover:text-destructive">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

const AddressForm = ({ userId, onCancel, onSaved }: { userId: string; onCancel: () => void; onSaved: (a: Address) => void }) => {
  const [form, setForm] = useState({ full_name: "", street: "", city: "", state: "", postal_code: "", country: "", phone: "" });
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data, error } = await (supabase as any)
      .from("shipping_addresses")
      .insert({ ...form, user_id: userId })
      .select()
      .single();
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Address added"); onSaved(data); }
  };

  const field = (key: keyof typeof form, label: string, required = true) => (
    <div>
      <label className="block text-xs font-medium mb-1.5">{label}</label>
      <input
        required={required} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full px-3 py-2.5 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/50"
      />
    </div>
  );

  return (
    <form onSubmit={save} className="bg-card rounded-2xl p-6 mb-6 grid sm:grid-cols-2 gap-4">
      {field("full_name", "Full Name")}
      {field("phone", "Phone", false)}
      <div className="sm:col-span-2">{field("street", "Street Address")}</div>
      {field("city", "City")}
      {field("state", "State / Province", false)}
      {field("postal_code", "Postal Code")}
      {field("country", "Country")}
      <div className="sm:col-span-2 flex gap-3 mt-2">
        <button type="submit" disabled={saving} className="px-5 py-2.5 bg-foreground text-background text-sm font-medium rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50">
          {saving ? "Saving..." : "Save Address"}
        </button>
        <button type="button" onClick={onCancel} className="px-5 py-2.5 border border-border text-sm rounded-lg hover:bg-secondary">Cancel</button>
      </div>
    </form>
  );
};

export default Profile;
