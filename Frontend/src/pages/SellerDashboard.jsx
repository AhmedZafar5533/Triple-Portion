import { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import {
  Menu, ShoppingCart, CreditCard,
  MessageSquare, Home, Briefcase, User, Building, Map, ShoppingBasket, Construction, Star
} from "lucide-react";

import { useAuthStore } from "../store/authStore";
import ThemeToggle from "../components/ThemeToggle";
import { DashboardSkeleton } from "../components/Skeleton";
import Sidebar from "../components/dashboard/Sidebar";
import MobileDashboardNav from "../components/dashboard/MobileDashboardNav";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import VendorOnboardingPage from "./GotoOnboarding";
import VerificationPending from "../components/seller/VerificationPending";
import CorrectionRequired from "../components/seller/CorrectionRequired";
import ApplicationRejected from "../components/seller/ApplicationRejected";

const SellerProfile = lazy(() => import("../components/seller/Profile"));
const SellerOverview = lazy(() => import("../components/seller/Overview"));
const ElectronicsManagement = lazy(() => import("../components/seller/ElectronicsManagement"));
const AccommodationManagement = lazy(() => import("../components/seller/AccommodationManagement"));
const TourManagement = lazy(() => import("../components/seller/TourManagement"));
const GroceryManagement = lazy(() => import("../components/seller/GroceryManagement"));
const BuildingMaterialManagement = lazy(() => import("../components/seller/BuildingMaterialManagement"));
const VendorOrders = lazy(() => import("../components/seller/VendorOrders"));
const VendorReviews = lazy(() => import("../components/seller/VendorReviews"));

const SellerDashboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, loading } = useAuthStore();
  const location = useLocation();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes("/dashboard/seller/profile")) return "profile";
    if (path.includes("/dashboard/seller/orders")) return "orders";
    if (path.includes("/dashboard/seller/electronics")) return "electronics";
    if (path.includes("/dashboard/seller/accommodations")) return "accommodations";
    if (path.includes("/dashboard/seller/tours")) return "tours";
    if (path.includes("/dashboard/seller/groceries")) return "groceries";
    if (path.includes("/dashboard/seller/building-materials")) return "building-materials";
    if (path.includes("/dashboard/seller/payments")) return "payments";
    if (path.includes("/dashboard/seller/messages")) return "messages";
    if (path.includes("/dashboard/seller/reviews")) return "reviews";
    return "dashboard";
  };

  const activeTab = getActiveTab();

  useEffect(() => {
    document.title = "Seller Dashboard | Triple Portion";
  }, []);

  if (loading || !user) return <DashboardSkeleton />;

  const baseNavItems = [
    { id: "dashboard", icon: <Home size={20} />, label: "Dashboard", path: "/dashboard/seller" },
    { id: "profile", icon: <User size={20} />, label: "My Profile", path: "/dashboard/seller/profile" },
    { id: "electronics", icon: <Briefcase size={20} />, label: "Electronics", path: "/dashboard/seller/electronics", industry: "Electronics" },
    { id: "accommodations", icon: <Building size={20} />, label: "Accommodations", path: "/dashboard/seller/accommodations", industry: "Accommodation" },
    { id: "tours", icon: <Map size={20} />, label: "Tours", path: "/dashboard/seller/tours", industry: "Tour" },
    { id: "groceries", icon: <ShoppingBasket size={20} />, label: "Groceries", path: "/dashboard/seller/groceries", industry: "Grocery" },
    { id: "building-materials", icon: <Construction size={20} />, label: "Construction", path: "/dashboard/seller/building-materials", industry: "Building Material" },
    { id: "orders", icon: <ShoppingCart size={20} />, label: "Orders", path: "/dashboard/seller/orders" },
    { id: "payments", icon: <CreditCard size={20} />, label: "Payments", path: "/dashboard/seller/payments" },
    { id: "messages", icon: <MessageSquare size={20} />, label: "Messages", path: "/dashboard/seller/messages" },
    { id: "reviews", icon: <Star size={20} />, label: "Reviews", path: "/dashboard/seller/reviews" },
  ];

  const navItems = baseNavItems.filter(item => !item.industry || item.industry === user?.vendorIndustry);


  const renderContent = () => {
    if (user.onboardingStatus === 'pending') {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="max-w-2xl w-full">
            <VendorOnboardingPage isDashboardView={true} />
          </div>
        </div>
      );
    }

    if (user.onboardingStatus === 'completed') {
      switch (user.vendorStatus) {
        case 'Action Required':
          return <CorrectionRequired message={user.adminMessage} />;
        case 'Rejected':
          return <ApplicationRejected message={user.adminMessage} />;
        case 'Pending':
        default:
          return <VerificationPending />;
      }
    }

    return (
      <Routes>
        <Route index element={<SellerOverview />} />
        <Route path="orders" element={<VendorOrders />} />
        {user?.vendorIndustry === "Electronics" && <Route path="electronics/*" element={<ElectronicsManagement />} />}
        {user?.vendorIndustry === "Accommodation" && <Route path="accommodations/*" element={<AccommodationManagement />} />}
        {user?.vendorIndustry === "Tour" && <Route path="tours/*" element={<TourManagement />} />}
        {user?.vendorIndustry === "Grocery" && <Route path="groceries/*" element={<GroceryManagement />} />}
        {user?.vendorIndustry === "Building Material" && <Route path="building-materials/*" element={<BuildingMaterialManagement />} />}
        <Route path="payments" element={<div>Payments Content</div>} />
        <Route path="reviews" element={<VendorReviews />} />
      </Routes>
    );
  };

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
            portalName="Seller Portal" 
          />

          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6 pb-24 lg:pb-6 transition-colors duration-200">
            <Suspense fallback={<DashboardSkeleton />}>
              <Routes>
                <Route path="profile" element={<SellerProfile />} />
                <Route path="*" element={renderContent()} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileDashboardNav 
        setIsMobileOpen={setIsMobileOpen} 
        isMobileOpen={isMobileOpen}
        userRole="seller" 
      />
    </div>
  );
};

export default SellerDashboard;
