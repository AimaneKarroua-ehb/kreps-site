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
        <h1 className="text-3xl font-extrabold text-white">Panier</h1>

        {cart.items.length === 0 ? (
          <div className="mt-6 text-white/70">
            Ton panier est vide.{" "}
            <button className="text-violet-300" onClick={() => router.push("/")}>
              Retour au menu
            </button>
          </div>
        ) : (
          <>
            <div className="mt-5 grid gap-3">
              {cart.items.map((it) => (
                <div
                  key={it.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-white font-semibold">{it.name}</div>
                      <div className="text-white/60 text-sm">
                        {formatEUR(it.basePriceCents + it.optionPriceCents)} • x{it.quantity}
                      </div>
                    </div>
                    <button
                      className="text-white/60 text-sm"
                      onClick={() => cart.removeItem(it.id)}
                    >
                      Supprimer
                    </button>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      className="h-9 w-9 rounded-xl border border-white/10 text-white"
                      onClick={() => cart.setQuantity(it.id, it.quantity - 1)}
                    >
                      –
                    </button>
                    <div className="w-8 text-center text-white">{it.quantity}</div>
                    <button
                      className="h-9 w-9 rounded-xl border border-white/10 text-white"
                      onClick={() => cart.setQuantity(it.id, it.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between text-white">
                <span>Total</span>
                <span className="font-semibold text-yellow-300">
                  {formatEUR(cart.totalCents)}
                </span>
              </div>
              <button
                className="mt-4 w-full rounded-2xl bg-violet-500 py-4 text-white font-semibold"
                onClick={() => alert("Prochaine étape: checkout (infos client + paiement)")}
              >
                Continuer
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}