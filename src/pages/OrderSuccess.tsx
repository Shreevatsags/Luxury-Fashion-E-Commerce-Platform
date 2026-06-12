import { motion } from "framer-motion";
import { CheckCircle, Package } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

const OrderSuccess = () => {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg bg-card rounded-2xl p-10 shadow-[var(--card-shadow)]"
      >
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}>
          <CheckCircle size={72} className="mx-auto text-accent mb-6" />
        </motion.div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-3">Order Confirmed!</h1>
        <p className="text-muted-foreground mb-6">
          Thank you for your purchase. We'll send a confirmation email shortly with shipping details.
        </p>
        {sessionId && (
          <div className="bg-background rounded-xl p-4 mb-8 text-left flex items-center gap-3">
            <Package size={20} className="text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Order reference</p>
              <p className="text-sm font-mono">{sessionId.slice(0, 24)}...</p>
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/profile" className="flex-1 px-6 py-3 border border-border font-display font-medium rounded-xl hover:bg-secondary transition-colors">
            View Orders
          </Link>
          <Link to="/shop" className="flex-1 px-6 py-3 bg-foreground text-background font-display font-semibold rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors">
            Continue Shopping
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
