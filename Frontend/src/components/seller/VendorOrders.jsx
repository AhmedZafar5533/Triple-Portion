import React, { useState, useEffect } from "react";
import { 
  ShoppingCart, Package, Clock, CheckCircle2, 
  Search, Eye, Truck, AlertCircle, User 
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL, IMG_BASE_URL } from "../../config";

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/vendor`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders);
      }
    } catch (err) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, productId, newStatus) => {
    let cancelReason = null;
    if (newStatus === 'Cancelled') {
      cancelReason = window.prompt("Please provide a reason for cancellation:");
      if (!cancelReason || cancelReason.trim() === "") {
        toast.error("Cancellation reason is required");
        return;
      }
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/item-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, status: newStatus, cancelReason }),
        credentials: "include"
      });
      if (res.ok) {
        toast.success(`Status updated to ${newStatus}`);
        fetchOrders(); // Refresh
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
      case 'Completed':
      case 'Checked-out':
        return 'bg-emerald-100 text-emerald-700';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-700';
      case 'Processing':
      case 'Shipped':
      case 'Confirmed':
      case 'Checked-in':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Order Fulfilment</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Manage your products being ordered</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-2">
           <Search size={16} className="text-slate-400 ml-2" />
           <input 
              type="text" 
              placeholder="Search orders..."
              className="bg-transparent outline-none text-xs font-bold w-40 dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {orders.map((order) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={order._id} 
            className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all"
          >
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Order Info */}
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  order.isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  <ShoppingCart size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">#{order._id.substr(-6).toUpperCase()}</h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">Ordered {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 flex-shrink-0">
                        <img src={`${IMG_BASE_URL}${item.image}`} className="w-full h-full object-contain p-1" />
                      </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">
                            Qty: {item.quantity} 
                            {(item.category === "Tour" || item.category === "Accommodation") && item.selectedDates?.length > 0 && (
                              <span className="text-rose-500 ml-1">• {item.selectedDates.length} {item.category === "Tour" ? "Days" : "Nights"}</span>
                            )}
                          </p>
                          {(item.category === "Tour" || item.category === "Accommodation") && item.selectedDates?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.selectedDates.slice(0, 2).map((d, i) => (
                                <span key={i} className="text-[7px] bg-white dark:bg-slate-800 border border-slate-200 px-1 py-0.5 rounded font-bold">
                                  {new Date(d).toLocaleDateString()}
                                </span>
                              ))}
                              {item.selectedDates.length > 2 && <span className="text-[7px] text-slate-400">+{item.selectedDates.length - 2} more</span>}
                            </div>
                          )}
                        </div>
                      </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {formatCurrency(item.priceAtPurchase * item.quantity * ((item.category === "Tour" || item.category === "Accommodation") ? (item.selectedDates?.length || 1) : 1))}
                        </p>
                        <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      
                      <select 
                        value={item.status}
                        onChange={(e) => updateStatus(order._id, item.productId?._id || item.productId, e.target.value)}
                        disabled={!order.isPaid}
                        title={!order.isPaid ? "Cannot update status of an unpaid order" : ""}
                        className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-[10px] font-bold p-1 outline-none ${
                          !order.isPaid ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        {item.category === "Tour" || item.category === "Accommodation" ? (
                          <>
                            {item.status === 'Pending' && <option value="Pending">Pending</option>}
                            <option value="Confirmed">Confirmed</option>
                            <option value="Checked-in">Checked-in</option>
                            <option value="Checked-out">Checked-out</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Completed">Completed</option>
                          </>
                        ) : (
                          <>
                            {item.status === 'Pending' && <option value="Pending">Pending</option>}
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Actions/Status */}
              <div className="md:w-48 flex flex-col items-end gap-2">
                 <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Payment Status</p>
                    <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                      order.isPaid ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                      {order.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                 </div>
                 <button 
                  onClick={() => setSelectedOrder(order)}
                  className="mt-2 flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline"
                 >
                    Full Details <Eye size={12} />
                 </button>
              </div>
            </div>
          </motion.div>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700">
             <Package size={48} className="text-slate-200 mx-auto mb-4" />
             <h3 className="text-lg font-bold text-slate-900 dark:text-white">No orders yet</h3>
             <p className="text-slate-400 text-sm">When customers buy your products, they will appear here.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]"
            >
              <div className="p-5 sm:p-8 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-start mb-6 sm:mb-8 sticky top-0 bg-white dark:bg-slate-800 z-10 pb-2">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Order Details</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] mt-1">Order #{selectedOrder._id.toUpperCase()}</p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Buyer Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-rose-500">
                      <User size={18} />
                      <h4 className="text-sm font-bold uppercase tracking-widest">Customer Info</h4>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 space-y-2 border border-slate-100 dark:border-slate-700">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedOrder.buyerId?.name || "Guest User"}</p>
                      <p className="text-xs text-slate-500 font-medium">{selectedOrder.buyerId?.email || "No email"}</p>
                      <p className="text-xs text-slate-500 font-medium">{selectedOrder.buyerId?.phone || "No phone"}</p>
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-blue-500">
                      <Truck size={18} />
                      <h4 className="text-sm font-bold uppercase tracking-widest">Shipping Address</h4>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 space-y-1 border border-slate-100 dark:border-slate-700">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedOrder.shippingAddress?.fullName}</p>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        {selectedOrder.shippingAddress?.address},<br />
                        {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.district}
                      </p>
                      <p className="text-xs text-slate-500 font-bold mt-2">📞 {selectedOrder.shippingAddress?.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Items Summary in Modal */}
                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700 space-y-6">
                   <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ordered Items Details</h4>
                   <div className="space-y-6">
                      {selectedOrder.items.map((item, i) => {
                        const p = item.productId;
                        return (
                          <div key={i} className="bg-slate-50 dark:bg-slate-900/30 rounded-3xl p-5 border border-slate-100 dark:border-slate-700">
                             <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-4">
                                   <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex-shrink-0">
                                      <img src={`${IMG_BASE_URL}${item.image}`} className="w-full h-full object-contain p-1" />
                                   </div>
                                   <div>
                                      <p className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</p>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{item.category}</p>
                                      <p className="text-[10px] text-rose-500 font-bold mt-1">
                                        Qty: {item.quantity} 
                                        {item.selectedDates?.length > 0 && ` • ${item.selectedDates.length} ${item.category === "Tour" ? "Days" : "Nights"}`}
                                      </p>
                                      {item.status === 'Cancelled' && item.cancelReason && (
                                        <p className="text-[10px] text-rose-600 font-bold mt-2 bg-rose-50 p-2 rounded-xl border border-rose-100 italic">
                                          Reason: {item.cancelReason}
                                        </p>
                                      )}
                                   </div>
                                </div>
                                <p className="font-bold text-slate-900 dark:text-white text-sm">
                                  {formatCurrency(item.priceAtPurchase * item.quantity * ((item.category === "Tour" || item.category === "Accommodation") ? (item.selectedDates?.length || 1) : 1))}
                                </p>
                             </div>

                             {/* Useful Details from Product Object */}
                             {p && (
                               <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                                  {p.brand && <DetailItem label="Brand" value={p.brand} />}
                                  {p.model && <DetailItem label="Model" value={p.model} />}
                                  {p.propertyType && <DetailItem label="Property" value={p.propertyType} />}
                                  {p.roomType && <DetailItem label="Room" value={p.roomType} />}
                                  {p.maxOccupancy && <DetailItem label="Max Guests" value={p.maxOccupancy} />}
                                  {p.duration && <DetailItem label="Duration" value={p.duration} />}
                                  {p.location && <DetailItem label="Location" value={p.location} />}
                                  {p.weight && <DetailItem label="Weight" value={p.weight} />}
                                  {p.unit && <DetailItem label="Unit" value={p.unit} />}
                               </div>
                             )}

                             {/* Specifications */}
                             {p?.specifications?.length > 0 && (
                               <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-2">Specifications</p>
                                  <div className="grid grid-cols-1 gap-1">
                                     {p.specifications.slice(0, 5).map((spec, idx) => (
                                       <div key={idx} className="flex justify-between text-[10px] bg-white/50 dark:bg-slate-800/50 px-2 py-1 rounded">
                                          <span className="text-slate-400 font-bold">{spec.name}</span>
                                          <span className="text-slate-700 dark:text-slate-300 font-bold">{spec.value}</span>
                                       </div>
                                     ))}
                                  </div>
                               </div>
                             )}

                             {/* Dates if applicable */}
                             {item.selectedDates?.length > 0 && (
                               <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-2">Booking Dates</p>
                                  <div className="flex flex-wrap gap-1.5">
                                     {item.selectedDates.map((d, idx) => (
                                       <span key={idx} className="text-[8px] sm:text-[9px] bg-rose-50 text-rose-600 px-2 py-1 rounded-lg font-bold border border-rose-100/50">
                                          {new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                       </span>
                                     ))}
                                  </div>
                               </div>
                             )}
                          </div>
                        );
                      })}
                   </div>
                </div>

                <div className="sticky bottom-0 bg-white dark:bg-slate-800 pt-4 pb-2 mt-4">
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold rounded-2xl hover:opacity-90 transition-all uppercase tracking-widest text-xs shadow-xl shadow-slate-900/10"
                  >
                    Close Details
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const X = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default VendorOrders;

const DetailItem = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">{label}</span>
    <span className="text-xs text-slate-700 dark:text-slate-200 font-bold truncate">{value}</span>
  </div>
);
