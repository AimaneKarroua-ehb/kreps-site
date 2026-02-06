"use client";

import { useEffect, useState } from "react";

type OrderRow = {
  id: string;
  code: string;
  status: string;
  total_cents: number;
  created_at: string;
};

function formatEUR(cents: number) {
  const v = cents / 100;
  return v.toLocaleString("fr-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: v % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/orders");
    const data = await res.json();
    setOrders(data ?? []);
    setLoading(false);
  }

  async function setStatus(id: string, status: string) {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-screen bg-black px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="text-white text-2xl font-extrabold">Admin • Commandes</div>
        <div className="mt-1 text-white/60 text-sm">
          Clique sur un statut pour mettre à jour.
        </div>

        {loading ? (
          <div className="mt-6 text-white/60">Chargement...</div>
        ) : orders.length === 0 ? (
          <div className="mt-6 text-white/60">Aucune commande.</div>
        ) : (
          <div className="mt-6 grid gap-3">
            {orders.map((o) => (
              <div key={o.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-white font-semibold">{o.code}</div>
                    <div className="text-xs text-white/50 mt-1">
                      {new Date(o.created_at).toLocaleString("fr-BE")}
                    </div>
                    <div className="mt-2 text-sm text-white/70">
                      Statut: <span className="text-white">{o.status}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-yellow-300 font-extrabold">
                      {formatEUR(o.total_cents)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => setStatus(o.id, "pending")}
                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white hover:bg-black/40"
                  >
                    En attente
                  </button>
                  <button
                    onClick={() => setStatus(o.id, "preparing")}
                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white hover:bg-black/40"
                  >
                    Préparer
                  </button>
                  <button
                    onClick={() => setStatus(o.id, "ready")}
                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white hover:bg-black/40"
                  >
                    Prêt
                  </button>
                  <button
                    onClick={() => setStatus(o.id, "done")}
                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white hover:bg-black/40"
                  >
                    Terminé
                  </button>
                  <button
                    onClick={() => setStatus(o.id, "canceled")}
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200 hover:bg-red-500/15"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}