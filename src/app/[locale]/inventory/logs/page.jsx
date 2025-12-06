"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/lib/ProtectedRoute";
import { useLocale } from "next-intl";

export default function LogsPage() {
  const locale = useLocale();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/logs`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const j = await res.json();
        setLogs(j.logs || []);
      } catch (err) {
        setError(err.message || "Failed to load logs");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["company_admin"]}>
      <div className="min-h-screen bg-white p-8">
        <h1 className="text-2xl font-semibold mb-4">Logs & Audits</h1>

        {loading && <p>Loading logs…</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="space-y-4">
            {logs.length === 0 && <p>No logs available.</p>}
            {logs.map((l) => (
              <div key={l.id} className="p-4 border rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-gray-600">
                    {new Date(l.ts).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">ID: {l.id}</div>
                </div>
                <div className="font-medium">{l.action}</div>
                <div className="text-sm text-gray-600">
                  Actor: {l.actor} — Target: {l.target}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
