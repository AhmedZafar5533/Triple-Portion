import React, { useEffect, useState } from 'react';
import { useProductStore } from '../../store/productStore';
import {
    Home,
    Edit,
    Trash2,
    Search,
    Plus,
    Loader2,
    MapPin,
    Users,
    Power,
    AlertTriangle

} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { IMG_BASE_URL } from '../../config';

const AccommodationList = ({ onEdit, onAdd }) => {
    const { myProducts, fetchMyProducts, deleteProduct, toggleAvailability, loading } = useProductStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [statusModal, setStatusModal] = useState(null);
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
        p.category === 'Accommodation' &&
        (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.propertyType?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading && myProducts.length === 0) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="text-blue-600 animate-spin" size={40} />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Loading Properties...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl shadow-blue-500/5 transition-all">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
                        <Home size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Properties & Rooms</h1>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">{filteredProducts.length} Total Properties</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Filter properties..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-64 pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl outline-none focus:ring-4 ring-blue-500/10 text-sm font-medium transition-all"
                        />
                    </div>
                    <button
                        onClick={onAdd}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus size={16} /> Add Property
                    </button>
                </div>
            </div>

            {/* Tabular Inventory */}
            <div className="bg-white dark:bg-gray-800 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-50 dark:border-gray-700/50">
                                <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Property Info</th>
                                <th className="px-6 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Type</th>
                                <th className="px-6 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Availability</th>
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
                                                        src={product.images && product.images[0] ? `${IMG_BASE_URL}${product.images[0]}` : null}
                                                        className={`h-full w-full object-cover ${product.availabilityStatus === 'Unavailable' ? 'grayscale opacity-50' : ''}`}
                                                        alt=""
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{product.name}</h3>
                                                    <p className="text-[10px] text-gray-400 font-bold truncate mt-0.5 flex items-center gap-1"><MapPin size={10} /> {product.address}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-900 text-[10px] font-bold text-gray-600 dark:text-gray-400 rounded-lg uppercase tracking-wider">
                                                <Home size={10} /> {product.propertyType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <span className={`text-xs font-bold ${product.stock <= 2 ? 'text-amber-500' : 'text-gray-900 dark:text-white'}`}>
                                                    {product.stock} Rooms
                                                </span>
                                                <span className="text-[9px] font-bold text-gray-400 flex items-center gap-1">
                                                    <Users size={10} /> Max {product.maxOccupancy}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-bold text-blue-600">
                                                UGX {product.price.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                <span className={`inline-flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${product.availabilityStatus === 'Available'
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
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 rounded text-[8px] font-bold uppercase">
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
                                                    className={`p-2.5 rounded-xl transition-all ${product.availabilityStatus === 'Available'
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
                                                    title="Edit Property"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(product)}
                                                    className="p-2.5 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                                    title="Delete Property"
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

                {/* Empty State */}
                {!loading && filteredProducts.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
                        <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-[2.5rem]"><Home size={48} className="text-gray-200" /></div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">No Properties Yet</h3>
                            <p className="text-sm text-gray-500 max-w-xs">Start by adding your first accommodation listing.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Status Modal */}
            <AnimatePresence>
                {statusModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setStatusModal(null)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-[3rem] p-10 shadow-2xl space-y-6 overflow-hidden text-left">
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
                                            ? "Temporarily take this property off the market."
                                            : "Put this property back on the market for customers."}
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
                                        placeholder="e.g., Fully booked elsewhere, Maintenance, Vacation..."
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
                                <button onClick={async () => { const s = await deleteProduct(deleteConfirm._id); if (s) setDeleteConfirm(null); }} className="flex-1 py-4 bg-red-600 text-white font-bold text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-red-500/20 active:scale-95 transition-all">Delete Forever</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AccommodationList;
