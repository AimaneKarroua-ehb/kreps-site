"use client";

import { useMemo, useState } from "react";
import { useOrders, type OrderStatus } from "@/store/orders";
import { formatEUR } from "@/lib/money";
import { useRouter } from "next/navigation";

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "Reçue",
  preparing: "En préparation",
  ready: "Prête",
  done: "Terminée",
  canceled: "Annulée",
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const { orders, updateStatus, togglePaid, removeOrder } = useOrders();
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  const list = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  return (
    <main className="min-h-screen bg-black px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-white">Admin • Commandes</h1>
          <button
            onClick={() => router.push("/admin/kitchen")}
            className="rounded-xl bg-violet-500 px-4 py-2 text-white font-semibold"
          >
            Écran cuisine
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(["all", "new", "preparing", "ready", "done", "canceled"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={[
                "rounded-xl border px-3 py-2 text-sm",
                filter === s
                  ? "border-violet-400 bg-violet-500/15 text-white"
                  : "border-white/10 bg-white/5 text-white/70",
              ].join(" ")}
            >
              {s === "all" ? "Toutes" : STATUS_LABEL[s]}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-3">
          {list.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
              Aucune commande pour l’instant.
            </div>
          ) : (
            list.map((o) => (
              <div
                key={o.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-white font-semibold">
                      #{o.id.slice(-6).toUpperCase()} • {o.draft.fullName}
                    </div>
                    <div className="mt-1 text-sm text-white/60">
                      {new Date(o.createdAt).toLocaleString()} •{" "}
                      {o.draft.mode === "delivery" ? "Livraison" : "À emporter"} •{" "}
                      {formatEUR(o.totalCents)}
                    </div>
                    <div className="mt-2 text-sm text-white/70">
                      Statut : <span className="text-white">{STATUS_LABEL[o.status]}</span>
                      {" • "}
                      Paiement :{" "}
                      <span className={o.paymentPaid ? "text-green-300" : "text-yellow-300"}>
                        {o.paymentPaid ? "Payé" : "Non payé"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeOrder(o.id)}
                    className="text-sm text-red-300"
                  >
                    Supprimer
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(["new", "preparing", "ready", "done", "canceled"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(o.id, s)}
                      className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/80 hover:bg-black/40"
                    >
                      {STATUS_LABEL[s]}
                    </button>
                  ))}

                  <button
                    onClick={() => togglePaid(o.id)}
                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/80 hover:bg-black/40"
                  >
                    {o.paymentPaid ? "Marquer non payé" : "Marquer payé"}
                  </button>
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3">
                  <div className="text-xs text-white/60">Détails</div>
                  <ul className="mt-2 text-sm text-white/80 space-y-1">
                    {o.items.map((it) => (
                      <li key={it.id}>
                        • {it.name} x{it.quantity}
                      </li>
                    ))}
                  </ul>
                  {o.draft.note && (
                    <div className="mt-2 text-sm text-white/70">Note: {o.draft.note}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}