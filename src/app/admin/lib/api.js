"use client";
// Central API adapter. Replace these mock implementations with your real fetch/axios calls.

export function useApiClient() {
  // Example: if your APIs need auth, add token handling here.

  const mockProducts = Array.from({ length: 23 }).map((_, i) => ({
    id: `P-${1000 + i}`,
    title: `Sample Product ${i + 1}`,
    sku: `SKU${1000 + i}`,
    price: (Math.round(Math.random() * 5000) / 100).toFixed(2),
    stock: Math.floor(Math.random() * 200),
    category: ["Electronics", "Apparel", "Home"][i % 3],
    image: "",
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  }));

  const mockUsers = Array.from({ length: 12 }).map((_, i) => ({
    id: `U-${200 + i}`,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: i % 5 === 0 ? "admin" : "customer",
    joined: new Date(Date.now() - i * 86400000 * 7).toISOString(),
  }));

  const mockSales = Array.from({ length: 18 }).map((_, i) => ({
    invoice: `INV-${3000 + i}`,
    user: mockUsers[i % mockUsers.length].name,
    total: (Math.round(Math.random() * 20000) / 100).toFixed(2),
    date: new Date(Date.now() - i * 86400000).toISOString(),
  }));

  return {
    fetchProducts: async ({ page = 1, pageSize = 10, q = "" } = {}) => {
      await new Promise((r) => setTimeout(r, 120));
      const filtered = mockProducts.filter((p) =>
        p.title.toLowerCase().includes(q.toLowerCase())
      );
      const start = (page - 1) * pageSize;
      return {
        data: filtered.slice(start, start + pageSize),
        total: filtered.length,
      };
    },

    fetchProduct: async (id) => {
      await new Promise((r) => setTimeout(r, 80));
      const p = mockProducts.find((x) => x.id === id) || null;
      return { data: p };
    },

    createProduct: async (payload) => {
      console.log("createProduct", payload);
      return { ok: true, id: "P-NEW" };
    },

    updateProduct: async (id, payload) => {
      console.log("updateProduct", id, payload);
      return { ok: true };
    },

    deleteProduct: async (id) => {
      console.log("deleteProduct", id);
      return { ok: true };
    },

    fetchUsers: async () => {
      await new Promise((r) => setTimeout(r, 80));
      return { data: mockUsers };
    },
  };
}
