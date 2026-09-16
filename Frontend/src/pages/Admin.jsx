import { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import {
  Menu, Clock, ShoppingCart, CreditCard,
  Star, MessageSquare, Users, Home, Briefcase, FileX, Package, DollarSign
} from "lucide-react";

import {
  revenueData, categoryData, recentActivities, monthlyStats, approvedVendors, COLORS,
} from "../store/mockData";
import { useAuthStore } from "../store/authStore";
import { toast } from "sonner";
import ThemeToggle from "../components/ThemeToggle";
import { DashboardSkeleton } from "../components/Skeleton";
import Sidebar from "../components/dashboard/Sidebar";
import MobileDashboardNav from "../components/dashboard/MobileDashboardNav";
import DashboardHeader from "../components/dashboard/DashboardHeader";

// Lazy imports
const Dashboard = lazy(() => import("../components/admin/DashboardOverview"));
const RegisteredVendors = lazy(() => import("../components/admin/RegisteredVendors"));
const PendingVendors = lazy(() => import("../components/admin/PendingVendors"));
const Orders = lazy(() => import("../components/admin/Orders"));
const Payments = lazy(() => import("../components/admin/Payments"));
const Reviews = lazy(() => import("../components/admin/Reviews"));
const Messages = lazy(() => import("../components/admin/Messages"));
const ServiceManagement = lazy(() => import("../components/admin/ServiceManagement"));
const RejectedVendors = lazy(() => import("../components/admin/RejectedVendors"));
const VendorDetails = lazy(() => import("./admin/VendorDetails"));
const ProductManagement = lazy(() => import("../components/admin/ProductManagement"));
import Payouts from "../components/admin/Payouts";
import ProcessPayout from "../components/admin/ProcessPayout";

function AdminDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { redirectToOtp, loading, user } = useAuthStore();
  const location = useLocation();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes("/dashboard/admin/listed-vendors")) return "vendors";
    if (path.includes("/dashboard/admin/pending-vendors")) return "pending";
    if (path.includes("/dashboard/admin/rejected-vendors")) return "rejected";
    if (path.includes("/dashboard/admin/orders")) return "orders";
    if (path.includes("/dashboard/admin/payments")) return "payments";
    if (path.includes("/dashboard/admin/messages")) return "messages";
    if (path.includes("/dashboard/admin/reviews")) return "reviews";
    if (path.includes("/dashboard/admin/manage-services")) return "manage";
    if (path.includes("/dashboard/admin/products")) return "products";
    if (path.includes("/dashboard/admin/payout-management")) return "payouts";
    return "dashboard";
  };

  const activeTab = getActiveTab();

  useEffect(() => {
    document.title = "Admin Dashboard | Triple Portion";
    if (redirectToOtp) {
      toast.error("Please verify your account");
    }
  }, [redirectToOtp]);

  if (loading || !user) return <DashboardSkeleton />;

  const navItems = [
    { id: "dashboard", icon: <Home size={20} />, label: "Dashboard", path: "/dashboard/admin" },
    {
      id: "vendor-management",
      icon: <Users size={20} />,
      label: "Vendor Management",
      isGroup: true,
      subItems: [
        { id: "vendors", icon: <Users size={16} />, label: "Approved Vendors", path: "/dashboard/admin/listed-vendors" },
        { id: "pending", icon: <Clock size={16} />, label: "Pending Vendors", path: "/dashboard/admin/pending-vendors" },
        { id: "rejected", icon: <FileX size={16} />, label: "Rejected Applications", path: "/dashboard/admin/rejected-vendors" },
      ]
    },
    { id: "manage", icon: <Briefcase size={20} />, label: "Manage Services", path: "/dashboard/admin/manage-services" },
    { id: "products", icon: <Package size={20} />, label: "Product Inventory", path: "/dashboard/admin/products" },
    { id: "orders", icon: <ShoppingCart size={20} />, label: "Orders", path: "/dashboard/admin/orders" },
    { id: "payments", icon: <CreditCard size={20} />, label: "Payments", path: "/dashboard/admin/payments" },
    { id: "payouts", icon: <DollarSign size={20} />, label: "Payout Management", path: "/dashboard/admin/payout-management" },
    { id: "reviews", icon: <Star size={20} />, label: "Reviews", path: "/dashboard/admin/reviews" },
    { id: "messages", icon: <MessageSquare size={20} />, label: "Messages", path: "/dashboard/admin/messages" },
  ];

  return (
    <div className="h-screen h-[100dvh] flex flex-col bg-gray-50 dark:bg-gray-900">
      {isMobileOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setIsMobileOpen(false)} />}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          navItems={navItems}
          activeTab={activeTab}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
          <DashboardHeader 
            user={user} 
            setIsMobileOpen={setIsMobileOpen} 
            portalName="Admin Portal" 
          />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6 pb-24 lg:pb-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Suspense fallback={<DashboardSkeleton />}>
              <Routes>
                <Route index element={<Dashboard monthlyStats={monthlyStats} revenueData={revenueData} recentActivities={recentActivities} approvedVendors={approvedVendors} categoryData={categoryData} COLORS={COLORS} />} />
                <Route path="listed-vendors" element={<RegisteredVendors />} />
                <Route path="pending-vendors" element={<PendingVendors />} />
                <Route path="rejected-vendors" element={<RejectedVendors />} />
                <Route path="orders" element={<Orders />} />
                <Route path="payments" element={<Payments />} />
                <Route path="payout-management" element={<Payouts />} />
                <Route path="payout-management/process/:vendorId" element={<ProcessPayout />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="messages" element={<Messages />} />
                <Route path="manage-services" element={<ServiceManagement />} />
                <Route path="products" element={<ProductManagement />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileDashboardNav 
        setIsMobileOpen={setIsMobileOpen} 
        isMobileOpen={isMobileOpen}
        userRole="admin" 
      />
    </div>
  );
}

export default AdminDashboard;
