"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { useOrders } from "@/store/orders"; // si alias bug: "../../../store/orders"
import { formatEUR } from "@/lib/money";
import { buildOrder, saveLastOrder } from "@/lib/order";

type Method = "terminal" | "cash" | "payconiq";

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

  // 1) Charger le draft (infos checkout)
  const draft = useMemo<Draft | null>(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      return raw ? (JSON.parse(raw) as Draft) : null;
    } catch {
      return null;
    }
  }, []);

  // 2) Si pas de draft ou panier vide => redirige vers checkout/menu
  useEffect(() => {
    // attend une frame pour éviter un flash
    setReady(true);

    if (!draft) {
      router.replace("/checkout");
      return;
    }

    if (!cart.items || cart.items.length === 0) {
      router.replace("/");
      return;
    }
  }, [draft, cart.items, router]);

  // Totaux
  const subtotalCents = useMemo(() => {
    return cart.items.reduce(
      (sum, it) => sum + (it.basePriceCents + it.optionPriceCents) * it.quantity,
      0
    );
  }, [cart.items]);

  const deliveryFeeCents =
    draft?.mode === "delivery" ? draft?.deliveryFeeCents ?? 250 : 0;

  const totalCents = subtotalCents + deliveryFeeCents;

  const canConfirm = !!draft && cart.items.length > 0;

  function confirmOrder() {
  if (!draft) return;
  if (cart.items.length === 0) return;

  // 1) Création dans ton store orders (interne)
  const orderId = orders.addOrder({
    draft: {
      ...draft,
      deliveryFeeCents,
      totalCents,
    },
    items: cart.items,
    paymentMethod: method,
  });

  // 2) ✅ Preuve de commande (ticket client) — seulement ici, après paiement
  const order = buildOrder(
    cart.items.map((it) => ({
      productId: it.productId,
      name: it.name,
      basePriceCents: it.basePriceCents,
      optionPriceCents: it.optionPriceCents,
      quantity: it.quantity,
      selectedOptions: it.selectedOptions,
    })),
    totalCents
  );

  saveLastOrder(order);

  // (optionnel) garder aussi l’id simple si tu veux
  localStorage.setItem("kreps_last_order_id_v1", order.id);

  // 3) Nettoyage
  cart.clear();
  // localStorage.removeItem(DRAFT_KEY);

  // 4) Page succès
  router.push("/success");
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
            <span className="font-semibold text-yellow-300">{formatEUR(totalCents)}</span>
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