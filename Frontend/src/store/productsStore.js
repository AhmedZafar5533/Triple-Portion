import { create } from 'zustand';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/products`;

export const useProductStore = create((set, get) => ({
  displayProducts: [],
  trendingProducts: [],
  newArrivals: [],
  topPicks: [],
  categories: [],
  loading: false,
  currentProduct: null,
  productLoading: false,
  productError: null,
  fetched: false,
  selectedCategory: null,
  searchQuery: '',
  fetchDisplayProducts: async (filters = {}) => {
    set({ loading: true });
    try {
      const { category, search } = filters;
      let url = `${API_URL}/display`;
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      set({ 
        displayProducts: data.products || [], 
        trendingProducts: data.trending || [],
        newArrivals: data.newArrivals || [],
        topPicks: data.topPicks || [],
        categories: data.categories || [],
        selectedCategory: category || null,
        searchQuery: search || '',
        loading: false,
        fetched: true
      });
    } catch (err) {
      console.error('Failed to fetch display products:', err);
      set({ loading: false });
    }
  },
  fetchProduct: async (id) => {
    set({ productLoading: true, productError: null, currentProduct: null });
    try {
      const res = await fetch(`${API_URL}/${id}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Product not found');
      }
      const data = await res.json();
      set({ currentProduct: data.product, productLoading: false });
    } catch (err) {
      console.error('Failed to fetch product:', err);
      set({ productError: err.message, productLoading: false });
    }
  },
  clearProduct: () => set({ currentProduct: null, productError: null }),
}));
