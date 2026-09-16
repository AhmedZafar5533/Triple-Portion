import React, { useEffect, useState } from 'react';
import { useProductStore } from '../../store/productStore';
import { 
    Search, Loader2, Package, Eye, EyeOff, 
    Tag, Calendar, Filter, Users, 
    Ban, CheckCircle, ExternalLink, Power
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SkeletonBase } from '../Skeleton';
import { IMG_BASE_URL } from '../../config';

const ProductManagement = () => {
    const { adminProducts, fetchAdminProducts, adminToggleProductStatus, loading } = useProductStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [statusModal, setStatusModal] = useState(null); // { id, action }
    const [reason, setReason] = useState('');
    const [togglingId, setTogglingId] = useState(null);

    useEffect(() => {
        fetchAdminProducts();
    }, []);

    const filteredProducts = adminProducts.filter(p => {
        const businessName = p.vendorId?.businessDetails?.businessName || '';
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             businessName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
        const matchesStatus = statusFilter === 'All' || 
                             (statusFilter === 'Disabled' ? p.adminDisabled : !p.adminDisabled);
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const categories = ['All', ...new Set(adminProducts.map(p => p.category))];

    const handleToggle = async () => {
        if (statusModal.action === 'disable' && !reason.trim()) {
            return;
        }
        setTogglingId(statusModal.id);
        await adminToggleProductStatus(statusModal.id, statusModal.action === 'disable' ? reason : null);
        setTogglingId(null);
        setStatusModal(null);
        setReason('');
    };

    return (
        <div className="h-full flex flex-col space-y-8 pb-20 p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-gray-800 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-xl shadow-blue-500/5 transition-all">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Product Inventory</h1>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Platform-Wide Oversight ({adminProducts.length} items)</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search products or vendors..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-64 pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl outline-none focus:ring-4 ring-blue-500/10 text-xs font-bold transition-all"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 px-4 py-2 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <Filter size={14} className="text-gray-400" />
                        <select 
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="bg-transparent text-xs font-bold uppercase outline-none cursor-pointer"
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 px-4 py-2 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-transparent text-xs font-bold uppercase outline-none cursor-pointer"
                        >
                            <option value="All">All Status</option>
                            <option value="Active">Active Only</option>
                            <option value="Disabled">Disabled Only</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white dark:bg-gray-800 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex-1">
                <div className="overflow-x-auto h-full">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
                            <tr className="border-b border-gray-50 dark:border-gray-700/50">
                                <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Product & Category</th>
                                <th className="px-6 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Vendor Info</th>
                                <th className="px-6 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Inventory / Price</th>
                                <th className="px-6 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Listed Date</th>
                                <th className="px-6 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700/30">
                            <AnimatePresence>
                                {loading && adminProducts.length === 0 ? (
                                    [1, 2, 3, 4, 5, 6].map((i) => (
                                        <tr key={i} className="border-b border-gray-50 dark:border-gray-700/30">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <SkeletonBase className="h-14 w-14 rounded-2xl flex-shrink-0" />
                                                    <div className="space-y-2 flex-1">
                                                        <SkeletonBase className="h-4 w-3/4" />
                                                        <SkeletonBase className="h-3 w-1/2" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="space-y-2">
                                                    <SkeletonBase className="h-4 w-3/4" />
                                                    <SkeletonBase className="h-3 w-1/2" />
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="space-y-2">
                                                    <SkeletonBase className="h-4 w-1/2" />
                                                    <SkeletonBase className="h-3 w-1/3" />
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <SkeletonBase className="h-4 w-24" />
                                            </td>
                                            <td className="px-6 py-5">
                                                <SkeletonBase className="h-8 w-20 rounded-xl" />
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end">
                                                    <SkeletonBase className="h-10 w-24 rounded-xl" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : filteredProducts.map((item) => (
                                    <motion.tr 
                                        key={item._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className={`hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors group ${item.adminDisabled ? 'opacity-70 grayscale-[0.5]' : ''}`}
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="h-14 w-14 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-gray-50 flex-shrink-0">
                                                    <img 
                                                        src={item.images && item.images[0] ? `${IMG_BASE_URL}${item.images[0]}` : null} 
                                                        className="h-full w-full object-cover"
                                                        alt=""
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{item.name}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <Tag size={10} className="text-blue-500" />
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.category}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{item.vendorId?.businessDetails?.businessName || 'Unknown Vendor'}</span>
                                                <span className="text-[10px] text-gray-500 font-medium">{item.vendorId?.businessContact?.businessEmail || 'No contact info'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-bold text-gray-900 dark:text-white">UGX {item.price.toLocaleString()}</span>
                                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">Stock: {item.stock || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Calendar size={14} />
                                                <span className="text-[10px] font-bold">{new Date(item.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
                                                item.adminDisabled 
                                                ? 'bg-red-50 dark:bg-red-900/20 text-red-600' 
                                                : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                                            }`}>
                                                {item.adminDisabled ? <EyeOff size={10} /> : <Eye size={10} />}
                                                {item.adminDisabled ? 'Disabled' : 'Visible'}
                                            </span>
                                            {item.adminDisabled && item.adminMessage && (
                                                <p className="text-[9px] font-bold text-red-400 mt-1 max-w-[150px] italic">Note: {item.adminMessage}</p>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => setStatusModal({ 
                                                        id: item._id, 
                                                        action: item.adminDisabled ? 'enable' : 'disable' 
                                                    })}
                                                    disabled={togglingId === item._id}
                                                    className={`p-2.5 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 ${
                                                        item.adminDisabled 
                                                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20' 
                                                        : 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20'
                                                    }`}
                                                >
                                                    {togglingId === item._id ? (
                                                        <Loader2 className="size-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            {item.adminDisabled ? <Eye size={14} /> : <EyeOff size={14} />}
                                                            {item.adminDisabled ? 'Enable' : 'Disable'}
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {!loading && filteredProducts.length === 0 && (
                    <div className="p-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-gray-300">
                            <Package size={40} />
                        </div>
                        <h3 className="text-xl font-bold dark:text-white mb-2">No results found</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Try adjusting your filters or search query.</p>
                    </div>
                )}
            </div>

            {/* Status Modal */}
            <AnimatePresence>
                {statusModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setStatusModal(null)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-[3rem] p-10 shadow-2xl space-y-6 overflow-hidden">
                            <div className="text-center space-y-4">
                                <div className={`mx-auto w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-inner ${statusModal.action === 'disable' ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500'}`}>
                                    <Power size={32} />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                                        {statusModal.action === 'disable' ? 'Disable Product?' : 'Enable Product?'}
                                    </h2>
                                    <p className="text-sm text-gray-500 font-medium italic px-4">
                                        {statusModal.action === 'disable' 
                                            ? "Administrative override to hide this product." 
                                            : "Restoring product visibility for all customers."}
                                    </p>
                                </div>
                            </div>

                            {statusModal.action === 'disable' && (
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Administrative Reason</label>
                                    <textarea 
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none text-xs font-bold min-h-[100px] resize-none focus:ring-4 ring-red-500/10 text-gray-900 dark:text-white"
                                        placeholder="Enter the violation or reason for disabling..."
                                    />
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button onClick={() => setStatusModal(null)} className="flex-1 py-4 bg-gray-50 dark:bg-gray-900 text-gray-500 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all">Cancel</button>
                                <button 
                                    onClick={handleToggle}
                                    className={`flex-1 py-4 text-white font-bold text-xs uppercase tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all ${statusModal.action === 'disable' ? 'bg-red-600 shadow-red-500/20' : 'bg-emerald-500 shadow-emerald-500/20'}`}
                                >
                                    Confirm {statusModal.action === 'disable' ? 'Disable' : 'Enable'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductManagement;
