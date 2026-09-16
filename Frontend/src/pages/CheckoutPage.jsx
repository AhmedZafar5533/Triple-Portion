import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, MapPin, Truck, CreditCard, ShieldCheck, 
  Package, CheckCircle2, AlertCircle, Loader2, Phone, User as UserIcon
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { useServiceStore } from "../store/serviceStore";
import { toast } from "sonner";
import { IMG_BASE_URL, API_BASE_URL } from "../config";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { activeServicesMap, fetchFrontendServices } = useServiceStore();

  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Success
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    district: ""
  });

  const [paymentMethod, setPaymentMethod] = useState("Stripe");

  useEffect(() => {
    if (Object.keys(activeServicesMap).length === 0) {
      fetchFrontendServices();
    }
  }, [activeServicesMap, fetchFrontendServices]);

  // Calculations
  const subtotal = useMemo(() => items.reduce((sum, i) => {
    if (i.category === "Tour") {
      const days = i.selectedDates?.length || 1;
      const gs = i.groupSize || 1;
      return sum + (i.price * gs * days);
    } else if (i.category === "Accommodation") {
      const nights = i.selectedDates?.length || 1;
      return sum + (i.price * i.quantity * nights);
    }
    return sum + (i.price * i.quantity);
  }, 0), [items]);
  
  const deliveryDetails = useMemo(() => {
    let totalDelivery = 0;
    const itemsWithDelivery = items.map(item => {
      let charge = 0;
      if (item.category !== "Tour" && item.category !== "Accommodation") {
        const settings = activeServicesMap[item.category] || { deliveryChargePerItem: 0, freeDeliveryThreshold: 0 };
        const threshold = settings.freeDeliveryThreshold || 0;
        
        // If threshold is 0, or subtotal < threshold, charge applies
        if (threshold === 0 || subtotal < threshold) {
          charge = settings.deliveryChargePerItem || 0;
        }
      }
      totalDelivery += charge * item.quantity;
      return { ...item, deliveryCharge: charge };
    });
    return { items: itemsWithDelivery, total: totalDelivery };
  }, [items, activeServicesMap, subtotal]);

  const isServiceOnly = useMemo(() => items.every(i => i.category === "Tour" || i.category === "Accommodation"), [items]);

  const grandTotal = subtotal + deliveryDetails.total;

  const handleNextStep = () => {
    if (step === 1) {
      // Validate shipping
      const { fullName, phone, address, city, district } = shippingInfo;
      if (!fullName || !phone) {
        return toast.error("Please provide your name and phone number");
      }
      if (!isServiceOnly && (!address || !city || !district)) {
        return toast.error("Please fill all shipping fields for physical items");
      }
      setStep(2);
    }
  };

  const processCheckout = async () => {
    setLoading(true);
    try {
      const payload = {
        items: deliveryDetails.items.map(i => ({
          productId: i.productId,
          vendorId: i.vendorId,
          name: i.name,
          image: i.image,
          quantity: i.quantity,
          priceAtPurchase: i.price,
          deliveryCharge: i.deliveryCharge,
          category: i.category,
          selectedDates: i.selectedDates,
          groupSize: i.groupSize || 1
        })),
        shippingAddress: shippingInfo,
        totalAmount: subtotal,
        totalDeliveryFee: deliveryDetails.total,
        grandTotal: grandTotal,
        paymentMethod: paymentMethod
      };

      const response = await fetch(`${API_BASE_URL}/api/orders/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });

      const data = await response.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else if (data.success) {
        setOrderData(data.order);
        setStep(3);
        toast.success("Order placed successfully!");
        clearCart(); // Clear local state immediately
      } else {
        toast.error(data.message || data.payment?.reason || "Checkout failed. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred during checkout");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <Package className="w-16 h-16 text-slate-200 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
        <Link to="/" className="text-rose-600 font-bold hover:underline">Go back to shopping</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => step > 1 && step < 3 ? setStep(step - 1) : navigate(-1)} 
            className="p-2 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-all">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Checkout</h1>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-10 px-4 md:px-20 relative">
          <div className="absolute top-1/2 left-4 md:left-20 right-4 md:right-20 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
          {[1, 2, 3].map((s) => (
            <div key={s} className="relative z-10 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                step >= s ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20" : "bg-white text-slate-400 border border-slate-200"
              }`}>
                {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${step >= s ? "text-rose-600" : "text-slate-400"}`}>
                {s === 1 ? "Shipping" : s === 2 ? "Payment" : "Success"}
              </span>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="w-6 h-6 text-rose-500" />
                    <h2 className="text-xl font-bold text-slate-900">{isServiceOnly ? "Guest Information" : "Shipping Details"}</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text"
                          value={shippingInfo.fullName}
                          onChange={(e) => setShippingInfo({...shippingInfo, fullName: e.target.value})}
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl outline-none transition-all text-sm font-semibold"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="tel"
                          value={shippingInfo.phone}
                          onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl outline-none transition-all text-sm font-semibold"
                          placeholder="+256..."
                        />
                      </div>
                    </div>
                    {!isServiceOnly && (
                      <>
                        <div className="md:col-span-2 space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Detailed Address</label>
                          <textarea 
                            rows="3"
                            value={shippingInfo.address}
                            onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                            className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl outline-none transition-all text-sm font-semibold resize-none"
                            placeholder="Street name, Building, Apartment number..."
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">City</label>
                          <input 
                            type="text"
                            value={shippingInfo.city}
                            onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                            className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl outline-none transition-all text-sm font-semibold"
                            placeholder="Kampala"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">District</label>
                          <input 
                            type="text"
                            value={shippingInfo.district}
                            onChange={(e) => setShippingInfo({...shippingInfo, district: e.target.value})}
                            className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl outline-none transition-all text-sm font-semibold"
                            placeholder="Central"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <button 
                    onClick={handleNextStep}
                    className="w-full mt-8 py-4 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 group"
                  >
                    Proceed to Payment
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="w-6 h-6 text-rose-500" />
                    <h2 className="text-xl font-bold text-slate-900">Payment Method</h2>
                  </div>

                  <div className="space-y-4">
                    {[
                      { id: "Stripe", title: "Debit/Credit Card (Stripe)", desc: "Securely pay with Visa, Mastercard, etc." }
                    ].map((method) => (
                      <label 
                        key={method.id}
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          paymentMethod === method.id ? "border-rose-500 bg-rose-50/30" : "border-slate-100 bg-white hover:border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === method.id ? "border-rose-500" : "border-slate-300"
                          }`}>
                            {paymentMethod === method.id && <div className="w-2.5 h-2.5 bg-rose-500 rounded-full" />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{method.title}</p>
                            <p className="text-xs text-slate-500">{method.desc}</p>
                          </div>
                        </div>
                        <input 
                          type="radio" 
                          className="hidden" 
                          name="payment" 
                          checked={paymentMethod === method.id}
                          onChange={() => setPaymentMethod(method.id)}
                        />
                      </label>
                    ))}
                  </div>

                  <button 
                    onClick={processCheckout}
                    disabled={loading}
                    className="w-full mt-8 py-4 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/25 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Pay UGX {grandTotal.toLocaleString()}
                        <ShieldCheck className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100 text-center"
                >
                  <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={48} />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Order Confirmed!</h2>
                  <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                    Thank you for your purchase. Your order <strong>#{orderData?._id.substr(-6).toUpperCase()}</strong> has been placed and is being processed.
                  </p>

                  <div className="bg-slate-50 rounded-2xl p-6 text-left mb-8 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Transaction ID</span>
                      <span className="font-bold text-slate-900">MOCK-TXN-SUCCESS</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Amount Paid</span>
                      <span className="font-bold text-rose-600">UGX {grandTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => navigate("/dashboard/buyer")} className="flex-1 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all">
                      View My Orders
                    </button>
                    <button onClick={() => navigate("/")} className="flex-1 py-3.5 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all">
                      Back to Shop
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Order Summary</h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <div className="w-12 h-12 bg-slate-50 rounded-lg flex-shrink-0 border border-slate-100 overflow-hidden">
                      <img src={`${IMG_BASE_URL}${item.image}`} className="w-full h-full object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400">Qty: {item.quantity}</p>
                      {item.selectedDates && item.selectedDates.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          <p className="text-[9px] text-rose-500 font-bold uppercase tracking-tighter">Selected Dates ({item.selectedDates.length})</p>
                          <div className="flex flex-wrap gap-1">
                            {item.selectedDates.slice(0, 3).map((d, idx) => (
                              <span key={idx} className="text-[8px] bg-rose-50 text-rose-600 px-1 py-0.5 rounded-md font-bold">
                                {new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                            ))}
                            {item.selectedDates.length > 3 && (
                              <span className="text-[8px] text-slate-400 font-bold">+{item.selectedDates.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-900">
                      UGX {(item.price * item.quantity * ((item.category === "Tour" || item.category === "Accommodation") ? (item.selectedDates?.length || 1) : 1)).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-semibold text-slate-900">UGX {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Delivery Fee</span>
                  <span className="font-semibold text-green-600">
                    {deliveryDetails.total > 0 ? `UGX ${deliveryDetails.total.toLocaleString()}` : "FREE"}
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-base font-bold text-slate-900">Grand Total</span>
                  <span className="text-xl font-bold text-rose-600">UGX {grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-100 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-rose-500 flex-shrink-0" />
              <p className="text-[10px] text-rose-700 leading-relaxed font-medium">
                Your transaction is secured with 256-bit SSL encryption. All payments are processed through verified gateways.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple arrow icon component
const ArrowRight = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export default CheckoutPage;
