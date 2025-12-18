"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Table from "../components/Table";
import { useApiClient } from "../lib/api";

export default function UsersPage() {
  const api = useApiClient();
  const router = useRouter();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    (async () => {
      const r = await api.fetchUsers();
      setUsers(r.data || []);
    })();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Users</h2>
      </div>

      <div className="bg-white p-4 rounded-md shadow-sm">
        <Table
          columns={["ID", "Name", "Email", "Role", "Joined", "Actions"]}
          data={users.map((u) => [
            u.id,
            u.name,
            u.email,
            u.role,
            new Date(u.joined).toLocaleDateString(),
            u,
          ])}
          renderRow={(row) => (
            <tr key={row[0]} className="hover:bg-gray-50">
              <td className="p-2">{row[0]}</td>
              <td className="p-2">{row[1]}</td>
              <td className="p-2">{row[2]}</td>
              <td className="p-2">{row[3]}</td>
              <td className="p-2">{row[4]}</td>
              <td className="p-2">
                <button
                  onClick={() => router.push(`/admin/users/${row[0]}`)}
                  className="px-2 py-1 border rounded text-sm"
                >
                  Open
                </button>
              </td>
            </tr>
          )}
        />
      </div>
    </div>
  );
}
