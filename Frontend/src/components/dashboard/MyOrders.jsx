import React, { useState, useEffect } from "react";
import { 
  ShoppingCart, Package, Clock, CheckCircle2, 
  Search, Eye, Truck, AlertCircle, User, Info, MessageSquareWarning
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL, IMG_BASE_URL } from "../../config";
import ReportOrderModal from "./ReportOrderModal";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reportOrder, setReportOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/my-orders`, { credentials: "include" });
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredOrders = orders.filter(order => 
    order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">My Orders</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Track your purchases and order history</p>
        </div>
        <div className="w-full md:w-auto bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-2">
           <Search size={16} className="text-slate-400 ml-2" />
           <input 
              type="text" 
              placeholder="Search by ID or item..."
              className="bg-transparent outline-none text-xs font-bold w-full md:w-48 dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.map((order) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={order._id} 
            className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all"
          >
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                {/* Order Header */}
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    order.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    <Package size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Order #{order._id.substr(-6).toUpperCase()}</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                    <div className="flex gap-2 mt-2">
                       <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                        order.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                        {order.paymentStatus}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                        order.status === 'Completed' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="flex-1">
                   <div className="flex -space-x-3 overflow-hidden">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="inline-block h-10 w-10 rounded-xl ring-2 ring-white dark:ring-slate-800 bg-white dark:bg-slate-700 overflow-hidden border border-slate-100 dark:border-slate-600">
                          <img 
                            src={item.productId?.images?.[0] ? `${IMG_BASE_URL}${item.productId.images[0]}` : `${IMG_BASE_URL}${item.image}`} 
                            alt={item.name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                      {order.items.length > 5 && (
                        <div className="flex items-center justify-center h-10 w-10 rounded-xl ring-2 ring-white dark:ring-slate-800 bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-500">
                          +{order.items.length - 5}
                        </div>
                      )}
                   </div>
                   <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-2">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • Total: {formatCurrency(order.grandTotal)}
                   </p>
                </div>

                {/* Actions */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3">
                   <button 
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-slate-900/10"
                   >
                      View Details <Eye size={14} />
                   </button>
                   <button 
                    onClick={() => setReportOrder(order)}
                    disabled={order.paymentStatus !== 'Paid'}
                    title={order.paymentStatus !== 'Paid' ? "You can only report issues for paid orders" : ""}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                      order.paymentStatus === 'Paid' 
                      ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-100' 
                      : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                    }`}
                   >
                      Report Issue <MessageSquareWarning size={14} />
                   </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700">
             <ShoppingCart size={48} className="text-slate-200 mx-auto mb-4" />
             <h3 className="text-lg font-bold text-slate-900 dark:text-white">No orders found</h3>
             <p className="text-slate-400 text-sm">You haven't placed any orders yet or no match for your search.</p>
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
              className="relative w-full max-w-3xl bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-start mb-8 sticky top-0 bg-white dark:bg-slate-800 z-10 pb-2">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Order Details</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Order #{selectedOrder._id.toUpperCase()}</p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors dark:text-white">
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-blue-500">
                        <Truck size={18} />
                        <h4 className="text-sm font-bold uppercase tracking-widest">Shipping Address</h4>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 space-y-1 border border-slate-100 dark:border-slate-700">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedOrder.shippingAddress?.fullName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                          {selectedOrder.shippingAddress?.address},<br />
                          {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.district}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-2">📞 {selectedOrder.shippingAddress?.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-emerald-500">
                        <Info size={18} />
                        <h4 className="text-sm font-bold uppercase tracking-widest">Order Summary</h4>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 space-y-3 border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400 font-bold uppercase">Subtotal</span>
                          <span className="text-slate-900 dark:text-white font-bold">{formatCurrency(selectedOrder.totalAmount)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400 font-bold uppercase">Delivery</span>
                          <span className="text-slate-900 dark:text-white font-bold">{formatCurrency(selectedOrder.totalDeliveryFee)}</span>
                        </div>
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                          <span className="text-xs font-bold uppercase text-slate-900 dark:text-white">Total</span>
                          <span className="text-sm font-bold text-blue-600">{formatCurrency(selectedOrder.grandTotal)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Items in this order</h4>
                   <div className="space-y-3">
                      {selectedOrder.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                           <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex-shrink-0">
                              <img 
                                src={item.productId?.images?.[0] ? `${IMG_BASE_URL}${item.productId.images[0]}` : `${IMG_BASE_URL}${item.image}`} 
                                className="w-full h-full object-contain p-1" 
                              />
                           </div>
                           <div className="flex-1">
                              <p className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                                Qty: {item.quantity} • {formatCurrency(item.priceAtPurchase)} each
                              </p>
                              <div className="mt-2">
                                <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
                                  {item.status}
                                </span>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="font-bold text-slate-900 dark:text-white text-sm">
                                {formatCurrency(item.priceAtPurchase * item.quantity * ((item.category === "Tour" || item.category === "Accommodation") ? (item.selectedDates?.length || 1) : 1))}
                              </p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="mt-8">
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

      {/* Report Modal */}
      {reportOrder && (
        <ReportOrderModal 
          order={reportOrder} 
          onClose={() => setReportOrder(null)} 
          onSuccess={() => {
            setReportOrder(null);
            fetchOrders();
          }}
        />
      )}
    </div>
  );
};

const X = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default MyOrders;
