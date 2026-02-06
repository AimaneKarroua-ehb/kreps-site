"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { useOrders } from "@/store/orders"; // si alias bug: "../../../store/orders"
import { buildOrder, saveLastOrder, addOrderToHistory } from "@/lib/order";
import { formatEUR } from "@/lib/money";
import type { PaymentMethod } from "@/store/orders";

type Method = PaymentMethod | "terminal" | "cash" | "payconiq";

type Draft = {
  fullName: string;
  phone: string;
  mode: "pickup" | "delivery";
  address?: { street: string; postalCode: string; city: string };
  note?: string;
  remember?: boolean;
  deliveryFeeCents?: number;
  totalCents?: number;
};

const DRAFT_KEY = "kreps_order_draft_v1";

export default function PaymentPage() {
  const router = useRouter();
  const cart = useCart();
  const orders = useOrders();

  const [method, setMethod] = useState<Method>("terminal");
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);

  // Charger le draft UNIQUEMENT côté client (sinon ça peut être null au 1er rendu)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      setDraft(raw ? (JSON.parse(raw) as Draft) : null);
    } catch {
      setDraft(null);
    } finally {
      setReady(true);
    }
  }, []);

  // Redirects de sécurité
  useEffect(() => {
    if (!ready) return;

    if (!draft) {
      router.replace("/checkout");
      return;
    }

    if (!cart.items || cart.items.length === 0) {
      router.replace("/");
    }
  }, [ready, draft, cart.items, router]);

  const subtotalCents = useMemo(() => {
    return cart.items.reduce(
      (sum, it) =>
        sum + (it.basePriceCents + it.optionPriceCents) * it.quantity,
      0,
    );
  }, [cart.items]);

  const deliveryFeeCents =
    draft?.mode === "delivery" ? (draft?.deliveryFeeCents ?? 250) : 0;

  const totalCents = subtotalCents + deliveryFeeCents;

  const canConfirm = ready && !!draft && cart.items.length > 0;

  async function confirmOrder() {
    if (!draft) return;
    if (cart.items.length === 0) return;

    // ✅ 1) créer l’ordre local (preuve client)
    const localOrder = buildOrder(
      cart.items.map((it) => ({
        productId: it.productId,
        name: it.name,
        basePriceCents: it.basePriceCents,
        optionPriceCents: it.optionPriceCents,
        quantity: it.quantity,
        selectedOptions: it.selectedOptions,
      })),
      totalCents,
    );

    // ✅ 2) Sauver preuve client (local)
    saveLastOrder(localOrder);
    addOrderToHistory(localOrder);

    // ✅ 3) Envoyer au serveur/Supabase
    const payload = {
      totalCents,
      customerName: draft?.fullName ?? null,
      customerPhone: draft?.phone ?? null,
      note: draft?.note ?? null,
      items: cart.items.map((it) => ({
        productId: it.productId,
        name: it.name,
        unitPriceCents: it.basePriceCents + it.optionPriceCents,
        quantity: it.quantity,
        selectedOptions: it.selectedOptions ?? {},
      })),
    };

    const res = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!res.ok) {
      console.error("ORDER CREATE ERROR:", data);

      if (res.status === 409) {
        alert(
          `Rupture de stock : disponible ${data?.available ?? 0}, demandé ${data?.requested ?? 0}.`,
        );
        router.replace("/cart");
        return;
      }

      alert(`Erreur API (${res.status}) : ${data?.error ?? data?.raw ?? "inconnue"}`);
      return;
    }

    // OK
    saveLastOrder({ ...localOrder, id: data.code });
    router.push("/success");

    // ✅ Nettoyer draft (et si tu veux, vider le panier dans /success)
    setTimeout(() => {
      try {
        localStorage.removeItem("kreps_order_draft_v1");
      } catch {}
    }, 0);
  }

  if (!ready) {
    return (
      <main className="min-h-screen bg-black px-4 py-6">
        <div className="mx-auto max-w-md text-white/70">Chargement...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-6">
      <div className="mx-auto max-w-md">
        <button onClick={() => router.back()} className="text-white/70 text-sm">
          ← Retour
        </button>

        <h1 className="mt-3 text-3xl font-extrabold text-white">Paiement</h1>
        <p className="mt-1 text-white/60 text-sm">
          Paiement sur place (terminal / cash / QR).
        </p>

        {/* Méthodes */}
        <div className="mt-5 grid gap-3">
          <PayMethodCard
            active={method === "terminal"}
            onClick={() => setMethod("terminal")}
            title="Terminal Bancontact (sur place)"
            sub="Tu payes au retrait par carte."
          />
          <PayMethodCard
            active={method === "payconiq"}
            onClick={() => setMethod("payconiq")}
            title="Payconiq (QR) sur place"
            sub="Tu scannes le QR au retrait."
          />
          <PayMethodCard
            active={method === "cash"}
            onClick={() => setMethod("cash")}
            title="Cash"
            sub="Paiement en espèces au retrait."
          />
        </div>

        {/* Résumé */}
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-white font-semibold">Résumé</div>

          <div className="mt-3 flex items-center justify-between text-white/80">
            <span>Sous-total</span>
            <span>{formatEUR(subtotalCents)}</span>
          </div>

          <div className="mt-2 flex items-center justify-between text-white/80">
            <span>Livraison</span>
            <span>{formatEUR(deliveryFeeCents)}</span>
          </div>

          <div className="mt-3 h-px w-full bg-white/10" />

          <div className="mt-3 flex items-center justify-between text-white">
            <span>Total</span>
            <span className="font-semibold text-yellow-300">
              {formatEUR(totalCents)}
            </span>
          </div>

          <button
            disabled={!canConfirm}
            onClick={confirmOrder}
            className={[
              "mt-4 w-full rounded-2xl py-4 font-semibold",
              canConfirm
                ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20"
                : "bg-white/10 text-white/40 cursor-not-allowed",
            ].join(" ")}
          >
            Confirmer la commande
          </button>

          {!draft && (
            <div className="mt-3 text-sm text-red-300">
              Infos manquantes. Retour au checkout.
            </div>
          )}

          {draft && cart.items.length === 0 && (
            <div className="mt-3 text-sm text-red-300">
              Ton panier est vide. Retour au menu.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function PayMethodCard({
  active,
  onClick,
  title,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full rounded-2xl border p-4 text-left transition",
        active
          ? "border-violet-400 bg-violet-500/15"
          : "border-white/10 bg-white/5 hover:bg-white/10",
      ].join(" ")}
    >
      <div className="text-white font-semibold">{title}</div>
      <div className="mt-1 text-white/60 text-sm">{sub}</div>
    </button>
  );
}
