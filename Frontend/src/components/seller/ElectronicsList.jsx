import React, { useEffect, useState } from 'react';
import { useProductStore } from '../../store/productStore';
import { 
    Package, 
    Edit, 
    Trash2, 
    Search,
    Plus,
    Loader2,
    AlertTriangle,
    Box,
    Layers,
    Power
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { IMG_BASE_URL } from '../../config';

const ElectronicsList = ({ onEdit, onAdd }) => {
    const { myProducts, fetchMyProducts, deleteProduct, toggleAvailability, loading } = useProductStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [statusModal, setStatusModal] = useState(null); // { product, action: 'enable' | 'disable' }
    const [reason, setReason] = useState('');

    useEffect(() => {
        fetchMyProducts();
    }, []);

    const handleToggle = async () => {
        if (statusModal.action === 'disable' && !reason.trim()) {
            return toast.error("Please provide a reason for disabling");
        }
        await toggleAvailability(statusModal.product._id, statusModal.action === 'disable' ? reason : null);
        setStatusModal(null);
        setReason('');
    };

    const filteredProducts = myProducts.filter(p => 
        (p.category === 'Electronics' || p.category === 'Home Appliances' || p.category === 'General') &&
        (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading && myProducts.length === 0) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="text-blue-600 animate-spin" size={40} />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Updating Catalog...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl shadow-blue-500/5 transition-all">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
                        <Box size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Electronics Inventory</h1>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">{filteredProducts.length} Total Listings</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Filter inventory..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-64 pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl outline-none focus:ring-4 ring-blue-500/10 text-sm font-medium transition-all dark:text-white"
                        />
                    </div>
                    <button 
                        onClick={onAdd}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus size={16} /> Add Product
                    </button>
                </div>
            </div>

            {/* Inventory Container */}
            <div className="bg-white dark:bg-gray-800 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-50 dark:border-gray-700/50">
                                <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Product Info</th>
                                <th className="px-6 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Category</th>
                                <th className="px-6 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Inventory</th>
                                <th className="px-6 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Pricing</th>
                                <th className="px-6 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700/30">
                            <AnimatePresence>
                                {filteredProducts.map((product) => (
                                    <motion.tr 
                                        key={product._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors group"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="h-14 w-14 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-gray-50 flex-shrink-0">
                                                    <img 
                                                        src={product.images && product.images[0] ? `${IMG_BASE_URL}${product.images[0]}` : 'https://placehold.co/100x100?text=No+Image'} 
                                                        className={`h-full w-full object-cover ${product.availabilityStatus === 'Unavailable' ? 'grayscale opacity-50' : ''}`}
                                                        alt={product.name}
                                                        onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=No+Image'; }}
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{product.name}</h3>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[9px] text-blue-600 font-bold uppercase tracking-wider">{product.brand || 'No Brand'}</span>
                                                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">• ID: {product._id.slice(-8).toUpperCase()}</span>
                                                    </div>
                                                    {product.modelNumber && (
                                                        <p className="text-[8px] text-gray-400 font-medium italic mt-0.5">Model: {product.modelNumber}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-900 text-[10px] font-bold text-gray-600 dark:text-gray-400 rounded-lg uppercase tracking-wider">
                                                <Layers size={10} /> {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <span className={`text-xs font-bold ${product.stock <= 5 ? 'text-amber-500' : 'text-gray-900 dark:text-white'}`}>
                                                    {product.stock} Units
                                                </span>
                                                {product.stock <= 5 && <span className="text-[9px] font-bold text-amber-600 uppercase tracking-tighter">Low Stock</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                {product.discountedPrice ? (
                                                    <>
                                                        <span className="text-sm font-bold text-emerald-600">
                                                            UGX {product.discountedPrice.toLocaleString()}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-gray-400 line-through">
                                                            UGX {product.price.toLocaleString()}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-sm font-bold text-blue-600">
                                                        UGX {product.price.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                <span className={`inline-flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                                                    product.availabilityStatus === 'Available' 
                                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' 
                                                    : 'bg-gray-100 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400'
                                                }`}>
                                                    <div className={`h-1.5 w-1.5 rounded-full ${product.availabilityStatus === 'Available' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                                                    {product.availabilityStatus}
                                                </span>
                                                {product.availabilityStatus === 'Unavailable' && product.disableReason && (
                                                    <p className="text-[8px] font-bold text-gray-400 max-w-[120px] italic">Reason: {product.disableReason}</p>
                                                )}
                                                {product.adminDisabled && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 rounded text-[8px] font-bold uppercase mt-1">
                                                        <AlertTriangle size={8} /> Admin Disabled
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 text-gray-400">
                                                <button 
                                                    onClick={() => setStatusModal({ 
                                                        product, 
                                                        action: product.availabilityStatus === 'Available' ? 'disable' : 'enable' 
                                                    })}
                                                    className={`p-2.5 rounded-xl transition-all ${
                                                        product.availabilityStatus === 'Available' 
                                                        ? 'hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20' 
                                                        : 'hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                                                    }`}
                                                    title={product.availabilityStatus === 'Available' ? 'Disable Listing' : 'Enable Listing'}
                                                >
                                                    <Power size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => onEdit(product)}
                                                    className="p-2.5 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                                                    title="Edit Product"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => setDeleteConfirm(product)}
                                                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                                    title="Delete Product"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden divide-y divide-gray-50 dark:divide-gray-700/30">
                    {filteredProducts.map((product) => (
                        <div key={product._id} className="p-6 space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="h-20 w-20 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-gray-50 flex-shrink-0">
                                    <img 
                                        src={product.images && product.images[0] ? `${IMG_BASE_URL}${product.images[0]}` : 'https://placehold.co/200x200?text=No+Image'} 
                                        className={`h-full w-full object-cover ${product.availabilityStatus === 'Unavailable' ? 'grayscale opacity-50' : ''}`}
                                        alt={product.name}
                                        onError={(e) => { e.target.src = 'https://placehold.co/200x200?text=No+Image'; }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">{product.name}</h3>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-[8px] font-bold text-gray-500 rounded uppercase">
                                            {product.category}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-0.5 mt-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] text-blue-600 font-bold uppercase tracking-wider">{product.brand || 'No Brand'}</span>
                                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">• ID: {product._id.slice(-8).toUpperCase()}</span>
                                        </div>
                                        {product.modelNumber && (
                                            <p className="text-[8px] text-gray-400 font-medium italic">Model: {product.modelNumber}</p>
                                        )}
                                    </div>
                                    
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest ${
                                            product.availabilityStatus === 'Available' 
                                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' 
                                            : 'bg-gray-100 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400'
                                        }`}>
                                            {product.availabilityStatus}
                                        </span>
                                        {product.adminDisabled && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 rounded text-[8px] font-bold uppercase">
                                                <AlertTriangle size={8} /> Admin Disabled
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50 dark:border-gray-700/50">
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-1">Pricing</p>
                                    <div className="flex flex-col">
                                        {product.discountedPrice ? (
                                            <>
                                                <span className="text-sm font-bold text-emerald-600">UGX {product.discountedPrice.toLocaleString()}</span>
                                                <span className="text-[10px] font-bold text-gray-400 line-through">UGX {product.price.toLocaleString()}</span>
                                            </>
                                        ) : (
                                            <p className="text-sm font-bold text-blue-600">UGX {product.price.toLocaleString()}</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-1">Stock</p>
                                    <p className={`text-sm font-bold ${product.stock <= 5 ? 'text-amber-500' : 'text-gray-900 dark:text-white'}`}>
                                        {product.stock} Units
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <button 
                                    onClick={() => onEdit(product)}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
                                >
                                    <Edit size={14} /> Edit
                                </button>
                                <button 
                                    onClick={() => setStatusModal({ 
                                        product, 
                                        action: product.availabilityStatus === 'Available' ? 'disable' : 'enable' 
                                    })}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
                                        product.availabilityStatus === 'Available' 
                                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' 
                                        : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                                    }`}
                                >
                                    <Power size={14} /> {product.availabilityStatus === 'Available' ? 'Disable' : 'Enable'}
                                </button>
                                <button 
                                    onClick={() => setDeleteConfirm(product)}
                                    className="p-3 bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 rounded-xl transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {!loading && filteredProducts.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
                        <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-[2.5rem]"><Package size={48} className="text-gray-200" /></div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">Inventory Empty</h3>
                            <p className="text-sm text-gray-500 max-w-xs">No products match your current search or filters.</p>
                        </div>
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
                                <div className={`mx-auto w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-inner ${statusModal.action === 'disable' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-500' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500'}`}>
                                    <Power size={32} />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                                        {statusModal.action === 'disable' ? 'Disable Listing?' : 'Re-enable Listing?'}
                                    </h2>
                                    <p className="text-sm text-gray-500 font-medium italic px-4">
                                        {statusModal.action === 'disable' 
                                            ? "Temporarily take this product off the market." 
                                            : "Put this product back on the market for customers."}
                                    </p>
                                </div>
                            </div>

                            {statusModal.action === 'disable' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Reason for disabling</label>
                                    <textarea 
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none text-xs font-bold min-h-[100px] resize-none focus:ring-4 ring-amber-500/10 text-gray-900 dark:text-white"
                                        placeholder="e.g., Out of stock, Maintenance, Temporary break..."
                                    />
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button onClick={() => setStatusModal(null)} className="flex-1 py-4 bg-gray-50 dark:bg-gray-900 text-gray-500 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all">Cancel</button>
                                <button 
                                    onClick={handleToggle}
                                    className={`flex-1 py-4 text-white font-bold text-xs uppercase tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all ${statusModal.action === 'disable' ? 'bg-amber-500 shadow-amber-500/20' : 'bg-emerald-500 shadow-emerald-500/20'}`}
                                >
                                    Confirm {statusModal.action === 'disable' ? 'Disable' : 'Enable'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Modal */}
            <AnimatePresence>
                {deleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirm(null)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-[3rem] p-10 shadow-2xl space-y-6">
                            <div className="text-center space-y-4">
                                <div className="mx-auto w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-[2rem] flex items-center justify-center shadow-inner"><Trash2 size={32} /></div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Delete Listing?</h3>
                                    <p className="text-sm text-gray-500 font-medium">Are you sure you want to remove <span className="font-bold text-gray-900 dark:text-white">"{deleteConfirm.name}"</span>? This will also purge all associated product images.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 bg-gray-50 dark:bg-gray-900 text-gray-500 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all">Keep it</button>
                                <button onClick={async () => { const s = await deleteProduct(deleteConfirm._id); if(s) setDeleteConfirm(null); }} className="flex-1 py-4 bg-red-600 text-white font-bold text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-red-500/20 active:scale-95 transition-all">Delete Forever</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ElectronicsList;
