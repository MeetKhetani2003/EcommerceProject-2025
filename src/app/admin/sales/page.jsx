"use client";
import React, { useEffect, useState } from "react";
import Table from "../components/Table";
import { useApiClient } from "../lib/api";

export default function SalesPage() {
  const api = useApiClient();
  const [sales, setSales] = useState([]);

  useEffect(() => {
    (async () => {
      const r = await api.fetchSales();
      setSales(r.data || []);
    })();
  }, []);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Sales / Invoices</h2>
      <div className="bg-white p-4 rounded-md shadow-sm">
        <Table
          columns={["Invoice", "User", "Total", "Date"]}
          data={sales.map((s) => [
            s.invoice,
            s.user,
            `₹ ${s.total}`,
            new Date(s.date).toLocaleDateString(),
          ])}
          renderRow={(row) => (
            <tr key={row[0]} className="hover:bg-gray-50">
              <td className="p-2">{row[0]}</td>
              <td className="p-2">{row[1]}</td>
              <td className="p-2">{row[2]}</td>
              <td className="p-2">{row[3]}</td>
            </tr>
          )}
        />
      </div>
    </div>
  );
}
