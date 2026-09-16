import React, { useState, useEffect } from "react";
import {
  Search, Eye, XCircle,
  Clock, Package, User, MapPin
} from "lucide-react";
import { useAdminStore } from "../../store/adminStore";
import { SkeletonTable } from "../Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { IMG_BASE_URL } from "../../config";
import Pagination from "../dashboard/Pagination";

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { orders, getOrders, loading, pagination } = useAdminStore();
  const { totalPages, totalItems } = pagination.orders;

  // Debounced fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      getOrders(currentPage, 10, statusFilter, searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [getOrders, currentPage, statusFilter, searchQuery]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const styles = {
      Processing: "bg-blue-50 text-blue-600 border-blue-100",
      Completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
      Cancelled: "bg-rose-50 text-rose-600 border-rose-100",
      Pending: "bg-amber-50 text-amber-600 border-amber-100"
    };
    return (
      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${styles[status] || "bg-slate-50 text-slate-600"}`}>
        {status}
      </span>
    );
  };

  if (loading && orders.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <SkeletonTable rows={5} cols={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Order Management</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Monitor and manage all customer orders across the platform ({totalItems})</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by ID..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:border-rose-500 transition-all text-sm font-medium shadow-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {["all", "Processing", "Completed", "Cancelled"].map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
                statusFilter === s 
                  ? "bg-rose-600 text-white border-rose-600" 
                  : "bg-white text-slate-500 border-slate-100 dark:bg-slate-800 dark:border-slate-700 hover:border-rose-200"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5">Order Info</th>
                <th className="px-6 py-5">Customer</th>
                <th className="px-6 py-5">Amount</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Payment</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {orders.map(order => (
                <tr key={order._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">#{order._id.substr(-6).toUpperCase()}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                        <Clock size={10} />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                        {order.buyerId?.username?.charAt(0) || <User size={14} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{order.buyerId?.username || "Guest"}</p>
                        <p className="text-[10px] text-slate-400 truncate">{order.buyerId?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{formatCurrency(order.grandTotal)}</p>
                    <p className="text-[9px] text-slate-400 font-bold">{order.items.length} Items</p>
                  </td>
                  <td className="px-6 py-5">{getStatusBadge(order.status)}</td>
                  <td className="px-6 py-5">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${
                      order.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-rose-500'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all cursor-pointer"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Package size={40} className="text-slate-200" />
                      <p className="text-slate-400 text-sm font-medium italic">No orders found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={setCurrentPage} 
      />

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] border border-slate-100 dark:border-slate-700"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-rose-500">
                    <Package size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Order Details</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">#{selectedOrder._id}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer">
                  <XCircle size={20} className="text-slate-400" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Status and Payment */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Order Status</p>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Payment Status</p>
                    <p className={`text-sm font-bold ${selectedOrder.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {selectedOrder.paymentStatus}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Ordered Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden flex-shrink-0">
                          <img src={`${IMG_BASE_URL}${item.image}`} className="w-full h-full object-contain p-2" alt={item.name} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.category}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500">Qty: {item.quantity}</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{formatCurrency(item.priceAtPurchase * item.quantity)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Shipping Address</h3>
                  <div className="p-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-[2rem] flex items-start gap-4">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-rose-500">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedOrder.shippingAddress?.fullName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{selectedOrder.shippingAddress?.district} District</p>
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-2">{selectedOrder.shippingAddress?.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700">
                <div className="space-y-2">
                   <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                     <span>Subtotal</span>
                     <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                   </div>
                   <div className="flex justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                     <span>Delivery Fee</span>
                     <span>{formatCurrency(selectedOrder.totalDeliveryFee)}</span>
                   </div>
                   <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-200 dark:border-slate-700">
                     <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Grand Total</span>
                     <span className="text-xl font-bold text-rose-600">{formatCurrency(selectedOrder.grandTotal)}</span>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Orders;
