import React, { useState, useEffect } from "react";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { useServiceStore } from "../store/serviceStore";
import { Link, useNavigate } from "react-router-dom";

import { IMG_BASE_URL } from "../config";

const IMG_BASE = IMG_BASE_URL;

const CartDrawer = () => {
  const { items, isOpen, closeCart, loading } = useCartStore();
  const { authenticationState } = useAuthStore();
  const { activeServicesMap, fetchActiveServices } = useServiceStore();
  const navigate = useNavigate();

  const [isSelfPickup, setIsSelfPickup] = useState(false);

  useEffect(() => {
    if (isOpen && Object.keys(activeServicesMap).length === 0) {
      fetchActiveServices();
    }
  }, [isOpen, activeServicesMap, fetchActiveServices]);

  const remove = (productId) => {
    if (authenticationState) useCartStore.getState().removeItemServer(productId);
    else useCartStore.getState().removeItemGuest(productId);
  };

  const updateQty = (productId, qty) => {
    if (authenticationState) useCartStore.getState().updateQtyServer(productId, qty);
    else useCartStore.getState().updateQtyGuest(productId, qty);
  };

  const handleCheckout = () => {
    closeCart();
    if (!authenticationState) {
      navigate("/login");
    } else {
      navigate("/checkout");
    }
  };

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => {
    if (i.category === "Tour") {
      const days = i.selectedDates?.length || 1;
      const gs = i.groupSize || 1;
      return sum + (i.price * gs * days);
    } else if (i.category === "Accommodation") {
      const nights = i.selectedDates?.length || 1;
      return sum + (i.price * i.quantity * nights);
    }
    return sum + (i.price * i.quantity);
  }, 0);

  let calculatedDeliveryCharge = 0;
  let hasPhysicalItems = false;
  items.forEach(item => {
    if (item.category !== "Tour" && item.category !== "Accommodation") {
      hasPhysicalItems = true;
      const charge = activeServicesMap[item.category] || 0;
      calculatedDeliveryCharge += charge * item.quantity;
    }
  });

  if (isSelfPickup) calculatedDeliveryCharge = 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-[9999] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-slate-900" />
                <h2 className="text-lg font-bold text-slate-900">Your Cart</h2>
                <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-xs font-bold rounded-full">{count}</span>
              </div>
              <button onClick={closeCart} className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2">
                {loading && <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />}
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Items */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-5 text-center">
                <ShoppingBag className="w-16 h-16 text-slate-200 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-1">Your cart is empty</h3>
                <p className="text-sm text-slate-500 mb-6">Add items to get started</p>
                <button onClick={closeCart} className="px-6 py-3 bg-rose-600 text-white text-sm font-bold rounded-xl hover:bg-rose-700 transition-colors">
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-4 p-3 bg-slate-50 rounded-xl">
                      {/* Image */}
                      <Link to={`/product/${item.productId}`} onClick={closeCart}
                        className="w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-slate-100">
                        {item.image ? (
                          <img src={`${IMG_BASE}${item.image}`} alt={item.name} className="w-full h-full object-contain p-1.5" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ShoppingBag className="w-6 h-6" />
                          </div>
                        )}
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.productId}`} onClick={closeCart}
                          className="text-sm font-semibold text-slate-900 line-clamp-2 hover:text-rose-600 transition-colors block">
                          {item.name}
                        </Link>
                        <p className="text-[10px] text-slate-400 uppercase font-medium mt-0.5">{item.category}</p>
                        {item.selectedDates && item.selectedDates.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            <p className="text-[9px] text-rose-500 font-bold uppercase tracking-tighter">Dates ({item.selectedDates.length})</p>
                            <div className="flex flex-wrap gap-1">
                              {item.selectedDates.slice(0, 2).map((d, idx) => (
                                <span key={idx} className="text-[8px] bg-rose-50 text-rose-600 px-1 py-0.5 rounded-md font-bold">
                                  {new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </span>
                              ))}
                              {item.selectedDates.length > 2 && (
                                <span className="text-[8px] text-slate-400 font-bold">+{item.selectedDates.length - 2}</span>
                              )}
                            </div>
                          </div>
                        )}
                        {item.category === "Tour" && (item.groupSize || 1) > 1 && (
                          <p className="text-[9px] text-blue-500 font-bold uppercase tracking-tighter mt-0.5">{item.groupSize} People</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                            <button onClick={() => updateQty(item.productId, item.quantity - 1)}
                              disabled={loading}
                              className="px-2 py-1 text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-xs font-bold text-slate-900">{item.quantity}</span>
                            <button onClick={() => updateQty(item.productId, item.quantity + 1)}
                              disabled={loading || ((item.category === "Tour" || item.category === "Accommodation") && item.quantity >= 1)}
                              className="px-2 py-1 text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-medium">
                              {item.originalPrice && item.originalPrice > item.price && (
                                <span className="line-through mr-1 text-slate-300">UGX {item.originalPrice.toLocaleString()}</span>
                              )}
                              UGX {item.price.toLocaleString()} ea
                            </p>
                            <p className="text-sm font-bold text-slate-900">
                              UGX {(() => {
                                if (item.category === "Tour") return (item.price * (item.groupSize || 1) * (item.selectedDates?.length || 1));
                                if (item.category === "Accommodation") return (item.price * item.quantity * (item.selectedDates?.length || 1));
                                return (item.price * item.quantity);
                              })().toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Remove */}
                      <button onClick={() => remove(item.productId)}
                        disabled={loading}
                        className="self-start p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-100 px-5 py-5 space-y-4 bg-white shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-semibold text-slate-900">UGX {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Estimated Delivery</span>
                      <span className="font-semibold text-green-600">
                        {calculatedDeliveryCharge > 0 ? `UGX ${calculatedDeliveryCharge.toLocaleString()}` : 'Free'}
                      </span>
                    </div>

                    {hasPhysicalItems && (
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          id="selfPickup"
                          checked={isSelfPickup}
                          onChange={(e) => setIsSelfPickup(e.target.checked)}
                          className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500 border-gray-300"
                        />
                        <label htmlFor="selfPickup" className="text-sm text-slate-600 font-medium cursor-pointer">
                          I will pick up the items myself
                        </label>
                      </div>
                    )}

                    <div className="pt-2 mt-2 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-base font-bold text-slate-900">Total</span>
                      <span className="text-xl font-bold text-rose-600">UGX {(subtotal + calculatedDeliveryCharge).toLocaleString()}</span>
                    </div>
                  </div>

                  {!authenticationState && (
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 leading-relaxed">
                      Please log in to proceed to checkout. Your cart will be synced across all your devices.
                    </p>
                  )}
                  <button onClick={handleCheckout}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 text-sm active:scale-[0.98]">
                    {authenticationState ? "Proceed to Checkout" : "Log In to Checkout"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
