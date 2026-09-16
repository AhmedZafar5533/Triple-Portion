import React, { useEffect, useState } from 'react';
import { 
    Search, 
    Trash2, 
    Eye, 
    FileX,
    Calendar,
    MessageSquare,
    Loader2,
    RefreshCw
} from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { Link } from 'react-router-dom';
import { SkeletonTable } from '../Skeleton';
import Pagination from '../dashboard/Pagination';

const RejectedVendors = () => {
    const { rejectedVendors, loading, getRejectedVendors, deleteVendor, pagination } = useAdminStore();
    const { totalPages, totalItems } = pagination.rejected;
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [togglingId, setTogglingId] = useState(null);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            getRejectedVendors(currentPage, 8, searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [getRejectedVendors, currentPage, searchTerm]);

    const handleDelete = async (id) => {
        setTogglingId(id);
        await deleteVendor(id);
        setTogglingId(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading && rejectedVendors.length === 0) {
        return <SkeletonTable rows={5} cols={5} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileX className="text-red-600" /> Rejected Applications
                    </h1>
                    <p className="text-gray-500 font-medium">Manage and review declined vendor registrations ({totalItems})</p>
                </div>
                <button 
                    onClick={() => getRejectedVendors(currentPage, 8, searchTerm)}
                    className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm cursor-pointer"
                >
                    <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by business name or email..."
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-transparent focus:border-rose-500 rounded-xl outline-none transition dark:text-white"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Business</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Owner</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Rejection Date</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Reason</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {rejectedVendors.length > 0 ? (
                                rejectedVendors.map((vendor) => (
                                    <tr key={vendor._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 font-bold">
                                                    {vendor.businessDetails?.businessName?.charAt(0) || 'V'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white">
                                                        {vendor.businessDetails?.businessName}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{vendor.businessDetails?.businessType}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-700 dark:text-gray-300">@{vendor.userId?.username}</p>
                                            <p className="text-xs text-gray-500">{vendor.userId?.email}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm font-bold">
                                                <Calendar size={14} />
                                                {formatDate(vendor.rejectionDate || vendor.updatedAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-2 max-w-xs">
                                                <MessageSquare size={14} className="text-gray-400 mt-1 flex-shrink-0" />
                                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                    {vendor.adminMessage || "No reason provided"}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link 
                                                    to={`/dashboard/admin/vendor-details/${vendor._id}`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer"
                                                    title="View & Action"
                                                >
                                                    <Eye size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(vendor._id)}
                                                    disabled={togglingId === vendor._id}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                                    title="Delete Permanently"
                                                >
                                                    {togglingId === vendor._id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                                                <FileX className="text-gray-400" size={32} />
                                            </div>
                                            <p className="text-gray-500 font-bold">No rejected applications found</p>
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

export default RejectedVendors;
