import React, { useEffect } from 'react';
import {
    Users, DollarSign, ShoppingCart, TrendingUp,
    ArrowUp, ArrowDown, CheckCircle2, Package,
    Activity, Clock, User, Star, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../store/adminStore';
import { DashboardSkeleton } from '../Skeleton';

const AdminDashboard = () => {
    const { getDashboardStats, dashboardStats, recentOrders, loading } = useAdminStore();
    const navigate = useNavigate();

    useEffect(() => {
        getDashboardStats();
    }, [getDashboardStats]);

    if (loading && !dashboardStats) {
        return <DashboardSkeleton />;
    }

    const stats = dashboardStats || {
        totalSales: 0,
        totalOrders: 0,
        pendingOrders: 0,
        failedOrders: 0,
        totalVendors: 0,
        pendingVendors: 0,
        onboardingVendors: 0,
        totalCustomers: 0,
        totalSellers: 0,
        newUsersCount: 0
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-UG', {
            style: 'currency',
            currency: 'UGX',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard Overview</h1>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
                    Real-time Data
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Sales"
                    value={formatCurrency(stats.totalSales)}
                    icon={<DollarSign size={20} className="text-emerald-600" />}
                    bgColor="bg-emerald-50 dark:bg-emerald-900/20"
                    desc="Accumulated revenue"
                />
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon={<ShoppingCart size={20} className="text-blue-600" />}
                    bgColor="bg-blue-50 dark:bg-blue-900/20"
                    desc={`${stats.pendingOrders} pending · ${stats.failedOrders || 0} failed`}
                />
                <StatCard
                    title="Total Customers"
                    value={stats.totalCustomers}
                    icon={<Users size={20} className="text-rose-600" />}
                    bgColor="bg-rose-50 dark:bg-rose-900/20"
                    desc="Verified buyer accounts"
                />
                <StatCard
                    title="Active Vendors"
                    value={stats.totalVendors}
                    icon={<Package size={20} className="text-amber-600" />}
                    bgColor="bg-amber-50 dark:bg-amber-900/20"
                    desc={`${stats.pendingVendors} pending · ${stats.onboardingVendors || 0} in progress`}
                />
            </div>

            {/* Rest of the UI remains the same, but let's update Quick Links */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Breakdown */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Revenue by Category</h2>
                        <TrendingUp size={18} className="text-rose-500" />
                    </div>
                    <div className="space-y-5">
                        {stats.revenueByCategory?.map((cat, i) => {
                            const percentage = (cat.total / stats.totalSales) * 100 || 0;
                            return (
                                <div key={i} className="space-y-1.5">
                                    <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                        <span className="truncate max-w-[120px]">{cat._id}</span>
                                        <span className="text-slate-900 dark:text-white">{formatCurrency(cat.total)}</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden shadow-inner">
                                        <div
                                            className="h-full bg-rose-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {(!stats.revenueByCategory || stats.revenueByCategory.length === 0) && (
                            <p className="text-center py-10 text-slate-400 text-xs italic">No data available</p>
                        )}
                    </div>
                </div>

                {/* Top Vendors */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Top Vendors</h2>
                        <Star size={18} className="text-amber-500 fill-amber-500" />
                    </div>
                    <div className="space-y-4">
                        {stats.topVendors?.map((vendor, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-50 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-rose-500 shadow-sm border border-slate-100 dark:border-slate-700">
                                        {i + 1}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">Vendor ID: {vendor._id?.substr(-4).toUpperCase()}</p>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">{vendor.orderCount} Orders</p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-emerald-600">{formatCurrency(vendor.totalSales)}</span>
                            </div>
                        ))}
                        {(!stats.topVendors || stats.topVendors.length === 0) && (
                            <p className="text-center py-10 text-slate-400 text-xs italic">No sales recorded</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Recent Orders List */}
                <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h2>
                        <Activity size={18} className="text-blue-500" />
                    </div>
                    <div className="overflow-x-auto hidden lg:block">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Transaction</th>
                                    <th className="px-6 py-4">Buyer</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                                {recentOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                        <td className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400">
                                            #{order._id.substr(-6).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                    {order.buyerId?.username?.charAt(0) || <User size={12} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{order.buyerId?.username || "Guest"}</p>
                                                    <p className="text-[10px] text-slate-400 truncate">{order.buyerId?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-900 dark:text-white">
                                            {formatCurrency(order.grandTotal)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${order.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                                }`}>
                                                {order.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-[10px] font-bold text-slate-400">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {recentOrders.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-slate-400 text-sm italic">
                                            No recent activity found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View */}
                    <div className="lg:hidden divide-y divide-slate-50 dark:divide-slate-700">
                        {recentOrders.map((order) => (
                            <div key={order._id} className="p-4 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">
                                            {order.buyerId?.username?.charAt(0) || "G"}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{order.buyerId?.username || "Guest"}</p>
                                            <p className="text-[10px] text-slate-400">#{order._id.substr(-6).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">{formatCurrency(order.grandTotal)}</p>
                                        <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full ${order.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                            {order.paymentStatus}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                    <span className="bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded capitalize">{order.status || 'Pending'}</span>
                                </div>
                            </div>
                        ))}
                        {recentOrders.length === 0 && (
                            <div className="p-10 text-center text-slate-400 text-xs italic">No recent activity</div>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Navigation</h3>
                    <div className="space-y-3">
                        <QuickLink
                            icon={<Package size={14} />}
                            label="Product Catalog"
                            onClick={() => navigate('/dashboard/admin/products')}
                        />
                        <QuickLink
                            icon={<Users size={14} />}
                            label="Vendor Requests"
                            onClick={() => navigate('/dashboard/admin/pending-vendors')}
                        />
                        <QuickLink
                            icon={<Clock size={14} />}
                            label="Pending Orders"
                            onClick={() => navigate('/dashboard/admin/orders')}
                        />
                        <QuickLink
                            icon={<ShieldCheck size={14} />}
                            label="System Overview"
                            onClick={() => navigate('/dashboard/admin')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, bgColor, desc }) => (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-md group">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${bgColor} transition-transform group-hover:scale-110`}>
                {icon}
            </div>
            <Activity size={14} className="text-slate-200 dark:text-slate-600" />
        </div>
        <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{title}</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1 truncate">{value}</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-bold">{desc}</p>
        </div>
    </div>
);

const QuickLink = ({ icon, label, onClick }) => (
    <div
        onClick={onClick}
        className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
    >
        <div className="flex items-center gap-3">
            <div className="p-2 bg-white dark:bg-slate-800 rounded-xl text-slate-400 dark:text-slate-500 group-hover:text-rose-500 shadow-sm border border-slate-100 dark:border-slate-700">
                {icon}
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{label}</span>
        </div>
        <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-all group-hover:translate-x-0.5" />
    </div>
);

const ShieldCheck = ({ size, className }) => (
    <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

export default AdminDashboard;
