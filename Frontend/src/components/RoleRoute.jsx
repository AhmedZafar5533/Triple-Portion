import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

/**
 * GuestRoute: Only accessible when NOT logged in.
 */
export const GuestRoute = ({ children }) => {
  const { authenticationState, authChecked } = useAuthStore();
  if (!authChecked) return null;
  if (authenticationState) return <Navigate to="/" replace />;
  return children;
};

/**
 * Protected Routes for different roles
 */
export const AdminRoute = ({ children }) => {
  const { authenticationState, authChecked, user, loading } = useAuthStore();
  if (!authChecked || loading) return null;
  if (!authenticationState) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/" replace />;
  return children;
};

export const SellerRoute = ({ children }) => {
  const { authenticationState, authChecked, user, loading } = useAuthStore();
  if (!authChecked || loading) return null;
  if (!authenticationState) return <Navigate to="/login" replace />;
  if (user?.role !== "seller") return <Navigate to="/" replace />;
  return children;
};

export const BuyerRoute = ({ children }) => {
  const { authenticationState, authChecked, loading } = useAuthStore();
  if (!authChecked || loading) return null;
  if (!authenticationState) return <Navigate to="/login" replace />;
  // Any authenticated user can be a buyer
  return children;
};
