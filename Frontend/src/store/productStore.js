import { create } from 'zustand';
import { toast } from 'sonner';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/products`;


export const useProductStore = create((set, get) => ({
  myProducts: [],
  loading: false,

  addProduct: async (formData) => {
    set({ loading: true });
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        get().fetchMyProducts();
        return true;
      } else {
        if (data.details && Array.isArray(data.details)) {
          console.log(data.details);
          data.details.forEach(err => toast.error(err));
        } else {
          toast.error(data.message || 'Failed to add product');
        }
        return false;
      }
    } catch (err) {
      toast.error('Network error');
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateProduct: async (id, formData) => {
    set({ loading: true });
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        body: formData,
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        get().fetchMyProducts();
        return true;
      } else {
        if (data.details && Array.isArray(data.details)) {
          data.details.forEach(err => toast.error(err));
        } else {
          toast.error(data.message || 'Failed to update product');
        }
        return false;
      }
    } catch (err) {
      toast.error('Network error');
      return false;
    } finally {
      set({ loading: false });
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true });
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        set({ myProducts: get().myProducts.filter(p => p._id !== id) });
        return true;
      } else {
        toast.error(data.message || 'Failed to delete');
        return false;
      }
    } catch (err) {
      toast.error('Network error');
      return false;
    } finally {
      set({ loading: false });
    }
  },

  toggleAvailability: async (id, reason = null) => {
    try {
      const res = await fetch(`${API_URL}/${id}/toggle-availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        set({ 
          myProducts: get().myProducts.map(p => 
            p._id === id ? { ...p, availabilityStatus: data.product.availabilityStatus, disableReason: data.product.disableReason } : p
          ) 
        });
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Network error');
    }
  },

  adminProducts: [],
  loading: false,

  fetchAdminProducts: async () => {
    set({ loading: true });
    try {
      const res = await fetch(`${API_URL}/admin/all`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        set({ adminProducts: data.products });
      }
    } catch (err) {
      console.error('Error fetching admin products:', err);
    } finally {
      set({ loading: false });
    }
  },

  adminToggleProductStatus: async (id, reason = null) => {
    try {
      const res = await fetch(`${API_URL}/admin/${id}/toggle-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        set({ 
          adminProducts: get().adminProducts.map(p => 
            p._id === id ? { ...p, adminDisabled: data.product.adminDisabled, adminMessage: data.product.adminMessage } : p
          ) 
        });
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Network error');
    }
  },

  fetchMyProducts: async () => {
    set({ loading: true });
    try {
      const res = await fetch(`${API_URL}/my-products`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        set({ myProducts: data.products });
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      set({ loading: false });
    }
  },
}));
