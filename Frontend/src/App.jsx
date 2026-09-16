import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Admin from "./pages/Admin";
import SellerDashboard from "./pages/SellerDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import AboutPage from "./pages/AboutPage";
import NotFoundPage from "./pages/404Page";
import Error500Page from "./pages/500Page";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import VendorOnboardingForm from "./pages/VendorOnboarding";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OTPVerification from "./pages/OtpPage";
import CheckoutPage from "./pages/CheckoutPage";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutCancel from "./pages/CheckoutCancel";
import VendorDetailPage from "./pages/admin/VendorDetails";
import Navbar from "./components/Navbar/Navbar";
import ScrollToTop from "./components/ScrollToTop";
import { GuestRoute, AdminRoute, SellerRoute, BuyerRoute } from "./components/RoleRoute";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { useThemeStore } from "./store/themeStore";
import { useAuthStore } from "./store/authStore";
import { useLocation } from "react-router-dom";
import CartDrawer from "./components/CartDrawer";

const ThemeWatcher = () => {
  const { theme } = useThemeStore();
  const location = useLocation();

  useEffect(() => {
    // Only allow dark mode on dashboard routes
    const isDashboard = location.pathname.startsWith('/dashboard');
    if (isDashboard) {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [location.pathname, theme]);

  return null;
};

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

function App() {
  const { initTheme, theme } = useThemeStore();
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    initTheme();
    checkAuth();
  }, [initTheme, checkAuth]);

  return (
    <Router>
      <ThemeWatcher />
      <ScrollToTop />
      <Toaster
        position="top-right"
        richColors
        expand={false}
        closeButton
        theme={theme}
      />
      <CartDrawer />
      <Routes>
        {/* Public Routes with Navbar */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfUse />} />
          <Route path="/checkout" element={<BuyerRoute><CheckoutPage /></BuyerRoute>} />
          <Route path="/checkout/success" element={<BuyerRoute><CheckoutSuccess /></BuyerRoute>} />
          <Route path="/checkout/cancel" element={<BuyerRoute><CheckoutCancel /></BuyerRoute>} />

          <Route path="/500" element={<Error500Page />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Onboarding Form — Immersive (no Navbar/Footer), Seller only */}
        <Route path="/onboarding" element={<SellerRoute><VendorOnboardingForm /></SellerRoute>} />

        {/* Role-Specific Dashboards */}
        <Route path="/dashboard/seller/*" element={<SellerRoute><SellerDashboard /></SellerRoute>} />
        <Route path="/dashboard/admin/vendor-details/:id" element={<AdminRoute><VendorDetailPage /></AdminRoute>} />
        <Route path="/dashboard/admin/*" element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="/dashboard/buyer/*" element={<BuyerRoute><BuyerDashboard /></BuyerRoute>} />

        {/* Guest-only auth routes — logged-in users cannot access (No Navbar) */}
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
        <Route path="/verify-otp" element={<GuestRoute><OTPVerification /></GuestRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
