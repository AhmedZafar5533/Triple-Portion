import React, { useState, useEffect } from "react";
import { Search, XCircle, CreditCard, User, ExternalLink } from "lucide-react";
import { useAdminStore } from "../../store/adminStore";
import { SkeletonTable } from "../Skeleton";
import Pagination from "../dashboard/Pagination";

const Payments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { payments, getPayments, loading, pagination } = useAdminStore();
  const { totalPages, totalItems } = pagination.payments;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Debounced search and status fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      getPayments(currentPage, 10, statusFilter, searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [getPayments, currentPage, statusFilter, searchQuery]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Success":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "Pending":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "Failed":
        return "bg-rose-50 text-rose-600 border-rose-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  // Note: Backend doesn't support status filtering or searching yet in the paginate call for payments
  // This will be a follow up or I'll just load the first page for now.
  const filteredPayments = payments || [];

  if (loading && payments.length === 0) {
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Payments & Transactions</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Monitor all financial flows and payment status ({totalItems})</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by TXN ID..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:border-rose-500 transition-all text-sm font-medium shadow-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {['all', 'Success', 'Pending', 'Failed'].map((status) => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
                statusFilter === status
                  ? "bg-rose-600 text-white border-rose-600" 
                  : "bg-white text-slate-500 border-slate-100 dark:bg-slate-800 dark:border-slate-700 hover:border-rose-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5">Transaction</th>
                <th className="px-6 py-5">Customer</th>
                <th className="px-6 py-5">Method</th>
                <th className="px-6 py-5">Amount</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {filteredPayments.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                  <td className="px-6 py-5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{p.transactionId || "N/A"}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                      {new Date(p.createdAt).toLocaleString()}
                    </p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {p.buyerId?.username?.charAt(0) || <User size={12} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{p.buyerId?.username || "Guest"}</p>
                        <p className="text-[10px] text-slate-400 truncate">{p.buyerEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                       <CreditCard size={14} className="text-slate-400" />
                       <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{p.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(p.amount)}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${getStatusBadge(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => setSelectedPayment(p)}
                      className="p-2 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                    >
                      <ExternalLink size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                 <tr>
                    <td colSpan="6" className="px-6 py-20 text-center text-slate-400 text-sm font-medium italic">
                      No payment records found
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

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Transaction Details</h2>
              <button onClick={() => setSelectedPayment(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl cursor-pointer">
                <XCircle size={20} className="text-slate-400" />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Transaction ID</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedPayment.transactionId}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${getStatusBadge(selectedPayment.status)}`}>
                    {selectedPayment.status}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Payment Method</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedPayment.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Amount</p>
                  <p className="text-lg font-bold text-rose-600">{formatCurrency(selectedPayment.amount)}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">Vendor Payouts</h3>
                {selectedPayment.vendors?.map((v, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-900 dark:text-white truncate">{v.vendorEmail}</p>
                      <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Commission {v.commissionRate}%</p>
                    </div>
                    <p className="text-xs font-bold text-emerald-600">{formatCurrency(v.amount)}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end">
              <button onClick={() => setSelectedPayment(null)} className="px-6 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl cursor-pointer">
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
