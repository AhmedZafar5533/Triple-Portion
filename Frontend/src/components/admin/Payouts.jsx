import React, { useState, useEffect } from "react";
import { 
  Search, CreditCard, User, History, 
  ArrowUpRight, DollarSign, ChevronRight, AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAdminStore } from "../../store/adminStore";
import { SkeletonTable } from "../Skeleton";
import Pagination from "../dashboard/Pagination";

const Payouts = () => {
  const { payouts, getPayouts, approvedVendors, getApprovedVendors, loading, pagination } = useAdminStore();
  const [historyPage, setHistoryPage] = useState(1);
  const [vendorPage, setVendorPage] = useState(1);
  const [historySearch, setHistorySearch] = useState("");
  const [vendorSearch, setVendorSearch] = useState("");

  // Debounced vendor search
  useEffect(() => {
    const timer = setTimeout(() => {
      getApprovedVendors(vendorPage, 6, vendorSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [getApprovedVendors, vendorPage, vendorSearch]);

  // Debounced history fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      getPayouts(historyPage, 10); // Search not implemented for payouts yet on backend
    }, 500);
    return () => clearTimeout(timer);
  }, [getPayouts, historyPage]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0
    }).format(amount || 0);

  // Stats calculation (This might need a separate endpoint for accuracy in a paginated world)
  // For now we'll use what's loaded, but it's not perfect.
  const totalPayoutsAmount = (payouts || []).reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalBalanceDue = (approvedVendors || []).reduce((sum, v) => sum + (v.balanceDue || 0), 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Financial Payouts</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Monitor platform-wide transfers and manage partner balances</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
            <DollarSign size={20} />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Paid Out</p>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(totalPayoutsAmount)}</h3>
          <p className="text-[10px] text-slate-400 mt-1 font-bold">{pagination.payouts.totalItems} successful transfers</p>
        </div>
        
        <div className={`p-6 rounded-[2rem] border shadow-sm transition-all ${
          totalBalanceDue > 0 
            ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/30' 
            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
            totalBalanceDue > 0 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
          }`}>
            <ArrowUpRight size={20} />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Pending Dues</p>
          <h3 className={`text-xl font-bold mt-1 ${totalBalanceDue > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
            {formatCurrency(totalBalanceDue)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-1 font-bold">Partners awaiting payment</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 mb-4">
            <History size={20} />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Platform Transfers</p>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{pagination.payouts.totalItems} Records</h3>
          <p className="text-[10px] text-slate-400 mt-1 font-bold">Comprehensive audit trail</p>
        </div>
      </div>

      {/* 1. VENDORS DIRECTORY */}
      <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-7 border-b border-slate-50 dark:border-slate-700 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Partner Balances</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Select a vendor to process a transfer</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter partners..."
              value={vendorSearch}
              onChange={(e) => { setVendorSearch(e.target.value); setVendorPage(1); }}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none text-sm font-semibold focus:ring-2 ring-rose-100 transition-all shadow-inner"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-y divide-slate-50 dark:divide-slate-700">
          {approvedVendors.length === 0 ? (
            <div className="col-span-2 p-12 text-center text-slate-400 text-sm font-medium italic">No active vendors found</div>
          ) : (
            approvedVendors.map((vendor) => (
              <Link
                key={vendor._id}
                to={`/dashboard/admin/payout-management/process/${vendor._id}`}
                className="flex items-center justify-between p-6 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-all group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg shadow-slate-900/10 transition-transform group-hover:scale-105">
                    {vendor.businessDetails?.businessName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{vendor.businessDetails?.businessName}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {vendor._id?.substr(-6).toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Balance Due</p>
                    <p className={`text-base font-bold ${(vendor.balanceDue || 0) > 0 ? 'text-rose-600' : 'text-slate-300'}`}>
                      {formatCurrency(vendor.balanceDue)}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-300 group-hover:text-rose-600 group-hover:bg-rose-50 dark:group-hover:bg-rose-900/20 transition-all">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
        <div className="p-4 border-t border-slate-50 dark:border-slate-700">
           <Pagination 
             currentPage={vendorPage} 
             totalPages={pagination.vendors.totalPages} 
             onPageChange={setVendorPage} 
           />
        </div>
      </div>

      {/* 2. PAYOUT HISTORY */}
      <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-7 border-b border-slate-50 dark:border-slate-700 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Recent Payouts</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Audit trail of all settled vendor dues</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter history..."
              value={historySearch}
              onChange={(e) => { setHistorySearch(e.target.value); setHistoryPage(1); }}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none text-sm font-semibold focus:ring-2 ring-rose-100 transition-all shadow-inner"
            />
          </div>
        </div>

        <div className="overflow-x-auto hidden lg:block">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-900/30 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-700">
              <tr>
                <th className="px-8 py-5">Partner Profile</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Method / Ref</th>
                <th className="px-8 py-5">Authorized By</th>
                <th className="px-8 py-5 text-right">Settled Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {loading && payouts.length === 0 ? (
                <tr><td colSpan="5" className="p-0"><SkeletonTable rows={5} cols={5} /></td></tr>
              ) : payouts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-300">
                        <AlertCircle size={24} />
                      </div>
                      <p className="text-slate-400 text-sm font-bold italic uppercase tracking-widest">No matching payout records</p>
                    </div>
                  </td>
                </tr>
              ) : payouts.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {p.vendorId?.businessDetails?.businessName || "Unknown Vendor"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                      {p.vendorId?.businessDetails?.legalBusinessName || "N/A"}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-emerald-600">{formatCurrency(p.amount)}</span>
                    {p.snapshot?.balanceDueAfterPayout !== undefined && (
                      <p className="text-[9px] text-slate-400 mt-1 font-bold">Bal: {formatCurrency(p.snapshot.balanceDueAfterPayout)}</p>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <CreditCard size={14} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{p.paymentMethod}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-1.5 bg-slate-50 dark:bg-slate-900/50 px-2 py-0.5 rounded-md inline-block">
                      {p.transactionReference || "No Reference"}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white flex items-center justify-center text-[10px] font-bold shadow-lg shadow-slate-900/10">
                        {p.adminId?.username?.charAt(0).toUpperCase() || <User size={12} />}
                      </div>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{p.adminId?.username}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <p className="text-[11px] font-bold text-slate-900 dark:text-white">{new Date(p.createdAt).toLocaleDateString()}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5 font-bold uppercase tracking-widest">{new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile History View */}
        <div className="lg:hidden divide-y divide-slate-50 dark:divide-slate-700/50">
           {payouts.map((p) => (
             <div key={p._id} className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                   <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {p.vendorId?.businessDetails?.businessName || "Unknown Vendor"}
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Ref: {p.transactionReference?.substr(-8) || "N/A"}</p>
                   </div>
                   <span className="text-sm font-bold text-emerald-600">{formatCurrency(p.amount)}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-y border-slate-50 dark:border-slate-700/50">
                   <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                        <CreditCard size={12} className="text-slate-400" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{p.paymentMethod}</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white flex items-center justify-center text-[8px] font-bold">
                        {p.adminId?.username?.charAt(0).toUpperCase() || "A"}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{p.adminId?.username}</span>
                   </div>
                </div>

                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                   <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                   <span className="uppercase">{new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
             </div>
           ))}
           {payouts.length === 0 && (
              <div className="p-10 text-center text-slate-400 text-xs italic">No matching records</div>
           )}
        </div>
        <div className="p-6 border-t border-slate-50 dark:border-slate-700">
          <Pagination 
            currentPage={historyPage} 
            totalPages={pagination.payouts.totalPages} 
            onPageChange={setHistoryPage} 
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Payouts;
