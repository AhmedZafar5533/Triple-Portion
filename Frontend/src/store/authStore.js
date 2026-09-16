import { create } from "zustand";
import { toast } from "sonner";
import { useCartStore } from "./cartStore";
import { API_BASE_URL } from "../config";

// Centralized API Base URL
const API_URL = `${API_BASE_URL}/api/auth`;

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: false,
  authChecked: false,
  authenticationState: false,
  returnedMessages: null,

  isCheckingAuth: false,
  checkAuth: async () => {
    if (get().isCheckingAuth) return;
    set({ isCheckingAuth: true });
    try {
      const res = await fetch(`${API_URL}/me`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, authenticationState: !!data.user, authChecked: true, isCheckingAuth: false });
      } else {
        set({ user: null, authenticationState: false, authChecked: true, isCheckingAuth: false });
      }
    } catch (err) {
      console.error("checkAuth error:", err);
      set({ user: null, authenticationState: false, authChecked: true, isCheckingAuth: false });
    }
  },

  sendLoginRequest: async (data) => {
    set({ loading: true, returnedMessages: null });
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (res.ok) {
        set({ loading: false, authenticationState: true, user: resData.user, returnedMessages: null });
        toast.success(resData.message || "Logged in successfully");
        // Merge guest cart with server cart
        useCartStore.getState().mergeWithServer();
      } else {
        const errorMsg = resData.error || "Login failed";
        set({ loading: false, returnedMessages: errorMsg });
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Login error:", err);
      set({ loading: false, returnedMessages: "Network error" });
      toast.error("Network error. Please try again later.");
    }
  },

  sendRegisterRequest: async (data) => {
    set({ loading: true, returnedMessages: null });
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (res.ok) {
        set({ loading: false, authenticationState: true, user: resData.user, returnedMessages: null });
        toast.success(resData.message || "Account created successfully!");
        // Merge guest cart with server cart
        useCartStore.getState().mergeWithServer();
      } else {
        const errorMsg = resData.error || "Registration failed";
        set({ loading: false, returnedMessages: errorMsg });
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Register error:", err);
      set({ loading: false, returnedMessages: "Network error" });
      toast.error("Network error. Please try again later.");
    }
  },

  sendLogoutRequest: async () => {
    try {
      await fetch(`${API_URL}/logout`, { method: "POST", credentials: "include" });
      set({ user: null, authenticationState: false });
      toast.success("Logged out successfully");
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error", err);
      toast.error("Failed to logout");
    }
  },
  
  uploadProfilePic: async (file) => {
    try {
      set({ loading: true });
      const formData = new FormData();
      formData.append("profilePic", file);
      const res = await fetch(`${API_URL}/profile-pic`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Upload failed.");
        return null;
      }

      toast.success("Profile picture updated!");
      return data.profilePic;
    } catch (err) {
      console.error("Profile pic error:", err);
      toast.error("Error uploading profile picture.");
      return null;
    } finally {
      set({ loading: false });
    }
  },
}));
