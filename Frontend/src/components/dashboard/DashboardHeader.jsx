import React from 'react';
import { Menu, User as UserIcon } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';
import { API_BASE_URL } from '../../config';

const DashboardHeader = ({ user, setIsMobileOpen, portalName }) => {
  return (
    <header className="hidden lg:block bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-0 shadow-sm border-b border-gray-200 dark:border-gray-700 z-20">
      <div className="flex justify-between items-center px-4 md:px-6 py-3">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMobileOpen(true)} 
            className="lg:hidden p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <Menu size={20} />
          </button>
          
          <div className="hidden lg:block">
             <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight capitalize">
                {portalName}
             </h2>
          </div>
          
          {/* Mobile Logo/Title (Optional, can show portal name) */}
          <div className="lg:hidden">
             <h2 className="text-sm font-bold text-blue-600 dark:text-blue-400 tracking-tighter uppercase">
                {portalName.split(' ')[0]}
             </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          
          <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1 hidden md:block" />
          
          <div className="flex items-center gap-3 pl-1">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[120px]">
                {user?.username}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-tighter">
                {user?.role}
              </p>
            </div>
            
            <div className="relative group">
               <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-600/20 overflow-hidden border-2 border-white dark:border-gray-700">
                  {user?.profilePic ? (
                    <img 
                      src={user.profilePic.startsWith('http') ? user.profilePic : `${API_BASE_URL}/${user.profilePic}`} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.username?.charAt(0).toUpperCase() || <UserIcon size={16} />
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
