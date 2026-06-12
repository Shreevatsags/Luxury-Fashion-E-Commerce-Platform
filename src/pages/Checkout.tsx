import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navigate, useNavigate } from "react-router-dom";
import { Loader2, CreditCard } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Address {
  id: string; full_name: string; street: string; city: string; state: string | null;
  postal_code: string; country: string; phone: string | null; is_default: boolean;
}

const Checkout = () => {
  const { user, loading: authLoading } = useAuth();
  const { items, totalPrice } = useCart();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [billingSame, setBillingSame] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [processing, setProcessing] = useState(false);
  const [newAddress, setNewAddress] = useState({
    full_name: "", street: "", city: "", state: "", postal_code: "", country: "", phone: "",
  });
  const [useNew, setUseNew] = useState(false);

  useEffect(() => {
    if (!user) return;
    (supabase as any)
      .from("shipping_addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .then(({ data }: any) => {
        const list = (data ?? []) as Address[];
        setAddresses(list);
        if (list.length) setSelected(list.find((a) => a.is_default)?.id ?? list[0].id);
        else setUseNew(true);
      });
  }, [user]);

  if (authLoading) return <PageLayout><div className="flex justify-center py-32"><Loader2 className="animate-spin" /></div></PageLayout>;
  if (!user) return <Navigate to="/auth" replace />;
  if (items.length === 0) return <Navigate to="/cart" replace />;

  const shipping = 9.99;
  const tax = totalPrice * 0.08;
  const grand = totalPrice + shipping + tax;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    let shippingAddr: Address | typeof newAddress | undefined;
    if (useNew) {
      const required = ["full_name", "street", "city", "postal_code", "country"] as const;
      for (const f of required) if (!newAddress[f]) { toast.error(`Missing ${f.replace("_", " ")}`); return; }
      shippingAddr = newAddress;
      // Save it
      await (supabase as any).from("shipping_addresses").insert({ ...newAddress, user_id: user.id });
    } else {
      shippingAddr = addresses.find((a) => a.id === selected);
    }
    if (!shippingAddr) { toast.error("Please select a shipping address"); return; }

    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          items: items.map((i) => ({
            name: i.product.name,
            price: i.product.price,
            quantity: i.quantity,
            image_url: i.product.image_url,
          })),
          shipping_address: `${shippingAddr.full_name}, ${shippingAddr.street}, ${shippingAddr.city}, ${shippingAddr.postal_code}, ${shippingAddr.country}`,
        },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message || "Checkout failed");
      setProcessing(false);
    }
  };

  return (
    <PageLayout>
      <section className="container mx-auto px-6 py-12">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl font-bold mb-10">Checkout</motion.h1>

        <form onSubmit={handlePay} className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping */}
            <div className="bg-card rounded-2xl p-6">
              <h2 className="font-display text-lg font-bold mb-5">Shipping Information</h2>

              {addresses.length > 0 && (
                <div className="space-y-3 mb-4">
                  {addresses.map((a) => (
                    <label key={a.id} className={`block p-4 rounded-xl border cursor-pointer transition-colors ${!useNew && selected === a.id ? "border-accent bg-accent/5" : "border-border"}`}>
                      <input type="radio" className="sr-only" checked={!useNew && selected === a.id} onChange={() => { setSelected(a.id); setUseNew(false); }} />
                      <p className="font-medium text-sm">{a.full_name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{a.street}, {a.city}{a.state ? `, ${a.state}` : ""} {a.postal_code}, {a.country}</p>
                    </label>
                  ))}
                  <button type="button" onClick={() => setUseNew(!useNew)} className="text-sm text-accent hover:underline">
                    {useNew ? "Use saved address" : "+ Use a new address"}
                  </button>
                </div>
              )}

              {(useNew || addresses.length === 0) && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {([
                    ["full_name", "Full Name", true, 2],
                    ["street", "Street Address", true, 2],
                    ["city", "City", true, 1],
                    ["state", "State / Province", false, 1],
                    ["postal_code", "Postal Code", true, 1],
                    ["country", "Country", true, 1],
                    ["phone", "Phone", false, 2],
                  ] as const).map(([k, label, req, span]) => (
                    <div key={k} className={span === 2 ? "sm:col-span-2" : ""}>
                      <label className="block text-xs font-medium mb-1.5">{label}</label>
                      <input
                        required={req} value={(newAddress as any)[k]}
                        onChange={(e) => setNewAddress({ ...newAddress, [k]: e.target.value })}
                        className="w-full px-3 py-2.5 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/50"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Billing */}
            <div className="bg-card rounded-2xl p-6">
              <h2 className="font-display text-lg font-bold mb-5">Billing Details</h2>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={billingSame} onChange={(e) => setBillingSame(e.target.checked)} className="w-4 h-4 accent-accent" />
                <span className="text-sm">Billing address same as shipping</span>
              </label>
              {!billingSame && (
                <p className="text-sm text-muted-foreground mt-4">A billing address will be collected at the secure payment step.</p>
              )}
            </div>

            {/* Payment */}
            <div className="bg-card rounded-2xl p-6">
              <h2 className="font-display text-lg font-bold mb-5">Payment Method</h2>
              <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${paymentMethod === "stripe" ? "border-accent bg-accent/5" : "border-border"}`}>
                <input type="radio" name="pay" value="stripe" checked={paymentMethod === "stripe"} onChange={(e) => setPaymentMethod(e.target.value)} className="sr-only" />
                <CreditCard size={20} className="text-accent" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Credit / Debit Card</p>
                  <p className="text-xs text-muted-foreground">Securely processed by Stripe</p>
                </div>
              </label>
            </div>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-28 self-start">
            <div className="bg-card rounded-2xl p-6 space-y-4">
              <h2 className="font-display text-lg font-bold">Order Summary</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((i) => (
                  <div key={i.id} className="flex gap-3">
                    <div className="w-14 h-14 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                      <img src={i.product.image_url || "/placeholder.svg"} alt={i.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{i.product.name}</p>
                      <p className="text-xs text-muted-foreground">Qty {i.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">${(i.product.price * i.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 pt-4 border-t border-border text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${totalPrice.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>${shipping.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>${tax.toFixed(2)}</span></div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <span className="font-display font-semibold">Total</span>
                <span className="font-display text-xl font-bold">${grand.toFixed(2)}</span>
              </div>
              <button
                type="submit" disabled={processing}
                className="w-full py-3.5 bg-foreground text-background font-display font-semibold rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : "Place Order"}
              </button>
              <button type="button" onClick={() => navigate("/cart")} className="block w-full text-center text-sm text-muted-foreground hover:text-accent">
                Back to cart
              </button>
            </div>
          </aside>
        </form>
      </section>
    </PageLayout>
  );
};

export default Checkout;
