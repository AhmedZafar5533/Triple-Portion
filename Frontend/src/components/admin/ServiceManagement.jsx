import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus, FaTrash, FaCheck, FaTimes,
  FaSync, FaSearch, FaFilter, FaInfoCircle, FaUsers, FaBan, FaCheckCircle
} from "react-icons/fa";
import { Loader2, Truck } from "lucide-react";
import { useServiceStore } from "../../store/serviceStore";
import { SkeletonCard, SkeletonBase } from "../Skeleton";

const ServiceManagement = () => {
  const {
    allServices,
    fetchAllServices,
    toggleService,
    loading
  } = useServiceStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [deliverySettings, setDeliverySettings] = useState({}); // { [id]: { charge, threshold } }
  const [selectedServiceForDelivery, setSelectedServiceForDelivery] = useState(null);

  useEffect(() => {
    fetchAllServices();
  }, [fetchAllServices]);

  // Enabled services for the main grid
  const enabledServices = useMemo(() => {
    return allServices.filter(s => s.isEnabled && s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [allServices, searchQuery]);

  // Disabled services for the "Add" modal
  const disabledServices = useMemo(() => {
    return allServices.filter(s => !s.isEnabled);
  }, [allServices]);

  const handleToggle = async (id) => {
    setTogglingId(id);
    await toggleService(id);
    setTogglingId(null);
    if (showAddModal) setShowAddModal(false);
  };

  const handleDeliverySettingChange = (id, field, value) => {
    setDeliverySettings(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || { 
          charge: allServices.find(s => s._id === id)?.deliveryChargePerItem || 0,
          threshold: allServices.find(s => s._id === id)?.freeDeliveryThreshold || 0
        }),
        [field]: value
      }
    }));
  };

  const saveDeliverySettings = async (service) => {
    const settings = deliverySettings[service._id];
    if (settings) {
      await useServiceStore.getState().updateDeliverySettings(service._id, {
        deliveryChargePerItem: Number(settings.charge),
        freeDeliveryThreshold: Number(settings.threshold)
      });
    }
    setSelectedServiceForDelivery(null);
  };

  if (loading && allServices.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <SkeletonBase className="h-8 w-48" />
          <SkeletonBase className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <SkeletonBase key={i} className="h-40 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 md:p-6 bg-gray-50/50 dark:bg-gray-900/50 rounded-3xl">
      {/* Header Section */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Service Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Manage active industries and vendor availability.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-semibold shadow-md cursor-pointer text-sm"
          >
            <FaPlus /> Add Service
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-3" />
          <input
            type="text"
            placeholder="Search active services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
          />
        </div>
      </div>

      {/* Grid Section - Smaller Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {enabledServices.map((service) => (
            <motion.div
              key={service._id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[160px]"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                    <FaInfoCircle className="text-lg" />
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs font-medium text-gray-500">
                    <FaUsers className="text-blue-500" />
                    <span>{service.vendorCount || 0} Vendors</span>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug">
                  {service.name}
                </h3>
              </div>

              <div className="mt-4 space-y-3">
                {/* Delivery Pricing Button */}
                {service.name !== "Accommodation" && service.name !== "Tour" && (
                  <button
                    onClick={() => setSelectedServiceForDelivery(service)}
                    className="w-full flex items-center justify-center gap-2 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Truck size={14} /> Manage Delivery
                  </button>
                )}

                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggle(service._id)}
                    disabled={togglingId === service._id}
                    className="flex-1 flex items-center justify-center gap-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {togglingId === service._id ? <Loader2 className="size-3 animate-spin" /> : <FaBan />}
                    Disable
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Service Modal (includes disabled services) */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold">Add Service</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <FaTimes />
                </button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
                <p className="text-sm text-gray-500 mb-4 font-medium italic">
                  Enable previously disabled services or create a new one.
                </p>

                {disabledServices.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Inactive Services</h4>
                    {disabledServices.map(service => (
                      <div key={service._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
                        <div className="flex-1 mr-4">
                          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{service.name}</h4>
                        </div>
                        <button
                          onClick={() => handleToggle(service._id)}
                          disabled={togglingId === service._id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 min-w-[90px] justify-center"
                        >
                          {togglingId === service._id ? <Loader2 className="size-3 animate-spin" /> : <FaCheckCircle />}
                          Enable
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-2xl">
                    <p className="text-sm text-gray-400">No inactive services found.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delivery Pricing Modal */}
      <AnimatePresence>
        {selectedServiceForDelivery && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedServiceForDelivery(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                    <Truck size={20} />
                  </div>
                  <h2 className="text-xl font-bold">Delivery Pricing</h2>
                </div>
                <button onClick={() => setSelectedServiceForDelivery(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <FaTimes />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium leading-relaxed">
                    Configure delivery pricing for <strong>{selectedServiceForDelivery.name}</strong>. Set the charge per item and an optional threshold for free delivery.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Charge Per Item (UGX)</label>
                    <input 
                      type="number"
                      placeholder="e.g. 5000"
                      value={deliverySettings[selectedServiceForDelivery._id]?.charge !== undefined ? deliverySettings[selectedServiceForDelivery._id].charge : (selectedServiceForDelivery.deliveryChargePerItem || 0)}
                      onChange={(e) => handleDeliverySettingChange(selectedServiceForDelivery._id, 'charge', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-blue-500 rounded-xl outline-none transition-all text-sm font-bold"
                      min="0"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Free Delivery Threshold (UGX)</label>
                    <input 
                      type="number"
                      placeholder="e.g. 500000"
                      value={deliverySettings[selectedServiceForDelivery._id]?.threshold !== undefined ? deliverySettings[selectedServiceForDelivery._id].threshold : (selectedServiceForDelivery.freeDeliveryThreshold || 0)}
                      onChange={(e) => handleDeliverySettingChange(selectedServiceForDelivery._id, 'threshold', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-blue-500 rounded-xl outline-none transition-all text-sm font-bold"
                      min="0"
                    />
                    <p className="text-[9px] text-gray-400 px-1 italic">*Set to 0 to disable free delivery threshold</p>
                  </div>
                </div>

                <button 
                  onClick={() => saveDeliverySettings(selectedServiceForDelivery)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                >
                  Save Delivery Settings
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {enabledServices.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <FaSearch className="text-2xl text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">No active services</h3>
          <p className="text-gray-500 text-sm max-w-xs">
            Use the "Add Service" button to enable industries for vendor onboarding.
          </p>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;
