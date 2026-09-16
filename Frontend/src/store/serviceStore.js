import { create } from "zustand";
import { toast } from "sonner";
import { API_BASE_URL } from "../config";

const baseUrl = `${API_BASE_URL}/api`;

export const useServiceStore = create((set, get) => ({
  allServices: [],
  activeServices: [], // Unified name for active services data
  frontEndServices: [], // For legacy compatibility (names only)
  activeServicesMap: {}, // For delivery thresholds etc.
  loading: false,
  fetched: false,
  error: null,
  successfullyCreated: false,

  // Unified fetch for active services (used by Navbar and HomePage)
  fetchActiveServices: async (force = false) => {
    if (get().loading || (get().fetched && !force)) return;

    set({ loading: true, error: null });
    try {
      const res = await fetch(`${baseUrl}/services/active`);
      const data = await res.json();
      
      if (res.ok && data.success) {
        const services = data.data || [];
        const namesOnly = services.map((s) => s.name);
        const map = {};
        services.forEach(s => {
          map[s.name] = {
            deliveryChargePerItem: s.deliveryChargePerItem || 0,
            freeDeliveryThreshold: s.freeDeliveryThreshold || 0
          };
        });

        set({ 
          activeServices: services, 
          frontEndServices: namesOnly, 
          activeServicesMap: map, 
          fetched: true, 
          loading: false 
        });
      } else {
        throw new Error(data.message || 'Failed to fetch services');
      }
    } catch (err) {
      console.error('Fetch services error:', err);
      set({ error: err.message, loading: false });
    }
  },

  // Legacy alias for fetchActiveServices
  fetchFrontendServices: () => get().fetchActiveServices(),

  // Admin: Fetch all services (enabled and disabled)
  fetchAllServices: async () => {
    try {
      set({ loading: true });
      const result = await fetch(`${baseUrl}/services/all`, {
        method: "GET",
        credentials: "include",
      });
      const data = await result.json();
      if (result.ok) {
        set({ allServices: data.data || [] });
      } else {
        console.error("Failed to fetch all services:", data.message);
      }
    } catch (error) {
      console.error("fetchAllServices error:", error);
    } finally {
      set({ loading: false });
    }
  },

  // Admin: Toggle service status
  toggleService: async (id) => {
    try {
      const result = await fetch(`${baseUrl}/services/${id}/toggle`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await result.json();
      if (result.ok) {
        toast.success(data.message);
        set((state) => ({
          allServices: state.allServices.map((s) =>
            s._id === id ? { ...s, isEnabled: !s.isEnabled } : s
          ),
          // Clear fetched flag so Navbar/Home refresh their lists next time
          fetched: false
        }));
        return true;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("toggleService error:", error);
      toast.error("Failed to toggle service status");
    }
    return false;
  },

  // Admin: Update delivery settings
  updateDeliverySettings: async (id, settings) => {
    try {
      const result = await fetch(`${baseUrl}/services/${id}/delivery-charge`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
        credentials: "include",
      });
      const data = await result.json();
      if (result.ok) {
        toast.success(data.message);
        set((state) => ({
          allServices: state.allServices.map((s) =>
            s._id === id ? { ...s, ...data.data } : s
          ),
          fetched: false
        }));
        return true;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("updateDeliverySettings error:", error);
      toast.error("Failed to update delivery settings");
    }
    return false;
  },

  fetchServicesByCategory: async (category) => {
    set({ loading: true });
    try {
      const result = await fetch(`${baseUrl}/service-page/services/all/${category}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await result.json();
      if (result.ok) {
        set({
          allServices: data.data.map((service) => ({ ...service, rating: 4.5 })),
        });
      }
    } catch (error) {
      console.error("fetchServicesByCategory error:", error);
    } finally {
      set({ loading: false });
    }
  },
}));
