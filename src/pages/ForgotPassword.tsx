import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const schema = z.string().trim().email("Invalid email").max(255);

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const parsed = schema.safeParse(email);
    if (!parsed.success) { setError(parsed.error.errors[0].message); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else { setSent(true); toast.success("Reset link sent — check your email"); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link to="/" className="block text-center font-display text-3xl font-bold mb-10">ÉLEVE</Link>
        <div className="bg-card rounded-2xl p-8 shadow-[var(--card-shadow)]">
          <h2 className="font-display text-2xl font-bold mb-2">Reset Password</h2>
          <p className="text-muted-foreground text-sm mb-8">
            {sent ? "Check your inbox for a password reset link." : "Enter your email and we'll send you a reset link."}
          </p>
          {!sent && (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="you@example.com"
                />
                {error && <p className="text-xs text-destructive mt-1">{error}</p>}
              </div>
              <button type="submit" disabled={loading} className="w-full py-3.5 bg-foreground text-background font-display font-semibold rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50">
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}
          <p className="text-center text-sm text-muted-foreground mt-6">
            <Link to="/auth" className="text-accent hover:underline">Back to sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
