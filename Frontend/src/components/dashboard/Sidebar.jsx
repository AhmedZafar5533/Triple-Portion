import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, LogOut, ChevronDown, X } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import ThemeToggle from "../ThemeToggle";

const Sidebar = ({ 
  navItems, 
  activeTab, 
  isCollapsed, 
  setIsCollapsed, 
  isMobileOpen, 
  setIsMobileOpen 
}) => {
  const { sendLogoutRequest } = useAuthStore();
  const [openGroups, setOpenGroups] = useState({});

  // Auto-open group if a sub-item is active
  useEffect(() => {
    navItems.forEach(item => {
      if (item.isGroup && item.subItems.some(sub => sub.id === activeTab)) {
        setOpenGroups(prev => ({ ...prev, [item.id]: true }));
      }
    });
  }, [activeTab, navItems]);

  const toggleGroup = (groupId) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setOpenGroups(prev => ({ ...prev, [groupId]: true }));
    } else {
      setOpenGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
    }
  };

  const NavLink = ({ item, isSubItem = false }) => {
    const isActive = activeTab === item.id;
    
    return (
      <Link 
        to={item.path} 
        onClick={() => setIsMobileOpen(false)} 
        className={`group relative flex items-center ${isCollapsed ? "justify-center" : "gap-3"} ${isSubItem ? "py-2 pl-11 pr-3" : "p-3"} rounded-lg transition-colors cursor-pointer ${isActive 
          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
          : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"}`}
      >
        <div className={`flex-shrink-0 flex items-center justify-center ${isSubItem ? "w-4 h-4" : "w-6 h-6"}`}>{item.icon}</div>
        
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className={`font-medium overflow-hidden whitespace-nowrap ${isSubItem ? "text-sm" : ""}`}
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
        
        {isCollapsed && (
          <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none shadow-lg">
            {item.label}
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
          </div>
        )}
      </Link>
    );
  };

  return (
    <aside className={`fixed lg:relative h-screen w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-30 flex flex-col ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <Link to="/" className="flex items-center group overflow-hidden">
          <div className="h-10 w-10 min-w-[40px] rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg transition-transform group-hover:scale-105">
            T
          </div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.h1 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto", marginLeft: 12 }}
                exit={{ opacity: 0, width: 0 }}
                className="text-xl font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap"
              >
                Triple Portion
              </motion.h1>
            )}
          </AnimatePresence>
        </Link>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="hidden lg:block p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-500 cursor-pointer transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        
        {/* Mobile Close Button */}
        <button 
          onClick={() => setIsMobileOpen(false)} 
          className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-gray-500 cursor-pointer transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <div className="lg:hidden p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Settings</span>
        <ThemeToggle />
      </div>

      <nav className="p-3 space-y-1 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {navItems.map(item => {
          if (item.isGroup) {
            const isOpen = openGroups[item.id];
            const isAnySubActive = item.subItems.some(sub => sub.id === activeTab);
            
            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => toggleGroup(item.id)}
                  className={`w-full group relative flex items-center ${isCollapsed ? "justify-center" : "gap-3"} p-3 rounded-lg transition-colors cursor-pointer ${isOpen || isAnySubActive
                    ? "text-blue-600 dark:text-blue-400" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"}`}
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-6 h-6">{item.icon}</div>
                  
                  {!isCollapsed && (
                    <>
                      <span className="font-medium flex-1 text-left overflow-hidden whitespace-nowrap">{item.label}</span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={16} />
                      </motion.div>
                    </>
                  )}

                  {isCollapsed && (
                    <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none shadow-lg">
                      {item.label}
                      <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                    </div>
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && !isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-1 mt-1">
                        {item.subItems.map(sub => (
                          <NavLink key={sub.id} item={sub} isSubItem={true} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }
          return <NavLink key={item.id} item={item} />;
        })}
      </nav>

      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <button 
          onClick={sendLogoutRequest} 
          className={`group relative w-full flex items-center ${isCollapsed ? "justify-center" : "gap-3"} p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium cursor-pointer`}
        >
          <div className="flex-shrink-0 flex items-center justify-center w-6 h-6"><LogOut size={20} /></div>
          
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto", marginLeft: 12 }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>

          {isCollapsed && (
            <div className="absolute left-full ml-4 px-2 py-1 bg-red-600 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none shadow-lg">
              Sign Out
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-red-600" />
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
