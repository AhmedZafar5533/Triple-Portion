import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const { clearCart } = useCartStore();

  useEffect(() => {
    // Clear cart upon successful return from Stripe
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100 text-center max-w-lg w-full"
      >
        <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Payment Successful!</h2>
        <p className="text-slate-500 mb-8 mx-auto">
          Thank you for your purchase. Your order has been placed and is now being processed.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => navigate("/dashboard/buyer")} 
            className="flex-1 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all"
          >
            View My Orders
          </button>
          <button 
            onClick={() => navigate("/")} 
            className="flex-1 py-3.5 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
          >
            Back to Shop
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CheckoutSuccess;
