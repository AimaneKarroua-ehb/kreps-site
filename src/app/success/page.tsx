"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { readLastOrder } from "@/lib/order";
import { useCart } from "@/store/cart";

export default function SuccessPage() {
  const cart = useCart();

  const didClear = useRef(false);
  const [ready, setReady] = useState(false);
  const [orderCode, setOrderCode] = useState<string | null>(null);

  useEffect(() => {
    console.log("SUCCESS MOUNT");

    // ✅ Lire la preuve AVANT tout (important)
    const order = readLastOrder();
    setOrderCode(order?.id ?? null);
    setReady(true);

    // ✅ Clear 1 seule fois (React Strict Mode peut doubler useEffect en dev)
    if (didClear.current) return;
    didClear.current = true;

    // ✅ Vider panier maintenant que /success est affiché
    cart.clear();

    // ✅ Reset builder (pour éviter que les anciennes lignes reviennent)
    try {
      localStorage.removeItem("kreps_builder_v3");
    } catch {}

    // ✅ Nettoyer draft si tu en as un
    try {
      localStorage.removeItem("kreps_order_draft_v1");
    } catch {}
  }, [cart]);

  if (!ready) {
    return (
      <main className="min-h-screen bg-black px-4 py-10">
        <div className="mx-auto max-w-md text-white/70">Chargement...</div>
      </main>
    );
  }

  if (!orderCode) {
    return (
      <main className="min-h-screen bg-black px-4 py-10">
        <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-white font-semibold">Aucune commande trouvée</div>
          <div className="mt-2 text-white/60 text-sm">
            Retourne au menu et passe une commande.
          </div>

          <Link
            href="/"
            className="mt-4 block w-full rounded-2xl bg-violet-500 py-3 text-center font-semibold text-white"
          >
            Revenir au menu
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-10">
      <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="text-2xl font-extrabold text-white">Commande reçue ✅</div>
        <p className="mt-2 text-white/70">Merci ! On prépare ta commande.</p>

        <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3 text-white">
          <div className="text-xs text-white/60">Numéro commande</div>
          <div className="text-lg font-semibold">{orderCode}</div>
        </div>

        <div className="mt-6 grid gap-2">
          <Link
            href="/order"
            className="w-full rounded-2xl bg-violet-500 py-3 text-center font-semibold text-white"
          >
            Voir la preuve de commande
          </Link>

          <Link
            href="/orders"
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 text-center font-semibold text-white"
          >
            Historique
          </Link>

          <Link
            href="/"
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 text-center font-semibold text-white"
          >
            Revenir au menu
          </Link>
        </div>
      </div>
    </main>
  );
}