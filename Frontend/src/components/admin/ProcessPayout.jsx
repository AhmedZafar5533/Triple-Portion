import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, DollarSign, TrendingUp, Wallet, AlertTriangle,
  CheckCircle2, ShoppingBag, Calendar, CreditCard, User, Info,
  ChevronRight, Clock, Receipt
} from "lucide-react";
import { useAdminStore } from "../../store/adminStore";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardSkeleton } from "../Skeleton";

const ProcessPayout = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const { vendorFinancials, getVendorFinancials, createPayout, loading, success } = useAdminStore();

  const [selectedEntries, setSelectedEntries] = useState([]);
  const [formData, setFormData] = useState({
    paymentMethod: "Bank Transfer",
    transactionReference: "",
    notes: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getVendorFinancials(vendorId);
  }, [vendorId]);

  // Navigate back on successful payout
  useEffect(() => {
    if (success && submitting) {
      navigate("/dashboard/admin/payout-management");
    }
  }, [success]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0
    }).format(amount || 0);

  const formatDate = (d) =>
    new Date(d).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });

  if (loading || !vendorFinancials) return <DashboardSkeleton />;

  const { vendor, ledgerEntries = [], payoutHistory = [] } = vendorFinancials;
  const balanceDue = vendor.balanceDue || 0;
  const totalEarnings = vendor.totalEarnings || 0;
  const totalPaid = vendor.totalPaid || 0;

  // Filter unpaid entries for selection
  const unpaidEntries = ledgerEntries.filter(e => e.status === 'Unpaid');
  
  const selectedTotal = selectedEntries.reduce((sum, id) => {
    const entry = unpaidEntries.find(e => e._id === id);
    return sum + (entry?.amountEarned || 0);
  }, 0);

  const handleToggleEntry = (id) => {
    setSelectedEntries(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedEntries.length === unpaidEntries.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(unpaidEntries.map(e => e._id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedEntries.length === 0) return;
    setSubmitting(true);
    createPayout({ 
      vendorId, 
      ledgerEntryIds: selectedEntries,
      ...formData 
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8 pb-24"
    >
      {/* Back header */}
      <div className="flex items-center gap-5">
        <button
          onClick={() => navigate("/dashboard/admin/payout-management")}
          className="p-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-2xl border border-slate-100 dark:border-slate-700 transition-all group shadow-sm"
        >
          <ArrowLeft size={20} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Process Payout
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {vendor.businessDetails?.businessName} · ID: {vendor._id?.substr(-6).toUpperCase()}
          </p>
        </div>
      </div>

      {/* Financial summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600 mb-4 font-bold">
            <TrendingUp size={20} />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lifetime Earnings</p>
          <h3 className="text-xl font-bold text-emerald-600 mt-1">{formatCurrency(totalEarnings)}</h3>
          <p className="text-[10px] text-slate-400 mt-1 font-bold">{ledgerEntries.length} entries tracked</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 mb-4 font-bold">
            <Wallet size={20} />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Paid Out</p>
          <h3 className="text-xl font-bold text-blue-600 mt-1">{formatCurrency(totalPaid)}</h3>
          <p className="text-[10px] text-slate-400 mt-1 font-bold">{payoutHistory.length} transfers recorded</p>
        </div>
        <div className={`p-6 rounded-[2rem] border shadow-sm transition-all ${
          balanceDue > 0
            ? "bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800/30"
            : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700"
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
            balanceDue > 0 ? "bg-rose-100 dark:bg-rose-900/30 text-rose-600" : "bg-slate-100 dark:bg-slate-700 text-slate-400"
          }`}>
            <DollarSign size={20} />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Balance Due</p>
          <h3 className={`text-xl font-bold mt-1 ${balanceDue > 0 ? "text-rose-600" : "text-slate-400"}`}>
            {formatCurrency(balanceDue)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-1 font-bold">
            {balanceDue > 0 ? "Awaiting settlement" : "Account fully settled"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* LEFT: Ledger + payout history */}
        <div className="xl:col-span-3 space-y-6">

          {/* Earnings ledger */}
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Earnings & Dues Ledger</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Detailed breakdown of pending and settled order earnings</p>
              </div>
              {unpaidEntries.length > 0 && (
                <button 
                  onClick={handleSelectAll}
                  className="text-[10px] font-bold text-rose-500 uppercase tracking-widest bg-rose-50 dark:bg-rose-900/20 px-3 py-1.5 rounded-lg hover:bg-rose-100 transition-colors"
                >
                  {selectedEntries.length === unpaidEntries.length ? "Deselect All" : "Select All Unpaid"}
                </button>
              )}
            </div>

            {ledgerEntries.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">No earnings recorded yet</div>
            ) : (
              <div className="divide-y divide-slate-50 dark:divide-slate-700 max-h-[500px] overflow-y-auto custom-scrollbar">
                {ledgerEntries.map((entry) => {
                  const isPaid = entry.status === 'Paid';
                  const isSelected = selectedEntries.includes(entry._id);

                  return (
                    <div 
                      key={entry._id} 
                      onClick={() => !isPaid && handleToggleEntry(entry._id)}
                      className={`px-6 py-5 transition-all cursor-pointer ${
                        isPaid ? "opacity-60 grayscale-[0.5]" : isSelected ? "bg-rose-50/30 dark:bg-rose-900/5" : "hover:bg-slate-50/50 dark:hover:bg-slate-700/30"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="pt-1">
                          {isPaid ? (
                            <CheckCircle2 size={18} className="text-emerald-500" />
                          ) : (
                            <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${
                              isSelected ? "bg-rose-500 border-rose-500" : "border-slate-300 dark:border-slate-600"
                            }`}>
                              {isSelected && <CheckCircle2 size={12} className="text-white" />}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">
                                Order #{entry.orderId?._id?.substr(-6).toUpperCase() || "N/A"}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {entry.buyerId?.username || "Customer"} · {formatDate(entry.createdAt)}
                              </p>
                            </div>
                            <span className={`text-sm font-bold ${isPaid ? "text-slate-400" : "text-emerald-600"}`}>
                              +{formatCurrency(entry.amountEarned)}
                            </span>
                          </div>

                          {/* Item breakdown */}
                          <div className="mt-3 space-y-1">
                            {entry.items?.slice(0, 2).map((item, i) => (
                              <div key={i} className="flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-slate-300 flex-shrink-0" />
                                <p className="text-[10px] text-slate-500 truncate max-w-[200px]">
                                  {item.name} ×{item.quantity}
                                </p>
                                <span className="text-[10px] font-bold text-slate-400 ml-auto">
                                  {formatCurrency(item.lineTotal)}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-3 flex items-center gap-2">
                             <span className={`px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest ${
                               isPaid ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                             }`}>
                               {isPaid ? "Settled" : "Awaiting Payout"}
                             </span>
                             {isPaid && (
                               <span className="text-[9px] text-slate-400 italic">Paid in full</span>
                             )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payout history */}
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Payout History</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Previous transfers to this vendor</p>
              </div>
              <Clock size={18} className="text-slate-300" />
            </div>

            {payoutHistory.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">No payouts made yet</div>
            ) : (
              <div className="divide-y divide-slate-50 dark:divide-slate-700">
                {payoutHistory.map((p) => (
                  <div key={p._id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 flex-shrink-0">
                        <CreditCard size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{p.paymentMethod}</p>
                        <p className="text-[10px] text-slate-400">{formatDate(p.createdAt)}</p>
                        {p.transactionReference && (
                          <p className="text-[9px] text-slate-400 font-mono">{p.transactionReference}</p>
                        )}
                        <p className="text-[9px] text-slate-400 mt-0.5">By: {p.adminId?.username} · {p.ledgerEntryIds?.length || 0} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-600">-{formatCurrency(p.amount)}</p>
                      <p className="text-[9px] text-slate-400">Balance after: {formatCurrency(p.snapshot?.balanceDueAfterPayout)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Payout form */}
        <div className="xl:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden sticky top-8">
            <div className="p-7 border-b border-slate-50 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Finalize Settlement</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Authorizing transfer for selected dues</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">

              {/* Selection Summary */}
              <div className="p-7 bg-slate-900 dark:bg-white rounded-[2.25rem] text-white dark:text-slate-900 shadow-2xl shadow-slate-900/20">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Settlement Amount</p>
                <h3 className="text-4xl font-bold mt-2 tracking-tight">{formatCurrency(selectedTotal)}</h3>
                <div className="mt-6 pt-6 border-t border-white/10 dark:border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Receipt size={14} className="opacity-60" />
                    <span className="text-xs font-bold">{selectedEntries.length} Items</span>
                  </div>
                  <AnimatePresence>
                    {selectedTotal > 0 && (
                      <motion.span 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 dark:text-emerald-600 px-3 py-1 rounded-xl shadow-inner"
                      >
                        Authorized
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {selectedEntries.length === 0 ? (
                <div className="p-10 text-center border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-[2rem] bg-slate-50/50 dark:bg-slate-900/50">
                  <AlertTriangle size={24} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Select orders from the ledger to enable transfer</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Payment Method</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-slate-900 dark:focus:border-white rounded-2xl outline-none transition-all text-sm font-bold text-slate-900 dark:text-white shadow-inner"
                    >
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Mobile Money">Mobile Money</option>
                      <option value="Cash">Cash</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Reference Number</label>
                    <input
                      type="text"
                      value={formData.transactionReference}
                      onChange={(e) => setFormData({ ...formData, transactionReference: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-slate-900 dark:focus:border-white rounded-2xl outline-none transition-all text-sm font-bold text-slate-900 dark:text-white shadow-inner"
                      placeholder="TXN-ID or Receipt #"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Internal Notes</label>
                    <textarea
                      rows="2"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-slate-900 dark:focus:border-white rounded-2xl outline-none transition-all text-sm font-bold text-slate-900 dark:text-white shadow-inner resize-none"
                      placeholder="Auditor notes..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || loading || selectedEntries.length === 0}
                    className="w-full py-5 bg-rose-600 text-white font-bold rounded-[1.75rem] hover:bg-rose-700 active:scale-[0.98] transition-all uppercase tracking-widest text-xs shadow-xl shadow-rose-900/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {submitting || loading ? (
                      <span className="animate-pulse">Authorizing...</span>
                    ) : (
                      <>
                        <CheckCircle2 size={18} />
                        Confirm {formatCurrency(selectedTotal)}
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProcessPayout;
