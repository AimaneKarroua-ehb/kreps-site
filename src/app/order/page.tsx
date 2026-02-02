"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { readLastOrder } from "@/lib/order";
import { OPTION_GROUPS } from "@/data/options";
import { formatEUR } from "@/lib/money";

export default function OrderPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  const order = useMemo(() => (mounted ? readLastOrder() : null), [mounted]);

  if (!mounted) return null;

  if (!order) {
    return (
      <main className="min-h-screen bg-black px-4 py-6">
        <div className="mx-auto max-w-md kreps-card p-5">
          <div className="text-white font-semibold">Aucune commande trouvée</div>
          <div className="mt-1 text-sm text-white/60">
            Retourne au menu et crée une commande.
          </div>

          <button onClick={() => router.push("/")} className="mt-4 kreps-btn-ghost w-full">
            Retour au menu
          </button>
        </div>
      </main>
    );
  }

  const date = new Date(order.createdAt).toLocaleString();

  const labelFor = (groupId: string, value: string | string[]) => {
    const g = (OPTION_GROUPS as any)[groupId];
    if (!g) return null;

    const ids = Array.isArray(value) ? value : [value];
    const labels = ids
      .map((id) => g.options.find((o: any) => o.id === id)?.label)
      .filter(Boolean);

    if (!labels.length) return null;
    return `${g.title}: ${labels.join(", ")}`;
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2a0a5e] via-black to-black px-4 py-6">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between">
          <button onClick={() => router.push("/")} className="kreps-btn-ghost">
            ← Menu
          </button>
          <div className="kreps-badge">KR’EPS • Preuve</div>
        </div>

        <div className="mt-4 kreps-card p-5">
          <div className="text-center">
            <div className="text-xl font-extrabold text-white">KR’EPS</div>
            <div className="mt-1 text-sm text-white/70">Preuve de commande</div>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Commande</span>
              <span className="text-white font-semibold">{order.id}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-white/60">Date</span>
              <span className="text-white">{date}</span>
            </div>
          </div>

          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="text-white font-semibold">Détails</div>

            <div className="mt-3 grid gap-3">
              {order.lines.map((l, idx) => (
                <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-white font-semibold">
                        {l.name} <span className="text-white/50 font-normal">× {l.quantity}</span>
                      </div>
                      <div className="mt-1 text-sm text-white/60">
                        {formatEUR(l.basePriceCents + l.optionPriceCents)} / unité
                      </div>

                      <div className="mt-2 text-xs text-white/70">
                        {Object.entries(l.selectedOptions).map(([gid, val]) => {
                          const txt = labelFor(gid, val);
                          return txt ? <div key={gid}>• {txt}</div> : null;
                        })}
                      </div>
                    </div>

                    <div className="text-white font-semibold">
                      {formatEUR((l.basePriceCents + l.optionPriceCents) * l.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Total</span>
                <span className="text-yellow-300 font-extrabold text-lg">
                  {formatEUR(order.totalCents)}
                </span>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              <button
                onClick={() => window.print()}
                className="kreps-btn-primary w-full"
              >
                Imprimer / Montrer à la caisse
              </button>

              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(order.id);
                }}
                className="kreps-btn-ghost w-full"
              >
                Copier le code commande
              </button>
            </div>

            <div className="mt-4 text-center text-xs text-white/40">
              Présente ce ticket à la caisse pour confirmer ta commande.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}