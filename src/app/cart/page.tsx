"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useCart } from "@/store/cart";
import { formatEUR } from "@/lib/money";
import { PRODUCTS } from "@/data/products";
import { OPTION_GROUPS } from "@/data/options";

function renderOptions(selectedOptions?: Record<string, string | string[]>) {
  if (!selectedOptions) return null;
  const entries = Object.entries(selectedOptions).filter(([_, v]) => {
    if (Array.isArray(v)) return v.length > 0;
    return typeof v === "string" && v.trim().length > 0;
  });
  if (entries.length === 0) return null;

  return (
    <div className="mt-2 space-y-1">
      {entries.map(([gid, v]) => {
        const g = (OPTION_GROUPS as any)[gid];
        if (!g) return null;

        let label = "—";
        if (g.type === "single" && typeof v === "string") {
          label = g.options.find((o: any) => o.id === v)?.label ?? v;
        } else if (g.type === "multiple" && Array.isArray(v)) {
          label =
            v
              .map((id) => g.options.find((o: any) => o.id === id)?.label ?? id)
              .join(", ") || "—";
        }

        return (
          <div key={gid} className="text-xs text-white/50 flex items-center justify-between gap-3">
            <span className="truncate">{g.title ?? gid}</span>
            <span className="text-white/70 text-right">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
  const cart = useCart();

  const subtotalCents = useMemo(() => cart.totalCents, [cart.totalCents]);

  // ✅ Add-ons depuis PRODUCTS
  const drinkProducts = useMemo(
    () => PRODUCTS.filter((p) => p.slug?.startsWith("drink-")),
    [],
  );
  const dessertProducts = useMemo(
    () => PRODUCTS.filter((p) => p.slug?.startsWith("dessert-")),
    [],
  );

  function addAddon(p: any) {
    cart.addItem({
      productId: p.id,
      name: p.name,
      basePriceCents: p.basePriceCents,
      optionPriceCents: 0,
      quantity: 1,
      selectedOptions: {},
    });
  }

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
            <button
              onClick={() => router.push("/")}
              className="mt-4 kreps-btn-primary w-full"
            >
              Voir le menu
            </button>
          </div>
        ) : (
          <>
            {/* Items du panier */}
            <div className="mt-4 grid gap-3">
              {cart.items.map((it) => (
                <div key={it.id} className="kreps-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-white font-semibold">{it.name}</div>

                      <div className="mt-1 text-sm text-white/60">
                        {formatEUR(it.basePriceCents + it.optionPriceCents)} / unité
                      </div>

                      {/* ✅ options (protein/size/sauce...) */}
                      {renderOptions((it as any).selectedOptions)}

                      <div className="mt-2 text-xs text-white/50">
                        Quantité: {it.quantity}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
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

            {/* ✅ Ajouts: Boissons & Desserts */}
            <div className="mt-6 grid gap-4">
              {(drinkProducts.length > 0 || dessertProducts.length > 0) && (
                <div className="text-white font-semibold">Ajouts</div>
              )}

              {drinkProducts.length > 0 && (
                <div className="kreps-card p-4">
                  <div className="text-white font-semibold">Boissons</div>
                  <div className="mt-3 grid gap-2">
                    {drinkProducts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => addAddon(p)}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-left hover:bg-black/40"
                      >
                        <span className="text-white/85 font-semibold">{p.name}</span>
                        <span className="text-yellow-300 font-semibold">
                          {formatEUR(p.basePriceCents)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {dessertProducts.length > 0 && (
                <div className="kreps-card p-4">
                  <div className="text-white font-semibold">Desserts</div>
                  <div className="mt-3 grid gap-2">
                    {dessertProducts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => addAddon(p)}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-left hover:bg-black/40"
                      >
                        <span className="text-white/85 font-semibold">{p.name}</span>
                        <span className="text-yellow-300 font-semibold">
                          {formatEUR(p.basePriceCents)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Total</span>
                <span className="text-yellow-300 font-extrabold text-lg">
                  {formatEUR(subtotalCents)}
                </span>
              </div>
            </div>

            {/* CTA */}
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