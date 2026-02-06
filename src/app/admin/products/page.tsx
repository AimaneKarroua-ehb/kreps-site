"use client";

import { useEffect, useState } from "react";

type Row = {
  id: string;
  slug: string;
  name: string;
  base_price_cents: number;
  image: string | null;
  is_active: boolean;
  stock_qty: number;
};

function eur(cents: number) {
  const v = cents / 100;
  return v.toLocaleString("fr-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: v % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

export default function AdminProductsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  // mini formulaire "ajouter"
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newPrice, setNewPrice] = useState("7.00");
  const [newImage, setNewImage] = useState("/products/crousty.jpg");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    if (res.ok) setRows(data);
    else alert(data?.error ?? "Erreur chargement produits");
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function patchProduct(id: string, patch: Partial<Row>) {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) alert(data?.error ?? "Erreur update produit");
    await load();
  }

  async function patchStock(productId: string, qty: number) {
    const res = await fetch(`/api/admin/stock/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: qty }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) alert(data?.error ?? "Erreur update stock");
    await load();
  }

  async function createProduct() {
    const base_price_cents = Math.round(parseFloat(newPrice.replace(",", ".")) * 100);

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        slug: newSlug,
        base_price_cents,
        image: newImage,
        is_active: true,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data?.error ?? "Erreur création produit");
      return;
    }

    setNewName("");
    setNewSlug("");
    setNewPrice("7.00");
    await load();
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="text-white text-2xl font-extrabold">Admin • Produits & Stock</div>
        <div className="mt-1 text-white/60 text-sm">
          Modifie le stock, active/désactive un produit, change le prix.
        </div>

        {/* Ajouter produit */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-white font-semibold">Ajouter un produit</div>

          <div className="mt-3 grid gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nom (ex: Crousty)"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-white outline-none"
            />
            <input
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              placeholder="Slug (ex: crousty)"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-white outline-none"
            />
            <input
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="Prix (ex: 7.00)"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-white outline-none"
            />
            <input
              value={newImage}
              onChange={(e) => setNewImage(e.target.value)}
              placeholder="Image (ex: /products/crousty.jpg)"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-white outline-none"
            />

            <button
              onClick={createProduct}
              disabled={!newName || !newSlug}
              className={[
                "mt-1 w-full rounded-2xl py-3 font-semibold",
                newName && newSlug
                  ? "bg-violet-500 text-white hover:bg-violet-400"
                  : "bg-white/10 text-white/40 cursor-not-allowed",
              ].join(" ")}
            >
              Créer
            </button>
          </div>
        </div>

        {/* Liste produits */}
        <div className="mt-6">
          {loading ? (
            <div className="text-white/60">Chargement...</div>
          ) : rows.length === 0 ? (
            <div className="text-white/60">Aucun produit.</div>
          ) : (
            <div className="grid gap-3">
              {rows.map((p) => (
                <div key={p.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-white font-semibold">{p.name}</div>
                      <div className="mt-1 text-xs text-white/50">slug: {p.slug}</div>
                      <div className="mt-2 text-sm text-white/70">
                        Prix: <span className="text-white">{eur(p.base_price_cents)}</span>
                      </div>
                      <div className="mt-1 text-sm text-white/70">
                        Stock: <span className="text-white">{p.stock_qty}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-white/50">Actif</div>
                      <button
                        onClick={() => patchProduct(p.id, { is_active: !p.is_active })}
                        className={[
                          "mt-1 rounded-xl px-3 py-2 text-sm border",
                          p.is_active
                            ? "border-green-500/30 bg-green-500/10 text-green-200"
                            : "border-white/10 bg-black/30 text-white/70",
                        ].join(" ")}
                      >
                        {p.is_active ? "Oui" : "Non"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    <button
                      onClick={() => patchStock(p.id, Math.max(0, p.stock_qty - 1))}
                      className="rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-white hover:bg-black/40"
                    >
                      Stock -1
                    </button>
                    <button
                      onClick={() => patchStock(p.id, p.stock_qty + 1)}
                      className="rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-white hover:bg-black/40"
                    >
                      Stock +1
                    </button>
                    <button
                      onClick={() => patchStock(p.id, 0)}
                      className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-3 text-red-200 hover:bg-red-500/15"
                    >
                      Rupture (0)
                    </button>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <button
                      onClick={() => {
                        const v = prompt("Nouveau prix en € (ex: 7.50) :", (p.base_price_cents / 100).toFixed(2));
                        if (!v) return;
                        const cents = Math.round(parseFloat(v.replace(",", ".")) * 100);
                        patchProduct(p.id, { base_price_cents: cents } as any);
                      }}
                      className="rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-white hover:bg-black/40"
                    >
                      Modifier prix
                    </button>

                    <button
                      onClick={() => {
                        const v = prompt("Nouvelle image (ex: /products/x.jpg) :", p.image ?? "");
                        if (v === null) return;
                        patchProduct(p.id, { image: v } as any);
                      }}
                      className="rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-white hover:bg-black/40"
                    >
                      Modifier image
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-xs text-white/40">
          KR’EPS • Admin
        </div>
      </div>
    </main>
  );
}