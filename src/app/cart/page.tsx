"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { formatEUR } from "@/lib/money";

export default function CartPage() {
  const router = useRouter();
  const cart = useCart();

  return (
    <main className="min-h-screen bg-black px-4 py-6">
      <div className="mx-auto max-w-md">
        <button
          onClick={() => router.push("/")}
          className="text-white/70 text-sm"
        >
          ← Retour au menu
        </button>

        <h1 className="mt-3 text-3xl font-extrabold text-white">
          Panier
        </h1>

        {cart.items.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
            <p className="text-white/70">
              Ton panier est vide.
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 w-full rounded-2xl bg-violet-500 py-3 text-white font-semibold"
            >
              Retour au menu
            </button>
          </div>
        ) : (
          <>
            {/* LISTE DES ITEMS */}
            <div className="mt-6 grid gap-3">
              {cart.items.map((it) => (
                <div
                  key={it.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-white font-semibold">
                        {it.name}
                      </div>
                      <div className="mt-1 text-sm text-white/60">
                        {formatEUR(it.basePriceCents + it.optionPriceCents)} • x{it.quantity}
                      </div>
                    </div>

                    <button
                      onClick={() => cart.removeItem(it.id)}
                      className="text-sm text-red-300"
                    >
                      Supprimer
                    </button>
                  </div>

                  {/* QUANTITÉ */}
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={() => cart.setQuantity(it.id, it.quantity - 1)}
                      className="h-9 w-9 rounded-xl border border-white/10 text-white"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-white">
                      {it.quantity}
                    </span>
                    <button
                      onClick={() => cart.setQuantity(it.id, it.quantity + 1)}
                      className="h-9 w-9 rounded-xl border border-white/10 text-white"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* TOTAL + CTA */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between text-white">
                <span>Total</span>
                <span className="font-semibold text-yellow-300">
                  {formatEUR(cart.totalCents)}
                </span>
              </div>

              <button
                onClick={() => router.push("/checkout")}
                className="mt-4 w-full rounded-2xl bg-violet-500 py-4 text-white font-semibold shadow-lg shadow-violet-500/20"
              >
                Continuer la commande
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}