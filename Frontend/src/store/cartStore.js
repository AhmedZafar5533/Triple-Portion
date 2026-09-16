import { create } from 'zustand';
import { toast } from 'sonner';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/cart`;
const STORAGE_KEY = 'tp_guest_cart';

const loadGuestCart = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { return []; }
};

const saveGuestCart = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const useCartStore = create((set, get) => ({
  items: loadGuestCart(),
  warnings: [],
  isOpen: false,
  loading: false,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set(s => ({ isOpen: !s.isOpen })),

  getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  getSubtotal: () => get().items.reduce((sum, i) => {
    if (i.category === "Tour") {
      const days = i.selectedDates?.length || 1;
      const gs = i.groupSize || 1;
      return sum + (i.price * gs * days);
    } else if (i.category === "Accommodation") {
      const nights = i.selectedDates?.length || 1;
      return sum + (i.price * i.quantity * nights);
    }
    return sum + (i.price * i.quantity);
  }, 0),

  // Guest add (called when user is NOT logged in)
  addItemGuest: (product, quantity = 1) => {
    let items = [...get().items];
    const idx = items.findIndex(i => i.productId === product._id);
    if (idx > -1) {
      if (product.category === "Tour" || product.category === "Accommodation") {
        items = items.map((item, i) => i === idx ? { 
          ...item, 
          selectedDates: product.selectedDates,
          quantity: 1 // Keep quantity at 1 for services
        } : item);
      } else {
        const newQty = items[idx].quantity + quantity;
        if (newQty > (product.stock || 999)) {
          toast.error(`Only ${product.stock} items available in stock`);
          return;
        }
        items = items.map((item, i) => i === idx ? { ...item, quantity: newQty } : item);
      }
    } else {
      items.push({
        productId: product._id,
        quantity: 1,
        price: product.discountedPrice || product.price,
        originalPrice: product.price,
        name: product.name,
        image: product.images?.[0] || '',
        category: product.category,
        stock: product.stock,
        selectedDates: product.selectedDates || [],
        groupSize: product.groupSize || 1,
        vendorId: product.vendorId?._id || product.vendorId
      });
    }
    saveGuestCart(items);
    set({ items });
    toast.success('Added to cart');
  },

  removeItemGuest: (productId) => {
    const items = get().items.filter(i => i.productId !== productId);
    saveGuestCart(items);
    set({ items });
  },

  updateQtyGuest: (productId, quantity) => {
    if (quantity <= 0) return get().removeItemGuest(productId);
    const items = get().items.map(i => {
      if (i.productId === productId) {
        if (quantity > i.quantity && (i.category === "Tour" || i.category === "Accommodation")) {
          toast.error("Quantity for tours and accommodations cannot be increased");
          return i;
        }
        if (quantity > (i.stock || 999)) {
          toast.error(`Only ${i.stock} items available in stock`);
          return i;
        }
        return { ...i, quantity };
      }
      return i;
    });
    saveGuestCart(items);
    set({ items });
  },

  // Server-synced methods (called when user IS logged in)
  fetchCart: async () => {
    set({ loading: true });
    try {
      const res = await fetch(API_URL, { credentials: 'include' });
      if (!res.ok) {
        set({ loading: false });
        return;
      }
      const data = await res.json();
      const items = (data.cart?.items || []).map(i => ({
        productId: i.productId?._id || i.productId,
        quantity: i.quantity,
        price: i.price,
        originalPrice: i.productId?.price,
        name: i.productId?.name || '',
        image: i.productId?.images?.[0] || '',
        category: i.productId?.category || '',
        stock: i.productId?.stock || 999,
        selectedDates: i.selectedDates || (i.selectedDate ? [i.selectedDate] : []),
        groupSize: i.groupSize || 1,
        vendorId: i.productId?.vendorId || ''
      }));
      set({ items, warnings: data.warnings || [] });
      if (data.warnings && data.warnings.length > 0) {
        data.warnings.forEach(w => toast.warning(w));
      }
    } catch (err) {
      console.error('Fetch cart error:', err);
    } finally {
      set({ loading: false });
    }
  },

  addItemServer: async (product, quantity = 1) => {
    set({ loading: true });
    try {
      const existing = get().items.find(i => i.productId === product._id);
      const totalRequested = (existing?.quantity || 0) + quantity;
      if (totalRequested > (product.stock || 999)) {
        toast.error(`Only ${product.stock} items available in stock`);
        set({ loading: false });
        return;
      }

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          productId: product._id, 
          quantity: (product.category === "Tour" || product.category === "Accommodation") ? 1 : quantity, 
          selectedDates: product.selectedDates,
          groupSize: product.groupSize || 1
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
      await get().fetchCart();
      toast.success('Added to cart');
    } catch (err) {
      toast.error(err.message || 'Failed to add to cart');
    } finally {
      set({ loading: false });
    }
  },

  updateQtyServer: async (productId, quantity) => {
    set({ loading: true });
    try {
      const item = get().items.find(i => i.productId === productId);
      if (item) {
        if (quantity > item.quantity && (item.category === "Tour" || item.category === "Accommodation")) {
          toast.error("Quantity for tours and accommodations cannot be increased");
          set({ loading: false });
          return;
        }
        if (quantity > (item.stock || 999)) {
          toast.error(`Only ${item.stock} items available in stock`);
          set({ loading: false });
          return;
        }
      }

      const res = await fetch(API_URL, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId, quantity }),
      });
      if (!res.ok) return;
      await get().fetchCart();
    } catch (err) {
      console.error('Update qty error:', err);
    } finally {
      set({ loading: false });
    }
  },

  removeItemServer: async (productId) => {
    set({ loading: true });
    try {
      await fetch(`${API_URL}/${productId}`, { method: 'DELETE', credentials: 'include' });
      await get().fetchCart();
    } catch (err) {
      console.error('Remove error:', err);
    } finally {
      set({ loading: false });
    }
  },

  // Merge guest cart to server on login/register
  mergeWithServer: async () => {
    const guestItems = loadGuestCart();
    if (guestItems.length > 0) {
      try {
        await fetch(`${API_URL}/merge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ items: guestItems.map(i => ({ productId: i.productId, quantity: i.quantity })) }),
        });
        localStorage.removeItem(STORAGE_KEY);
      } catch (err) {
        console.error('Merge error:', err);
      }
    }
    await get().fetchCart();
  },

  clearCart: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ items: [], warnings: [] });
  },
  clearWarnings: () => set({ warnings: [] }),
}));
