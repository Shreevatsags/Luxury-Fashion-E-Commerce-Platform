import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

const signupSchema = loginSchema.extend({
  fullName: z.string().trim().min(2, "Name too short").max(80),
});

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">(
    searchParams.get("mode") === "register" ? "register" : "login"
  );
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate("/"); }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const schema = mode === "login" ? loginSchema : signupSchema;
    const parsed = schema.safeParse(mode === "login" ? { email, password } : { email, password, fullName });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => { if (err.path[0]) fieldErrors[String(err.path[0])] = err.message; });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) toast.error(error.message); else { toast.success("Welcome back!"); navigate("/"); }
    } else {
      const { error } = await signUp(email, password);
      if (error) toast.error(error.message); else toast.success("Account created — check your inbox!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
        <Link to="/" className="block text-center font-display text-3xl font-bold text-foreground mb-10 tracking-tight">ÉLEVE</Link>

        <div className="bg-card rounded-2xl p-8 shadow-[var(--card-shadow)]">
          <h2 className="font-display text-2xl font-bold mb-2">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            {mode === "login" ? "Sign in to access your cart and orders" : "Join us for a curated shopping experience"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="Jane Doe"
                />
                {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Password</label>
                {mode === "login" && (
                  <Link to="/forgot-password" className="text-xs text-accent hover:underline">Forgot?</Link>
                )}
              </div>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="w-full py-3.5 bg-foreground text-background font-display font-semibold rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50">
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setErrors({}); }} className="text-accent font-medium hover:underline">
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
