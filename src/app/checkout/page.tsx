"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { formatEUR } from "@/lib/money";

type OrderMode = "pickup" | "delivery";

type CheckoutForm = {
  fullName: string;
  phone: string;
  mode: OrderMode;
  address: {
    street: string;
    postalCode: string;
    city: string;
  };
  note: string;
  remember: boolean;
};

const KEY = "kreps_checkout_v1";

function loadSaved(): Partial<CheckoutForm> | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveLocal(data: CheckoutForm) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {}
}

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();

  const saved = useMemo(() => loadSaved(), []);
  const [form, setForm] = useState<CheckoutForm>({
    fullName: saved?.fullName ?? "",
    phone: saved?.phone ?? "",
    mode: (saved?.mode as OrderMode) ?? "pickup",
    address: {
      street: saved?.address?.street ?? "",
      postalCode: saved?.address?.postalCode ?? "",
      city: saved?.address?.city ?? "",
    },
    note: saved?.note ?? "",
    remember: saved?.remember ?? true,
  });

  const deliveryFeeCents = form.mode === "delivery" ? 250 : 0; // ajuste si tu veux
  const totalCents = cart.totalCents + deliveryFeeCents;

  const canContinue =
    cart.items.length > 0 &&
    form.fullName.trim().length >= 2 &&
    form.phone.trim().length >= 6 &&
    (form.mode === "pickup" ||
      (form.address.street.trim() &&
        form.address.postalCode.trim() &&
        form.address.city.trim()));

  function update<K extends keyof CheckoutForm>(key: K, value: CheckoutForm[K]) {
    const next = { ...form, [key]: value };
    setForm(next);
    if (next.remember) saveLocal(next);
  }

  function updateAddress<K extends keyof CheckoutForm["address"]>(
    key: K,
    value: CheckoutForm["address"][K]
  ) {
    const next = { ...form, address: { ...form.address, [key]: value } };
    setForm(next);
    if (next.remember) saveLocal(next);
  }

  return (
    <main className="min-h-screen bg-black px-4 py-6">
      <div className="mx-auto max-w-md">
        <button onClick={() => router.back()} className="text-white/70 text-sm">
          ← Retour
        </button>

        <h1 className="mt-3 text-3xl font-extrabold text-white">Finaliser</h1>
        <p className="mt-1 text-white/60 text-sm">
          Infos rapides pour préparer ta commande.
        </p>

        {/* MODE */}
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-white font-semibold">Mode</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => update("mode", "pickup")}
              className={[
                "rounded-xl border px-3 py-3",
                form.mode === "pickup"
                  ? "border-violet-400 bg-violet-500/15 text-white"
                  : "border-white/10 bg-black/30 text-white/80",
              ].join(" ")}
            >
              À emporter
            </button>
            <button
              type="button"
              onClick={() => update("mode", "delivery")}
              className={[
                "rounded-xl border px-3 py-3",
                form.mode === "delivery"
                  ? "border-violet-400 bg-violet-500/15 text-white"
                  : "border-white/10 bg-black/30 text-white/80",
              ].join(" ")}
            >
              Livraison
            </button>
          </div>
        </div>

        {/* INFOS */}
        <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-white font-semibold">Tes infos</div>

          <label className="mt-3 block">
            <span className="text-white/70 text-sm">Nom</span>
            <input
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-white outline-none"
              placeholder="Ex: Aiman"
            />
          </label>

          <label className="mt-3 block">
            <span className="text-white/70 text-sm">Téléphone</span>
            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-white outline-none"
              placeholder="Ex: 04xx xx xx xx"
              inputMode="tel"
            />
          </label>

          {form.mode === "delivery" && (
            <div className="mt-4">
              <div className="text-white font-semibold">Adresse</div>

              <label className="mt-3 block">
                <span className="text-white/70 text-sm">Rue + numéro</span>
                <input
                  value={form.address.street}
                  onChange={(e) => updateAddress("street", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-white outline-none"
                  placeholder="Ex: Rue de Bruxelles 12"
                />
              </label>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="text-white/70 text-sm">Code postal</span>
                  <input
                    value={form.address.postalCode}
                    onChange={(e) => updateAddress("postalCode", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-white outline-none"
                    placeholder="1000"
                    inputMode="numeric"
                  />
                </label>

                <label className="block">
                  <span className="text-white/70 text-sm">Ville</span>
                  <input
                    value={form.address.city}
                    onChange={(e) => updateAddress("city", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-white outline-none"
                    placeholder="Bruxelles"
                  />
                </label>
              </div>

              <div className="mt-3 text-white/60 text-sm">
                Frais livraison :{" "}
                <span className="text-yellow-300 font-semibold">
                  {formatEUR(deliveryFeeCents)}
                </span>
              </div>
            </div>
          )}

          <label className="mt-4 block">
            <span className="text-white/70 text-sm">Note (optionnel)</span>
            <input
              value={form.note}
              onChange={(e) => update("note", e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-white outline-none"
              placeholder="Ex: sans oignons, sonner 2x..."
            />
          </label>

          <label className="mt-4 flex items-center gap-2 text-white/70 text-sm">
            <input
              type="checkbox"
              checked={form.remember}
              onChange={(e) => {
                const next = { ...form, remember: e.target.checked };
                setForm(next);
                if (e.target.checked) saveLocal(next);
                else localStorage.removeItem(KEY);
              }}
            />
            Se souvenir de mes infos sur cet appareil
          </label>
        </div>

        {/* TOTAL + CTA */}
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between text-white">
            <span>Total</span>
            <span className="font-semibold text-yellow-300">{formatEUR(totalCents)}</span>
          </div>

          <button
            disabled={!canContinue}
            onClick={() => {
              // On stocke le checkout en local pour l'étape paiement
              const payload = { ...form, deliveryFeeCents, totalCents };
              localStorage.setItem("kreps_order_draft_v1", JSON.stringify(payload));
              router.push("/payment");
            }}
            className={[
              "mt-4 w-full rounded-2xl py-4 font-semibold",
              canContinue
                ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20"
                : "bg-white/10 text-white/40 cursor-not-allowed",
            ].join(" ")}
          >
            Continuer vers le paiement
          </button>

          {cart.items.length === 0 && (
            <div className="mt-3 text-sm text-red-300">
              Ton panier est vide. Ajoute un produit d’abord.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}