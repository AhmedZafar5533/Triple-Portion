import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingCart, User, Menu, Star, Users, Package } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const MobileDashboardNav = ({ setIsMobileOpen, userRole, isMobileOpen }) => {
  const { user } = useAuthStore();

  if (isMobileOpen) return null;

  const getRoleLinks = () => {
    switch (userRole) {
      case 'seller':
        return [
          { id: 'dashboard', icon: <Home size={22} />, label: 'Home', path: '/dashboard/seller' },
          { id: 'orders', icon: <ShoppingCart size={22} />, label: 'Orders', path: '/dashboard/seller/orders' },
          { id: 'reviews', icon: <Star size={22} />, label: 'Reviews', path: '/dashboard/seller/reviews' },
          { id: 'profile', icon: <User size={22} />, label: 'Profile', path: '/dashboard/seller/profile' },
        ];
      case 'admin':
        return [
          { id: 'dashboard', icon: <Home size={22} />, label: 'Home', path: '/dashboard/admin' },
          { id: 'vendors', icon: <Users size={22} />, label: 'Vendors', path: '/dashboard/admin/listed-vendors' },
          { id: 'products', icon: <Package size={22} />, label: 'Products', path: '/dashboard/admin/products' },
          { id: 'orders', icon: <ShoppingCart size={22} />, label: 'Orders', path: '/dashboard/admin/orders' },
        ];
      case 'buyer':
      default:
        return [
          { id: 'dashboard', icon: <Home size={22} />, label: 'Home', path: '/dashboard/buyer' },
          { id: 'orders', icon: <ShoppingCart size={22} />, label: 'Orders', path: '/dashboard/buyer/orders' },
          { id: 'reviews', icon: <Star size={22} />, label: 'Reviews', path: '/dashboard/buyer/reviews' },
          { id: 'profile', icon: <User size={22} />, label: 'Profile', path: '/dashboard/buyer/profile' },
        ];
    }
  };

  const links = getRoleLinks();

  return (
    <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] px-2 py-2">
        <div className="grid grid-cols-5 items-center">
          {links.map((link) => (
            <NavLink
              key={link.id}
              to={link.path}
              end={link.id === 'dashboard'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 p-2 rounded-2xl transition-all duration-300 ${
                  isActive 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              {link.icon}
              <span className="text-[9px] font-bold uppercase tracking-tighter">{link.label}</span>
            </NavLink>
          ))}
          
          <button
            onClick={() => setIsMobileOpen(true)}
            className="flex flex-col items-center justify-center gap-1 p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
          >
            <div className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Menu size={18} />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-tighter">More</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileDashboardNav;
