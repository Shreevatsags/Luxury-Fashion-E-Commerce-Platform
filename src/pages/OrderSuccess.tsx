import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OrderSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/"), 8000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <CheckCircle size={72} className="mx-auto text-accent mb-6" />
        </motion.div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-3">
          Order Confirmed!
        </h1>
        <p className="text-muted-foreground mb-8">
          Thank you for your purchase. You'll receive a confirmation email shortly.
        </p>
        <a
          href="/"
          className="inline-block px-8 py-3.5 bg-foreground text-background font-display font-semibold rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors duration-300"
        >
          Continue Shopping
        </a>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
