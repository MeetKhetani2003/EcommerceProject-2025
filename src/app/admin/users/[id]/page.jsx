"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApiClient } from "../lib/api";

export default function UserDetail({ params }) {
  const id = params.id;
  const api = useApiClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const r = await api.fetchUser(id);
      setUser(r.data || null);
    })();
  }, [id]);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">User — {user.name}</h2>
      <div className="bg-white p-4 rounded-md shadow-sm">
        <dl>
          <dt className="font-medium">Email</dt>
          <dd className="mb-2">{user.email}</dd>
          <dt className="font-medium">Role</dt>
          <dd className="mb-2">{user.role}</dd>
          <dt className="font-medium">Joined</dt>
          <dd>{new Date(user.joined).toLocaleString()}</dd>
        </dl>
      </div>
    </div>
  );
}
