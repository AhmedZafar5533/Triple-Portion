import { create } from "zustand";
import { toast } from "sonner";
import { API_BASE_URL } from "../config";

const API_URL = `${API_BASE_URL}/api/admin`;

export const useAdminStore = create((set, get) => ({
  pendingVendors: [],
  approvedVendors: [],
  rejectedVendors: [],
  vendorData: null,
  loading: false,
  success: false,
  activeServices: [],
  payments: [],
  reviews: [],
  orders: [],
  dashboardStats: null,
  recentOrders: [],
  recentPayments: [],
  payouts: [],
  vendorFinancials: null,

  pagination: {
    vendors: { totalPages: 1, totalItems: 0, currentPage: 1 },
    pending: { totalPages: 1, totalItems: 0, currentPage: 1 },
    rejected: { totalPages: 1, totalItems: 0, currentPage: 1 },
    payments: { totalPages: 1, totalItems: 0, currentPage: 1 },
    payouts: { totalPages: 1, totalItems: 0, currentPage: 1 },
    orders: { totalPages: 1, totalItems: 0, currentPage: 1 },
    reviews: { totalPages: 1, totalItems: 0, currentPage: 1 },
  },

  getApprovedVendors: async (page = 1, limit = 8, search = "") => {
    set({ loading: true });
    try {
      const res = await fetch(`${API_URL}/vendors?status=Approved&page=${page}&limit=${limit}&search=${search}`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        set(state => ({ 
          approvedVendors: data.vendors, 
          pagination: {
            ...state.pagination,
            vendors: { totalPages: data.totalPages, totalItems: data.total, currentPage: data.currentPage }
          },
          loading: false 
        }));
      } else {
        toast.error(data.message || "Failed to fetch approved vendors");
        set({ loading: false });
      }
    } catch (err) {
      toast.error("Network error fetching approved vendors");
      set({ loading: false });
    }
  },

  getPendingVendors: async (page = 1, limit = 8, search = "") => {
    set({ loading: true });
    try {
      const res = await fetch(`${API_URL}/vendors?status=Pending&page=${page}&limit=${limit}&search=${search}`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        set(state => ({ 
          pendingVendors: data.vendors, 
          pagination: {
            ...state.pagination,
            pending: { totalPages: data.totalPages, totalItems: data.total, currentPage: data.currentPage }
          },
          loading: false 
        }));
      } else {
        toast.error(data.message || "Failed to fetch pending vendors");
        set({ loading: false });
      }
    } catch (err) {
      toast.error("Network error fetching pending vendors");
      set({ loading: false });
    }
  },

  getRejectedVendors: async (page = 1, limit = 8, search = "") => {
    set({ loading: true });
    try {
      const res = await fetch(`${API_URL}/vendors?status=Rejected&page=${page}&limit=${limit}&search=${search}`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        set(state => ({ 
          rejectedVendors: data.vendors, 
          pagination: {
            ...state.pagination,
            rejected: { totalPages: data.totalPages, totalItems: data.total, currentPage: data.currentPage }
          },
          loading: false 
        }));
      } else {
        toast.error(data.message || "Failed to fetch rejected vendors");
        set({ loading: false });
      }
    } catch (err) {
      toast.error("Network error fetching rejected vendors");
      set({ loading: false });
    }
  },

  getVendorDetails: async (id) => {
    set({ loading: true, vendorData: null, success: false });
    try {
      const res = await fetch(`${API_URL}/vendors/${id}`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        set({ vendorData: data.vendor, loading: false });
      } else {
        toast.error(data.message || "Failed to fetch vendor details");
        set({ loading: false });
      }
    } catch (err) {
      toast.error("Network error fetching vendor details");
      set({ loading: false });
    }
  },

  setVendorApproval: async ({ status, vendorId, reason }) => {
    set({ loading: true, success: false });
    try {
      const res = await fetch(`${API_URL}/vendors/${vendorId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rejectionReason: reason }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Vendor ${status} successfully`);
        set({ success: true, loading: false });
        // Refresh lists using stored current page
        const { pagination } = get();
        get().getPendingVendors(pagination.pending.currentPage);
        get().getApprovedVendors(pagination.vendors.currentPage);
        get().getRejectedVendors(pagination.rejected.currentPage);
      } else {
        toast.error(data.message || `Failed to ${status.toLowerCase()} vendor`);
        set({ loading: false });
      }
    } catch (err) {
      toast.error("Network error updating vendor status");
      set({ loading: false });
    }
  },

  deleteVendor: async (vendorId) => {
    if (!window.confirm("ARE YOU SURE? This will permanently delete the vendor application from the database!")) return;
    
    set({ loading: true, success: false });
    try {
      const res = await fetch(`${API_URL}/vendors/${vendorId}`, {
        method: "DELETE",
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        set({ success: true, loading: false });
        const { pagination } = get();
        get().getPendingVendors(pagination.pending.currentPage);
        get().getApprovedVendors(pagination.vendors.currentPage);
        get().getRejectedVendors(pagination.rejected.currentPage);
      } else {
        toast.error(data.message || "Failed to delete vendor");
        set({ loading: false });
      }
    } catch (err) {
      toast.error("Network error deleting vendor");
      set({ loading: false });
    }
  },

  manageServices: async (service) => {
    set({ loading: true });
    // This part likely needs its own backend endpoint later, 
    // for now we'll keep the mock logic but add success toast
    await new Promise(resolve => setTimeout(resolve, 500));
    set(state => {
      let newActive;
      if (service.isActive) {
        if (!state.activeServices.find(s => s.title === service.title)) {
          newActive = [...state.activeServices, { id: Date.now().toString(), title: service.title, isActive: true }];
        } else {
          newActive = state.activeServices.map(s => s.title === service.title ? { ...s, isActive: true } : s);
        }
      } else {
        newActive = state.activeServices.filter(s => s.title !== service.title);
      }
      return { activeServices: newActive, loading: false };
    });
    toast.success(`Service ${service.isActive ? 'added' : 'removed'} successfully`);
  },

  fetchServices: async () => {
    set({ loading: true });
    // Mock for now
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ loading: false });
  },

  getDashboardStats: async () => {
    set({ loading: true });
    try {
      const res = await fetch(`${API_URL}/dashboard-stats`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        set({ 
          dashboardStats: data.stats, 
          recentOrders: data.recentOrders,
          recentPayments: data.recentPayments,
          loading: false 
        });
      }
    } catch (err) {
      console.error("fetch dashboard stats error:", err);
    } finally {
      set({ loading: false });
    }
  },

  getOrders: async (page = 1, limit = 10, status = "all", search = "") => {
    set({ loading: true });
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/admin?page=${page}&limit=${limit}&status=${status}&search=${search}`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        set(state => ({ 
          orders: data.orders, 
          pagination: {
            ...state.pagination,
            orders: { totalPages: data.totalPages, totalItems: data.total, currentPage: data.currentPage }
          },
          loading: false 
        }));
      }
    } catch (err) {
      toast.error("Failed to fetch orders");
    } finally {
      set({ loading: false });
    }
  },

  getPayments: async (page = 1, limit = 10, status = "all", search = "") => {
    set({ loading: true });
    try {
      const res = await fetch(`${API_URL}/payments?page=${page}&limit=${limit}&status=${status}&search=${search}`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        set(state => ({ 
          payments: data.payments, 
          pagination: {
            ...state.pagination,
            payments: { totalPages: data.totalPages, totalItems: data.total, currentPage: data.currentPage }
          },
          loading: false 
        }));
      } else {
        toast.error(data.message || "Failed to fetch payments");
        set({ loading: false });
      }
    } catch (err) {
      toast.error("Network error fetching payments");
      set({ loading: false });
    }
  },

  getReviews: async (page = 1, limit = 10) => {
    set({ loading: true });
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews/admin?page=${page}&limit=${limit}`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        set(state => ({ 
          reviews: data.reviews, 
          pagination: {
            ...state.pagination,
            reviews: { totalPages: data.totalPages, totalItems: data.total, currentPage: data.currentPage }
          },
          loading: false 
        }));
      } else {
        toast.error(data.message || "Failed to fetch reviews");
        set({ loading: false });
      }
    } catch (err) {
      toast.error("Network error fetching reviews");
      set({ loading: false });
    }
  },

  getPayouts: async (page = 1, limit = 10) => {
    set({ loading: true });
    try {
      const res = await fetch(`${API_URL}/payouts?page=${page}&limit=${limit}`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        set(state => ({ 
          payouts: data.payouts || [], 
          pagination: {
            ...state.pagination,
            payouts: { totalPages: data.totalPages, totalItems: data.total, currentPage: data.currentPage }
          },
          loading: false 
        }));
      }
    } catch (err) {
      toast.error("Failed to fetch payouts");
    } finally {
      set({ loading: false });
    }
  },

  createPayout: async (payoutData) => {
    set({ loading: true, success: false });
    try {
      const res = await fetch(`${API_URL}/payouts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payoutData),
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Payout recorded successfully");
        set({ success: true, loading: false });
        get().getPayouts();
        get().getApprovedVendors(); // Refresh vendor balances
      } else {
        toast.error(data.message || "Failed to record payout");
        set({ loading: false });
      }
    } catch (err) {
      toast.error("Network error recording payout");
      set({ loading: false });
    }
  },

  getVendorFinancials: async (vendorId) => {
    set({ loading: true, vendorFinancials: null });
    try {
      const res = await fetch(`${API_URL}/vendor-financials/${vendorId}`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        set({ vendorFinancials: data, loading: false });
      } else {
        toast.error(data.message || "Failed to fetch vendor financials");
        set({ loading: false });
      }
    } catch (err) {
      toast.error("Network error fetching vendor financials");
      set({ loading: false });
    }
  },
}));
