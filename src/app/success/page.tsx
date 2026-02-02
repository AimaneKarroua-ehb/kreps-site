"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readLastOrder } from "@/lib/order";

export default function SuccessPage() {
  const [ready, setReady] = useState(false);
  const [orderCode, setOrderCode] = useState<string | null>(null);

  useEffect(() => {
    console.log("SUCCESS MOUNT");
    const order = readLastOrder();
    setOrderCode(order?.id ?? null);
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <main className="min-h-screen bg-black px-4 py-10">
        <div className="mx-auto max-w-md text-white/70">Chargement...</div>
      </main>
    );
  }

  // pas de redirect automatique (sinon flash)
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

        <div className="mt-6 flex gap-2">
          <Link
            href="/order"
            className="w-full rounded-2xl bg-violet-500 py-3 text-center font-semibold text-white"
          >
            Voir la preuve de commande
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