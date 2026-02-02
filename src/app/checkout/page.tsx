"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { formatEUR } from "@/lib/money";

type Draft = {
  fullName: string;
  phone: string;
  mode: "pickup" | "delivery";
  address?: { street: string; postalCode: string; city: string };
  note?: string;
  remember?: boolean;
  deliveryFeeCents?: number;
};

const DRAFT_KEY = "kreps_order_draft_v1";

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();

  // redirect si panier vide
  useEffect(() => {
    if (!cart.items || cart.items.length === 0) router.replace("/");
  }, [cart.items, router]);

  // charger un draft existant (si l'utilisateur revient)
  const saved = useMemo<Draft | null>(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      return raw ? (JSON.parse(raw) as Draft) : null;
    } catch {
      return null;
    }
  }, []);

  const [mode, setMode] = useState<Draft["mode"]>(saved?.mode ?? "pickup");
  const [fullName, setFullName] = useState(saved?.fullName ?? "");
  const [phone, setPhone] = useState(saved?.phone ?? "");
  const [street, setStreet] = useState(saved?.address?.street ?? "");
  const [postalCode, setPostalCode] = useState(saved?.address?.postalCode ?? "");
  const [city, setCity] = useState(saved?.address?.city ?? "");
  const [note, setNote] = useState(saved?.note ?? "");
  const [remember, setRemember] = useState(!!saved?.remember);

  // frais livraison par défaut (tu peux changer)
  const deliveryFeeCents = mode === "delivery" ? 250 : 0;

  const subtotalCents = useMemo(() => {
    return cart.items.reduce(
      (sum, it) => sum + (it.basePriceCents + it.optionPriceCents) * it.quantity,
      0
    );
  }, [cart.items]);

  const totalCents = subtotalCents + deliveryFeeCents;

  const canContinue = useMemo(() => {
    if (cart.items.length === 0) return false;
    if (fullName.trim().length < 2) return false;
    if (phone.trim().length < 6) return false;
    if (mode === "delivery") {
      if (street.trim().length < 4) return false;
      if (postalCode.trim().length < 3) return false;
      if (city.trim().length < 2) return false;
    }
    return true;
  }, [cart.items.length, city, fullName, mode, phone, postalCode, street]);

  function goToPayment() {
    if (!canContinue) return;

    const draft: Draft = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      mode,
      note: note.trim() || undefined,
      remember,
      deliveryFeeCents,
      ...(mode === "delivery"
        ? {
            address: {
              street: street.trim(),
              postalCode: postalCode.trim(),
              city: city.trim(),
            },
          }
        : {}),
    };

    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {}

    console.log("REDIRECT TO /payment");
    router.push("/payment");
  }

  return (
    <main className="min-h-screen bg-black px-4 py-6">
      <div className="mx-auto max-w-md">
        <button onClick={() => router.back()} className="text-white/70 text-sm">
          ← Retour
        </button>

        <h1 className="mt-3 text-3xl font-extrabold text-white">Finaliser</h1>
        <p className="mt-1 text-white/60 text-sm">Tes infos + retrait/livraison.</p>

        {/* Mode */}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode("pickup")}
            className={[
              "rounded-2xl border p-4 text-left transition",
              mode === "pickup"
                ? "border-violet-400 bg-violet-500/15"
                : "border-white/10 bg-white/5 hover:bg-white/10",
            ].join(" ")}
          >
            <div className="text-white font-semibold">Retrait</div>
            <div className="mt-1 text-white/60 text-sm">À récupérer sur place.</div>
          </button>

          <button
            type="button"
            onClick={() => setMode("delivery")}
            className={[
              "rounded-2xl border p-4 text-left transition",
              mode === "delivery"
                ? "border-violet-400 bg-violet-500/15"
                : "border-white/10 bg-white/5 hover:bg-white/10",
            ].join(" ")}
          >
            <div className="text-white font-semibold">Livraison</div>
            <div className="mt-1 text-white/60 text-sm">À ton adresse.</div>
          </button>
        </div>

        {/* Infos */}
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-white font-semibold">Informations</div>

          <div className="mt-3 grid gap-2">
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nom & prénom"
              className="kreps-input"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Téléphone"
              className="kreps-input"
            />
          </div>

          {mode === "delivery" && (
            <div className="mt-3 grid gap-2">
              <input
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Rue + numéro"
                className="kreps-input"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="Code postal"
                  className="kreps-input"
                />
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ville"
                  className="kreps-input"
                />
              </div>
            </div>
          )}

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optionnel)"
            className="kreps-input mt-3 min-h-[96px]"
          />

          <label className="mt-3 flex items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Se souvenir de mes infos
          </label>
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
            disabled={!canContinue}
            onClick={goToPayment}
            className={[
              "mt-4 w-full rounded-2xl py-4 font-semibold",
              canContinue
                ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20"
                : "bg-white/10 text-white/40 cursor-not-allowed",
            ].join(" ")}
          >
            Continuer vers paiement
          </button>

          {!canContinue && (
            <div className="mt-2 text-xs text-white/50">
              Remplis nom + téléphone{mode === "delivery" ? " + adresse" : ""}.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
