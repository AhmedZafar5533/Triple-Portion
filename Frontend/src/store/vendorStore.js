import { create } from "zustand";
import { toast } from "sonner";
import { API_BASE_URL } from "../config";

const API_URL = `${API_BASE_URL}/api/vendor`;

export const useVendorStore = create((set, get) => ({
  vendor: null,
  reviews: [],
  loading: false,
  isInitialized: false,

  getReviews: async () => {
    set({ loading: true });
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews/vendor`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        set({ reviews: data.reviews, loading: false });
      } else {
        toast.error(data.message || "Failed to fetch reviews");
        set({ loading: false });
      }
    } catch (err) {
      toast.error("Network error fetching reviews");
      set({ loading: false });
    }
  },

  initializeOnboarding: async () => {
    console.log("Initializing Onboarding at:", `${API_URL}/initialize`);
    try {
      set({ loading: true });
      const res = await fetch(`${API_URL}/initialize`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        console.error("Initialization failed:", data.message);
        return;
      }

      console.log("Onboarding Initialized:", data.vendor);
      set({ vendor: data.vendor, isInitialized: true });
    } catch (err) {
      console.error("Fetch Error during initialization:", err);
    } finally {
      set({ loading: false });
    }
  },

  fetchVendorData: async () => {
    try {
      set({ loading: true });
      const res = await fetch(`${API_URL}/me`, {
        credentials: "include",
      });

      if (res.status === 404) {
        set({ vendor: null, isInitialized: false });
        return;
      }

      const data = await res.json();
      if (res.ok) {
        set({ vendor: data.vendor, isInitialized: true });
      }
    } catch (err) {
      console.error("Fetch vendor error:", err);
    } finally {
      set({ loading: false });
    }
  },

  saveStep: async (stepNumber, data) => {
    try {
      set({ loading: true });
      const isFormData = data instanceof FormData;
      const res = await fetch(`${API_URL}/step/${stepNumber}`, {
        method: "POST",
        credentials: "include",
        ...(isFormData
          ? { body: data }
          : {
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            }),
      });

      const resData = await res.json();
      if (!res.ok) {
        toast.error(resData.message || `Error saving step ${stepNumber}.`);
        return false;
      }

      toast.success(resData.message || "Saved successfully.");
      set({ vendor: resData.vendor });
      return true;
    } catch (err) {
      console.error(`Step ${stepNumber} error:`, err);
      toast.error(`Error saving step ${stepNumber}.`);
      return false;
    } finally {
      set({ loading: false });
    }
  },
  deleteImage: async (field) => {
    try {
      set({ loading: true });
      const res = await fetch(`${API_URL}/delete-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ field }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Error deleting image.");
        return false;
      }

      toast.success("Image removed successfully.");
      set({ vendor: data.vendor });
      return true;
    } catch (err) {
      console.error("Delete image error:", err);
      toast.error("Error deleting image.");
      return false;
    } finally {
      set({ loading: false });
    }
  },
  submitCorrections: async () => {
    try {
      set({ loading: true });
      const res = await fetch(`${API_URL}/submit-corrections`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Error submitting corrections.");
        return false;
      }

      toast.success(data.message || "Corrections submitted!");
      set({ vendor: data.vendor });
      return true;
    } catch (err) {
      console.error("Submit corrections error:", err);
      toast.error("Error submitting corrections.");
      return false;
    } finally {
      set({ loading: false });
    }
  },

  reset: () => set({ vendor: null, loading: false, isInitialized: false }),
}));
