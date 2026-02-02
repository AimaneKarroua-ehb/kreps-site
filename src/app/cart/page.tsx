"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useCart } from "@/store/cart";
import { formatEUR } from "@/lib/money";

export default function CartPage() {
  const router = useRouter();
  const cart = useCart();

  const subtotalCents = useMemo(() => cart.totalCents, [cart.totalCents]);

  return (
    <main className="min-h-screen bg-black px-4 py-6">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between">
          <button onClick={() => router.push("/")} className="kreps-btn-ghost">
            ← Menu
          </button>
          <div className="kreps-badge">KR’EPS • Panier</div>
        </div>

        <h1 className="mt-4 text-2xl font-extrabold text-white">Ton panier</h1>

        {cart.items.length === 0 ? (
          <div className="mt-4 kreps-card p-5">
            <div className="text-white font-semibold">Panier vide</div>
            <div className="mt-1 text-sm text-white/60">
              Ajoute des produits depuis le menu.
            </div>
            <button onClick={() => router.push("/")} className="mt-4 kreps-btn-primary w-full">
              Voir le menu
            </button>
          </div>
        ) : (
          <>
            <div className="mt-4 grid gap-3">
              {cart.items.map((it) => (
                <div key={it.id} className="kreps-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-white font-semibold">{it.name}</div>
                      <div className="mt-1 text-sm text-white/60">
                        {formatEUR(it.basePriceCents + it.optionPriceCents)} / unité
                      </div>
                      <div className="mt-2 text-xs text-white/50">Quantité: {it.quantity}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-white font-semibold">
                        {formatEUR((it.basePriceCents + it.optionPriceCents) * it.quantity)}
                      </div>
                      <button
                        onClick={() => cart.removeItem(it.id)}
                        className="mt-2 text-xs text-white/60 hover:text-white"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Total</span>
                <span className="text-yellow-300 font-extrabold text-lg">
                  {formatEUR(subtotalCents)}
                </span>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              <button
                onClick={() => router.push("/checkout")}
                className="bg-violet-500 hover:bg-violet-400 transition text-white py-4 rounded-2xl"
              >
                Finaliser
              </button>
              <button onClick={() => cart.clear()} className="kreps-btn-ghost w-full">
                Vider le panier
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
