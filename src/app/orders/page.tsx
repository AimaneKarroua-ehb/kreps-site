"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readOrderHistory } from "@/lib/order";
import { formatEUR } from "@/lib/money";

export default function OrdersPage() {
  const [orders, setOrders] = useState(() => []);

  useEffect(() => {
    setOrders(readOrderHistory());
  }, []);

  return (
    <main className="min-h-screen bg-black px-4 py-8">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between">
          <Link href="/" className="kreps-btn-ghost">
            ← Menu
          </Link>
          <div className="kreps-badge">KR’EPS • Historique</div>
        </div>

        <h1 className="mt-4 text-2xl font-extrabold text-white">
          Historique des commandes
        </h1>

        {orders.length === 0 ? (
          <div className="mt-4 kreps-card p-5">
            <div className="text-white font-semibold">Aucune commande</div>
            <div className="mt-1 text-sm text-white/60">
              Tes commandes apparaîtront ici après paiement.
            </div>
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {orders.map((o: any) => (
              <div key={o.id} className="kreps-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-white font-semibold">{o.id}</div>
                    <div className="mt-1 text-xs text-white/50">
                      {new Date(o.createdAt).toLocaleString("fr-BE")}
                    </div>
                    <div className="mt-2 text-sm text-white/70">
                      {o.lines?.length ?? 0} article(s)
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-yellow-300 font-extrabold">
                      {formatEUR(o.totalCents)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <Link
            href="/product"
            className="block w-full rounded-2xl bg-violet-500 py-4 text-center font-semibold text-white hover:bg-violet-400"
          >
            Recommencer une commande
          </Link>
        </div>
      </div>
    </main>
  );
}