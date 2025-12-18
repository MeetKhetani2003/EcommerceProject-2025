"use client";
import React, { useEffect, useState } from "react";
import Card from "./components/Card";
import { useApiClient } from "./lib/api";

export default function DashboardPage() {
  const api = useApiClient();
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);

  useEffect(() => {
    (async () => {
      const u = await api.fetchUsers();
      const p = await api.fetchProducts({ page: 1, pageSize: 6 });
      const s = await api.fetchSales({ page: 1, pageSize: 6 });
      setUsers(u.data || []);
      setProducts(p.data || []);
      setSales(s.data || []);
    })();
  }, []);

  const totalSales = sales
    .reduce((acc, x) => acc + Number(x.total || 0), 0)
    .toFixed(2);

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of users, products and sales
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card title="Users" value={users.length} hint="Registered customers" />
        <Card title="Products" value={products.length} hint="Active products" />
        <Card
          title="Sales"
          value={`₹ ${totalSales}`}
          hint="Recent sales sample"
        />
        <Card title="This month" value={`—`} hint="Monthly total placeholder" />
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-md shadow-sm">
          <h3 className="font-semibold mb-3">Latest Products</h3>
          <ul className="space-y-2">
            {products.map((p) => (
              <li key={p.id} className="text-sm">
                {p.title}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-4 rounded-md shadow-sm">
          <h3 className="font-semibold mb-3">Recent Sales</h3>
          <ul className="space-y-2">
            {sales.map((s) => (
              <li key={s.invoice} className="text-sm">
                {s.invoice} — ₹{s.total}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
