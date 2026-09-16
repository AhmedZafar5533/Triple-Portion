import { useState, useEffect, lazy, Suspense, useRef } from "react";
import { Routes, Route, useLocation, Link } from "react-router-dom";
import {
  Menu, ShoppingCart, Star, Home, User, Heart, Settings, Camera, Loader2
} from "lucide-react";

import { useAuthStore } from "../store/authStore";
import { useVendorStore } from "../store/vendorStore";
import ThemeToggle from "../components/ThemeToggle";
import { DashboardSkeleton } from "../components/Skeleton";
import Sidebar from "../components/dashboard/Sidebar";
import MobileDashboardNav from "../components/dashboard/MobileDashboardNav";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import { API_BASE_URL } from "../config";

const BACKEND_URL = API_BASE_URL;

// Quick Profile Upload Component
const ProfileUploadSection = ({ user }) => {
  const { checkAuth, uploadProfilePic, loading } = useAuthStore();
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed.");
      return;
    }
    const result = await uploadProfilePic(file);
    if (result) await checkAuth();
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("blob:") || path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `${BACKEND_URL}/${cleanPath}`;
  };

  const profilePicUrl = getImageUrl(user?.profilePic);

  return (
    <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-3 pr-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="relative group">
        <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 overflow-hidden border border-gray-200 dark:border-gray-600">
          {profilePicUrl ? (
            <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User size={24} />
          )}
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
        </button>
        <input 
          ref={fileInputRef} 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
          className="hidden" 
        />
      </div>
      <div>
        <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.username}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Buyer Account</p>
      </div>
    </div>
  );
};

// Lazy imports
const BuyerProfile = lazy(() => import("../components/dashboard/BuyerProfile"));
const MyOrders = lazy(() => import("../components/dashboard/MyOrders"));
const MyReviews = lazy(() => import("../components/dashboard/MyReviews"));

const BuyerDashboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, loading } = useAuthStore();
  const location = useLocation();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes("/dashboard/buyer/profile")) return "profile";
    if (path.includes("/dashboard/buyer/orders")) return "orders";
    if (path.includes("/dashboard/buyer/wishlist")) return "wishlist";
    if (path.includes("/dashboard/buyer/reviews")) return "reviews";
    if (path.includes("/dashboard/buyer/settings")) return "settings";
    return "dashboard";
  };

  const activeTab = getActiveTab();

  useEffect(() => {
    document.title = "Buyer Dashboard | Triple Portion";
  }, []);

  if (loading || !user) return <DashboardSkeleton />;

  const navItems = [
    { id: "dashboard", icon: <Home size={20} />, label: "Dashboard", path: "/dashboard/buyer" },
    { id: "profile", icon: <User size={20} />, label: "My Profile", path: "/dashboard/buyer/profile" },
    { id: "orders", icon: <ShoppingCart size={20} />, label: "My Orders", path: "/dashboard/buyer/orders" },
    { id: "wishlist", icon: <Heart size={20} />, label: "Wishlist", path: "/dashboard/buyer/wishlist" },
    { id: "reviews", icon: <Star size={20} />, label: "My Reviews", path: "/dashboard/buyer/reviews" },
    { id: "settings", icon: <Settings size={20} />, label: "Settings", path: "/dashboard/buyer/settings" },
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
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader 
            user={user} 
            setIsMobileOpen={setIsMobileOpen} 
            portalName="Buyer Portal" 
          />

          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6 pb-24 lg:pb-6 transition-colors duration-200">
            <Suspense fallback={<DashboardSkeleton />}>
              <Routes>
                <Route index element={
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.username}!</h2>
                        <p className="text-gray-500 dark:text-gray-400">Manage your orders and track your shipments here.</p>
                      </div>

                      {/* Quick Profile Section */}
                      <ProfileUploadSection user={user} />
                    </div>

                    <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <ShoppingCart size={32} />
                      </div>
                      <h3 className="text-xl font-bold mb-2">No Active Orders</h3>
                      <p className="text-gray-500 max-w-sm mx-auto">You haven't placed any orders yet. Start exploring our products!</p>
                      <Link to="/" className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                        Start Shopping
                      </Link>
                    </div>
                  </div>
                } />
                <Route path="profile" element={<BuyerProfile />} />
                <Route path="orders" element={<MyOrders />} />
                <Route path="wishlist" element={<div className="p-12 text-center bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
                  <h3 className="text-xl font-bold mb-2">Wishlist coming soon!</h3>
                  <p className="text-gray-500">We're working on this feature.</p>
                </div>} />
                <Route path="reviews" element={<MyReviews />} />
                <Route path="settings" element={<div className="p-12 text-center bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
                  <h3 className="text-xl font-bold mb-2">Settings coming soon!</h3>
                  <p className="text-gray-500">We're working on this feature.</p>
                </div>} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileDashboardNav 
        setIsMobileOpen={setIsMobileOpen} 
        isMobileOpen={isMobileOpen}
        userRole="buyer" 
      />
    </div>
  );
};

export default BuyerDashboard;
