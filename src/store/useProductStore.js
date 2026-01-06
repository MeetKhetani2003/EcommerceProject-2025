// store/useProductsStore.js
import { create } from "zustand";
import toast from "react-hot-toast";

export const useProductsStore = create((set, get) => ({
  products: [],
  page: 1,
  hasMore: true,
  loading: false,

  // 🔥 NEW: active filter
  activeFilter: "All",

  // 🔥 NEW: called by FilterTabs
  setFilter: (filter) => {
    set({
      activeFilter: filter,
      products: [],
      page: 1,
      hasMore: true,
    });
  },

  fetchProducts: async () => {
    const { page, products, loading, hasMore, activeFilter } = get();
    if (loading || !hasMore) return;

    set({ loading: true });

    try {
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("limit", 12);

      // 🔥 MAP UI TABS → BACKEND FILTERS
      switch (activeFilter) {
        case "New Arrivals":
          params.set("isNewArrival", "true");
          break;

        case "Best Sellers":
          params.set("isBestseller", "true");
          break;

        case "Oversized":
          params.set("category", "Oversized");
          break;

        case "T-Shirts":
          params.set("category", "T-Shirts");
          break;

        case "Shirts":
          params.set("category", "Shirts");
          break;

        case "Denims":
          params.set("category", "Denim");
          break;

        case "Shoes":
          params.set("mainCategory", "shoes");
          break;

        case "Accessories":
          params.set("mainCategory", "accessories");
          break;

        default:
          // "All"
          break;
      }

      const res = await fetch(`/api/products?${params.toString()}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (!data?.products?.length) {
        set({ hasMore: false, loading: false });
        return;
      }

      set({
        products: [...products, ...data.products],
        page: page + 1,
        hasMore: data.hasMore !== false,
        loading: false,
      });
    } catch (err) {
      toast.error("❌ Failed loading products");
      console.log("PRODUCT STORE ERROR:", err);
      set({ loading: false });
    }
  },

  resetProducts: () =>
    set({
      products: [],
      page: 1,
      hasMore: true,
    }),
}));
