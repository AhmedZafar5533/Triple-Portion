import { useEffect, useState } from "react";
import { Filter, Search, Eye, XCircle } from "lucide-react";
import { useAdminStore } from "../../store/adminStore";
import { SkeletonTable } from "../Skeleton";
import { Link } from "react-router-dom";
import Pagination from "../dashboard/Pagination";

const PendingVendors = () => {
  const { pendingVendors, loading, getPendingVendors, pagination } = useAdminStore();
  const { totalPages, totalItems } = pagination.pending;
  const [filterOption, setFilterOption] = useState("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      getPendingVendors(currentPage, 6, searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [getPendingVendors, currentPage, searchQuery]);

  const handleFilterChange = (option) => {
    setFilterOption(option);
    setShowFilterMenu(false);
    setCurrentPage(1);
    // Sort logic removed for now as it needs backend support for full consistency
  };

  if (loading && pendingVendors.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div className="space-y-2">
                <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            </div>
        </div>
        <SkeletonTable rows={6} cols={5} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col mb-20 p-2">
      <div className="mb-6 flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Pending Vendors
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
            Review and approve new vendor applications ({totalItems})
            </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
        <div className="relative group flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors" size={20} />
            <input
                type="text"
                placeholder="Search business name or email..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
            />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium shadow-sm cursor-pointer"
            >
              <Filter size={18} className="text-rose-500" />
              <span>
                {filterOption === "all"
                  ? "All Applications"
                  : filterOption === "recent"
                  ? "Most Recent"
                  : "Oldest First"}
              </span>
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="py-1">
                  <button onClick={() => handleFilterChange("all")} className="w-full text-left px-4 py-3 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer">All Applications</button>
                  <button onClick={() => handleFilterChange("recent")} className="w-full text-left px-4 py-3 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer">Most Recent</button>
                  <button onClick={() => handleFilterChange("oldest")} className="w-full text-left px-4 py-3 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer">Oldest First</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex-1 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
            <thead className="bg-gray-50/50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Business Info</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Applied Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-50 dark:divide-gray-700">
              {pendingVendors.length > 0 ? (
                pendingVendors.map((vendor) => (
                  <tr key={vendor._id} className="hover:bg-rose-50/20 dark:hover:bg-gray-700/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white font-bold shadow-sm transition-transform group-hover:scale-105">
                            {vendor.businessDetails?.businessName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">{vendor.businessDetails?.businessName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{vendor.businessContact?.businessEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-lg">
                            {vendor.businessDetails?.businessType}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {new Date(vendor.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 uppercase tracking-wider">
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Link to={`/dashboard/admin/vendor-details/${vendor._id}`}>
                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 rounded-lg transition-colors font-bold text-xs uppercase tracking-wide cursor-pointer">
                            <Eye size={14} />
                            View Details
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-full">
                                <XCircle size={32} className="text-gray-300" />
                            </div>
                            <p className="text-lg font-semibold">No pending vendors found</p>
                            <p className="text-sm text-gray-400">All caught up! New applications will appear here.</p>
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
    </div>
  );
};

export default PendingVendors;
