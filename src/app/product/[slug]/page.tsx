"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PRODUCTS } from "@/data/products";
import { OPTION_GROUPS } from "@/data/options";
import OptionGroup from "@/components/OptionGroup";
import { formatEUR } from "@/lib/money";
import { useCart } from "@/store/cart";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const cart = useCart();

  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product) return <div className="p-6 text-white">Produit introuvable.</div>;

  const [qty, setQty] = useState(1);
  const [selected, setSelected] = useState<Record<string, string | string[]>>({
    size: "m",
    sauce: "mix",
    extras: [],
  });

  const optionPriceCents = useMemo(() => {
    let sum = 0;
    for (const gid of product.optionGroupIds) {
      const g = OPTION_GROUPS[gid];
      const v = selected[gid];
      if (!g) continue;

      if (g.type === "single" && typeof v === "string") {
        const opt = g.options.find((o) => o.id === v);
        sum += opt?.priceDeltaCents ?? 0;
      }

      if (g.type === "multiple" && Array.isArray(v)) {
        for (const id of v) {
          const opt = g.options.find((o) => o.id === id);
          sum += opt?.priceDeltaCents ?? 0;
        }
      }
    }
    return sum;
  }, [product.optionGroupIds, selected]);

  const totalOne = product.basePriceCents + optionPriceCents;

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#130726] to-black px-4 py-6">
      <div className="mx-auto max-w-md">
        <button onClick={() => router.back()} className="text-white/70 text-sm">
          ← Retour
        </button>

        <h1 className="mt-3 text-3xl font-extrabold text-white">{product.name}</h1>
        <div className="mt-1 text-white/70">
          Base: {formatEUR(product.basePriceCents)} • Total:{" "}
          <span className="text-yellow-300 font-semibold">{formatEUR(totalOne)}</span>
        </div>

        <div className="mt-5 grid gap-3">
          {product.optionGroupIds.map((gid) => (
            <OptionGroup
              key={gid}
              group={OPTION_GROUPS[gid]}
              value={selected[gid]}
              onChange={(v) => setSelected((s) => ({ ...s, [gid]: v }))}
            />
          ))}

          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/35 p-4">
            <div className="text-white font-semibold">Quantité</div>
            <div className="flex items-center gap-2">
              <button
                className="h-10 w-10 rounded-xl border border-white/10 text-white"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                –
              </button>
              <div className="w-8 text-center text-white">{qty}</div>
              <button
                className="h-10 w-10 rounded-xl border border-white/10 text-white"
                onClick={() => setQty((q) => q + 1)}
              >
                +
              </button>
            </div>
          </div>

          <button
            className="mt-1 w-full rounded-2xl bg-violet-500 py-4 text-white font-semibold shadow-lg shadow-violet-500/20"
            onClick={() => {
              // validation min
              if (!selected.size || !selected.sauce) return;

              cart.addItem({
                productId: product.id,
                name: product.name,
                basePriceCents: product.basePriceCents,
                quantity: qty,
                selectedOptions: selected,
                optionPriceCents,
              });

              router.push("/cart");
            }}
          >
            Ajouter au panier • {formatEUR(totalOne * qty)}
          </button>
        </div>
      </div>
    </main>
  );
}