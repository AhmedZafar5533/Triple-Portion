import { useEffect, useState } from 'react';
import {
    Search,
    Filter,
    ArrowUp,
    ArrowDown,
    AlertTriangle,
    Eye,
    Ban,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { useAdminStore } from '../../store/adminStore';
import { Link } from 'react-router-dom';
import { SkeletonTable } from '../Skeleton';
import Pagination from '../dashboard/Pagination';

const RegisteredVendors = () => {
    const { approvedVendors, loading, getApprovedVendors, setVendorApproval, pagination } = useAdminStore();
    const { totalPages, totalItems } = pagination.vendors;
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [selectedType, setSelectedType] = useState('all');
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [togglingId, setTogglingId] = useState(null);
    
    // Modal state
    const [showDisableModal, setShowDisableModal] = useState(false);
    const [vendorToDisable, setVendorToDisable] = useState(null);
    const [disableReason, setDisableReason] = useState('');
    const [customReason, setCustomReason] = useState('');

    const reasons = [
        "Policy Violation",
        "Fraudulent Activity",
        "Quality Issues",
        "Inactivity",
        "Other"
    ];

    const businessTypes = ['all', 'Electronics', 'Home Appliances', 'Accommodation', 'Tour', 'Grocery', 'Building Material / Plumbing'];
    
    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            getApprovedVendors(currentPage, 8, searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [getApprovedVendors, currentPage, searchTerm]);

    const handleOpenDisableModal = (vendor) => {
        setVendorToDisable(vendor);
        setShowDisableModal(true);
        setDisableReason(reasons[0]);
    };

    const handleConfirmDisable = async () => {
        if (!vendorToDisable) return;
        
        const finalReason = disableReason === 'Other' ? customReason : disableReason;
        setTogglingId(vendorToDisable._id);
        
        await setVendorApproval({ 
            status: 'Disabled', 
            vendorId: vendorToDisable._id, 
            reason: finalReason 
        });
        
        setTogglingId(null);
        setShowDisableModal(false);
        setVendorToDisable(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'UGX',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    if (loading && approvedVendors.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-4 w-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                    </div>
                </div>
                <SkeletonTable rows={8} cols={5} />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col mb-20 p-2">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Approved Vendors</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium tracking-wide uppercase text-xs">
                        Registered business partners ({totalItems})
                    </p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
                <div className="relative group flex-1 max-w-md">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search vendors..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <button
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium shadow-sm cursor-pointer"
                        >
                            <Filter size={16} className="text-rose-500" />
                            <span>{selectedType === 'all' ? 'All Business Types' : selectedType}</span>
                        </button>
                        {showFilterMenu && (
                            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in duration-200">
                                <div className="py-1 max-h-60 overflow-y-auto">
                                    {businessTypes.map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => { setSelectedType(type); setShowFilterMenu(false); }}
                                            className={`w-full text-left px-4 py-3 text-sm transition-colors cursor-pointer font-medium ${
                                                selectedType === type 
                                                ? "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400" 
                                                : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                                            }`}
                                        >
                                            {type === 'all' ? 'All Types' : type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex-1 overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                        <thead className="bg-gray-50/50 dark:bg-gray-700/50">
                            <tr>
                                <th 
                                    className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-rose-500 transition-colors"
                                    onClick={() => requestSort('businessName')}
                                >
                                    <div className="flex items-center gap-1">
                                        Vendor {sortConfig.key === 'businessName' && (sortConfig.direction === 'asc' ? <ArrowUp size={12}/> : <ArrowDown size={12}/>)}
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Type</th>
                                <th 
                                    className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-rose-500 transition-colors"
                                    onClick={() => requestSort('createdAt')}
                                >
                                    <div className="flex items-center gap-1">
                                        Join Date {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? <ArrowUp size={12}/> : <ArrowDown size={12}/>)}
                                    </div>
                                </th>
                                <th 
                                    className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-rose-500 transition-colors"
                                    onClick={() => requestSort('totalEarnings')}
                                >
                                    <div className="flex items-center gap-1">
                                        Revenue {sortConfig.key === 'totalEarnings' && (sortConfig.direction === 'asc' ? <ArrowUp size={12}/> : <ArrowDown size={12}/>)}
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Balance Due</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-50 dark:divide-gray-700">
                            {approvedVendors.length > 0 ? (
                                approvedVendors.map((vendor) => (
                                    <tr key={vendor._id} className="hover:bg-rose-50/20 dark:hover:bg-gray-700/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-11 w-11 flex-shrink-0 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white font-bold shadow-sm transition-transform group-hover:scale-105">
                                                    {vendor.businessDetails?.businessName?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900 dark:text-white">{vendor.businessDetails?.businessName}</div>
                                                    <div className="text-xs text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest">{vendor.businessContact?.businessEmail}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1 items-start">
                                                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                                                    {vendor.businessDetails?.businessType}
                                                </span>
                                                {vendor.businessDetails?.businessIndustry && (
                                                    <span className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider pl-1">
                                                        {vendor.businessDetails.businessIndustry}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-medium">
                                            {formatDate(vendor.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                            {formatCurrency(vendor.totalEarnings)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-sm font-bold ${(vendor.balanceDue || 0) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'}`}>
                                                {formatCurrency(vendor.balanceDue)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link 
                                                    to={`/dashboard/admin/vendor-details/${vendor._id}?mode=view`} 
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 rounded-lg transition-colors font-bold text-xs uppercase tracking-wide cursor-pointer"
                                                >
                                                    <Eye size={14} />
                                                    View Profile
                                                </Link>
                                                <button 
                                                    onClick={() => handleOpenDisableModal(vendor)}
                                                    disabled={togglingId === vendor._id}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 rounded-lg transition-colors font-bold text-xs uppercase tracking-wide cursor-pointer disabled:opacity-50 min-w-[90px] justify-center"
                                                >
                                                    {togglingId === vendor._id ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
                                                    Disable
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-full">
                                                <AlertTriangle size={40} className="text-gray-300" />
                                            </div>
                                            <p className="text-xl font-bold">No approved vendors found</p>
                                            <p className="text-sm text-gray-400">Try adjusting your search or filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden divide-y divide-gray-50 dark:divide-gray-700/50">
                    {approvedVendors.length > 0 ? (
                        approvedVendors.map((vendor) => (
                            <div key={vendor._id} className="p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white font-bold shadow-sm">
                                            {vendor.businessDetails?.businessName?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[150px]">{vendor.businessDetails?.businessName}</div>
                                            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{vendor.businessDetails?.businessType}</div>
                                            {vendor.businessDetails?.businessIndustry && (
                                                <div className="text-[8px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">{vendor.businessDetails.businessIndustry}</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Revenue</p>
                                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(vendor.totalEarnings)}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-50 dark:border-gray-700/50">
                                    <div>
                                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mb-1">Join Date</p>
                                        <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300">{formatDate(vendor.createdAt)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mb-1">Balance Due</p>
                                        <p className={`text-[11px] font-bold ${(vendor.balanceDue || 0) > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                                            {formatCurrency(vendor.balanceDue)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Link 
                                        to={`/dashboard/admin/vendor-details/${vendor._id}?mode=view`} 
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
                                    >
                                        <Eye size={14} /> Profile
                                    </Link>
                                    <button 
                                        onClick={() => handleOpenDisableModal(vendor)}
                                        disabled={togglingId === vendor._id}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
                                    >
                                        {togglingId === vendor._id ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
                                        Disable
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-10 text-center text-gray-500">No approved vendors found</div>
                    )}
                </div>
            </div>

            <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
            />

            {/* Disable Vendor Modal */}
            <AnimatePresence>
                {showDisableModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowDisableModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md z-10 overflow-hidden border border-gray-100 dark:border-gray-700"
                        >
                            <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center bg-red-50/50 dark:bg-red-900/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
                                        <FaExclamationTriangle size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Disable Vendor</h2>
                                </div>
                                <button onClick={() => setShowDisableModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="p-8">
                                <div className="mb-6">
                                    <p className="text-gray-600 dark:text-slate-300 font-medium mb-1">
                                        You are disabling:
                                    </p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                                        {vendorToDisable?.businessDetails?.businessName}
                                    </p>
                                    <p className="text-sm text-gray-400 dark:text-slate-500 font-bold italic">
                                        This will prevent them from selling on the platform.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                                            Reason for Disabling
                                        </label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {reasons.map((reason) => (
                                                <button
                                                    key={reason}
                                                    onClick={() => setDisableReason(reason)}
                                                    className={`px-4 py-3 rounded-xl text-sm font-bold transition-all text-left border-2 ${
                                                        disableReason === reason
                                                        ? "bg-red-50 border-red-500 text-red-700 dark:bg-red-900/20 dark:border-red-600 dark:text-red-400"
                                                        : "border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-red-200 dark:hover:border-red-900/40"
                                                    }`}
                                                >
                                                    {reason}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {disableReason === 'Other' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="overflow-hidden"
                                        >
                                            <textarea
                                                placeholder="Enter custom reason..."
                                                value={customReason}
                                                onChange={(e) => setCustomReason(e.target.value)}
                                                className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all text-sm min-h-[100px]"
                                            />
                                        </motion.div>
                                    )}
                                </div>

                                <div className="mt-8 flex gap-3">
                                    <button
                                        onClick={() => setShowDisableModal(false)}
                                        className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmDisable}
                                        disabled={togglingId !== null || (disableReason === 'Other' && !customReason)}
                                        className="flex-2 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-200 dark:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                        {togglingId !== null ? <Loader2 size={18} className="animate-spin" /> : <Ban size={18} />}
                                        Confirm Disable
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

export default RegisteredVendors;
