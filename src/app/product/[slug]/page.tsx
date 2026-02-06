"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { PRODUCTS } from "@/data/products";
import { OPTION_GROUPS } from "@/data/options";
import OptionGroup from "@/components/OptionGroup";
import { formatEUR } from "@/lib/money";
import { useCart } from "@/store/cart";

type Selected = Record<string, string | string[]>;

type Line = {
  productId: string;
  name: string;
  basePriceCents: number;
  selectedOptions: Selected;
  optionPriceCents: number;
  quantity: number;
};

type BuilderState = {
  lines: Line[];
};

const BUILDER_KEY = "kreps_builder_v3";

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function calcOptionPrice(optionGroupIds: string[], selected: Selected) {
  let sum = 0;
  for (const gid of optionGroupIds) {
    const group = OPTION_GROUPS[gid];
    const v = selected[gid];
    if (!group) continue;

    if (group.type === "single" && typeof v === "string") {
      const opt = group.options.find((o) => o.id === v);
      sum += opt?.priceDeltaCents ?? 0;
    }

    if (group.type === "multiple" && Array.isArray(v)) {
      for (const id of v) {
        const opt = group.options.find((o) => o.id === id);
        sum += opt?.priceDeltaCents ?? 0;
      }
    }
  }
  return sum;
}

function buildInitialSelected(optionGroupIds: string[]): Selected {
  const init: Selected = {};
  for (const gid of optionGroupIds) {
    const g = OPTION_GROUPS[gid];
    if (!g) continue;

    if (g.type === "multiple") {
      init[gid] = [];
      continue;
    }

    if (gid === "size") init[gid] = g.options[0]?.id ?? "";
    else init[gid] = ""; // protein/base/sauce => choix conscient
  }
  return init;
}

function isMissingRequired(optionGroupIds: string[], selected: Selected): string[] {
  const missing: string[] = [];
  for (const gid of optionGroupIds) {
    const g = OPTION_GROUPS[gid];
    if (!g?.required) continue;

    const v = selected[gid];
    if (g.type === "single") {
      if (typeof v !== "string" || v.trim().length === 0) missing.push(gid);
      continue;
    }
    if (g.type === "multiple") {
      if (!Array.isArray(v) || v.length === 0) missing.push(gid);
    }
  }
  return missing;
}

function optionLabel(gid: string, value: string | string[] | undefined): string {
  const g = OPTION_GROUPS[gid];
  if (!g) return "";
  if (g.type === "single") {
    if (typeof value !== "string") return "";
    return g.options.find((o) => o.id === value)?.label ?? "";
  }
  if (!Array.isArray(value) || value.length === 0) return "—";
  return value
    .map((id) => g.options.find((o) => o.id === id)?.label)
    .filter(Boolean)
    .join(", ");
}

/** ✅ Choix crousty (protein) en options SANS prix */
function ProteinPicker({
  selected,
  onChange,
}: {
  selected: Selected;
  onChange: (nextId: string) => void;
}) {
  const g = OPTION_GROUPS.protein;
  if (!g || g.type !== "single") return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div className="text-white font-semibold">{g.title}</div>
        <div className="text-xs text-white/50">Obligatoire</div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {g.options.map((opt) => {
          const isActive = selected.protein === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={[
                "rounded-xl border px-3 py-4 transition active:scale-[0.99]",
                isActive
                  ? "border-violet-400/60 bg-violet-500/20"
                  : "border-white/10 bg-black/30 hover:bg-black/40",
              ].join(" ")}
            >
              <div className="text-white font-semibold text-center">{opt.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** ✅ Base en horizontal (alignée comme Taille) */
function BasePicker({
  selected,
  onChange,
}: {
  selected: Selected;
  onChange: (nextBaseId: string) => void;
}) {
  const g = OPTION_GROUPS.base;
  if (!g || g.type !== "single") return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div className="text-white font-semibold">{g.title}</div>
        <div className="text-xs text-white/50">Obligatoire</div>
      </div>

      {/* ✅ horizontal */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {g.options.map((opt) => {
          const isActive = selected.base === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={[
                "rounded-xl border px-3 py-4 transition active:scale-[0.99]",
                isActive
                  ? "border-violet-400/60 bg-violet-500/20"
                  : "border-white/10 bg-black/30 hover:bg-black/40",
              ].join(" ")}
            >
              <div className="text-white font-semibold text-center">{opt.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** ✅ Taille horizontal avec PRIX TOTAL */
function SizePicker({
  productBasePriceCents,
  optionGroupIds,
  selected,
  onChange,
}: {
  productBasePriceCents: number;
  optionGroupIds: string[];
  selected: Selected;
  onChange: (nextSizeId: string) => void;
}) {
  const g = OPTION_GROUPS.size;
  if (!g || g.type !== "single") return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div className="text-white font-semibold">{g.title}</div>
        <div className="text-xs text-white/50">Obligatoire</div>
      </div>

      <div className="mt-3 flex gap-2">
        {g.options.map((opt) => {
          const isActive = selected.size === opt.id;

          const tmp: Selected = { ...selected, size: opt.id };
          const totalUnit = productBasePriceCents + calcOptionPrice(optionGroupIds, tmp);

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={[
                "flex-1 rounded-2xl border px-3 py-3 text-left transition active:scale-[0.99]",
                isActive
                  ? "border-violet-400/60 bg-violet-500/20"
                  : "border-white/10 bg-black/30 hover:bg-black/40",
              ].join(" ")}
            >
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold">{opt.label}</span>
                <span className="text-white/50 font-light">{formatEUR(totalUnit)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ProductBuilderPage() {
  const router = useRouter();
  const cart = useCart();

  const [stockQty, setStockQty] = useState<number | null>(null);
  const [stockLoading, setStockLoading] = useState(true);

  const product = useMemo(() => {
    return PRODUCTS.find((p) => p.slug === "crousty") ?? PRODUCTS[0];
  }, []);


  useEffect(() => {
    let cancelled = false;
    async function loadStock() {
      setStockLoading(true);
      try {
        const res = await fetch(`/api/stock/${product.slug}`, { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && typeof data?.quantity === "number") setStockQty(data.quantity);
        else setStockQty(0);
      } catch {
        if (!cancelled) setStockQty(0);
      } finally {
        if (!cancelled) setStockLoading(false);
      }
    }
    loadStock();
    return () => {
      cancelled = true;
    };
  }, [product.slug]);


  const [lines, setLines] = useState<Line[]>(() => {
    const saved = safeRead<BuilderState>(BUILDER_KEY, { lines: [] });
    return saved.lines;
  });

  useEffect(() => {
    safeWrite<BuilderState>(BUILDER_KEY, { lines });
  }, [lines]);

  const optionGroupIds = product?.optionGroupIds ?? [];
  const [qty, setQty] = useState(1);
  const [selected, setSelected] = useState<Selected>(() => buildInitialSelected(optionGroupIds));

  useEffect(() => {
    setQty(1);
    setSelected(buildInitialSelected(optionGroupIds));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  const optionPriceCents = useMemo(() => {
    if (!product) return 0;
    return calcOptionPrice(optionGroupIds, selected);
  }, [product, optionGroupIds, selected]);

  const unitPriceCents = (product?.basePriceCents ?? 0) + optionPriceCents;

  const missingRequired = useMemo(() => {
    if (!product) return [];
    return isMissingRequired(optionGroupIds, selected);
  }, [product, optionGroupIds, selected]);

    const canAddLine = !!product && missingRequired.length === 0 && qty >= 1;

  const stockKnown = typeof stockQty === "number";
  const soldOut = stockKnown && stockQty <= 0;
  const canAddLineWithStock =
    canAddLine && !soldOut && (!stockKnown || linesTotalQty + qty <= (stockQty as number));

  function addLine() {
    if (!product || !canAddLine) return;

    const line: Line = {
      productId: product.id,
      name: product.name,
      basePriceCents: product.basePriceCents,
      selectedOptions: selected,
      optionPriceCents: calcOptionPrice(optionGroupIds, selected),
      quantity: qty,
    };

    setLines((prev) => [...prev, line]);
    setQty(1);
    setSelected(buildInitialSelected(optionGroupIds));
  }

  function removeLine(idx: number) {
    setLines((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateLineQty(idx: number, nextQty: number) {
    const q = Math.max(1, nextQty);
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, quantity: q } : l)));
  }

  const linesTotalCents = useMemo(() => {
    return lines.reduce((sum, l) => sum + (l.basePriceCents + l.optionPriceCents) * l.quantity, 0);
  }, [lines]);


  const linesTotalQty = useMemo(() => {
    return lines.reduce((sum, l) => sum + l.quantity, 0);
  }, [lines]);


  function addAllToCartAndGo() {
    if (lines.length === 0) return;

    for (const l of lines) {
      cart.addItem({
        productId: l.productId,
        name: l.name,
        basePriceCents: l.basePriceCents,
        quantity: l.quantity,
        selectedOptions: l.selectedOptions,
        optionPriceCents: l.optionPriceCents,
      });
    }

    setLines([]);
    safeWrite<BuilderState>(BUILDER_KEY, { lines: [] });
    router.push("/cart");
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-[#130726] to-black px-4 py-8">
        <div className="mx-auto max-w-md text-white">Aucun produit configuré.</div>
      </main>
    );
  }

  // ✅ on retire base/size/protein pour les afficher nous-mêmes
  const otherGroups = optionGroupIds.filter((gid) => !["protein", "base", "size"].includes(gid));

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#130726] to-black px-4 py-6">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            <span className="text-lg">←</span> Menu
          </button>

          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
            KR’EPS • Composer
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
          <div className="relative h-44 w-full bg-black/40">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 480px"
            />
          </div>

          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-2xl font-extrabold text-white tracking-tight">
                  {product.name}
                </div>
                <div className="mt-1 text-sm text-white/60">
                  Choisis ton crousty, ta base, ta taille, ta sauce, puis ajoute la ligne.
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-white/50">Prix unité</div>
                <div className="font-semibold text-yellow-300">{formatEUR(unitPriceCents)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Protein */}
        <div className="mt-4">
          <ProteinPicker
            selected={selected}
            onChange={(id) => setSelected((s) => ({ ...s, protein: id }))}
          />
        </div>

        {/* ✅ Base AVANT Taille + horizontal */}
        <div className="mt-3">
          <BasePicker selected={selected} onChange={(id) => setSelected((s) => ({ ...s, base: id }))} />
        </div>

        {/* Taille */}
        <div className="mt-3">
          <SizePicker
            productBasePriceCents={product.basePriceCents}
            optionGroupIds={optionGroupIds}
            selected={selected}
            onChange={(id) => setSelected((s) => ({ ...s, size: id }))}
          />
        </div>

        {/* Autres options (ex: sauce) */}
        <div className="mt-3 grid gap-3">
          {otherGroups.map((gid) => (
            <OptionGroup
              key={gid}
              group={OPTION_GROUPS[gid]}
              value={selected[gid]}
              onChange={(v) => setSelected((s) => ({ ...s, [gid]: v }))}
            />
          ))}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-semibold">Quantité</div>
                <div className="text-xs text-white/50">Pour cette article</div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="h-10 w-10 rounded-xl border border-white/10 bg-black/40 text-white hover:bg-black/55 active:scale-95"
                >
                  −
                </button>
                <div className="min-w-10 text-center text-white font-semibold">{qty}</div>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="h-10 w-10 rounded-xl border border-white/10 bg-black/40 text-white hover:bg-black/55 active:scale-95"
                >
                  +
                </button>
              </div>
            </div>

            {missingRequired.length > 0 && (
              <div className="mt-3 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-200">
                <span className="font-semibold">Étape manquante :</span>{" "}
                {missingRequired.map((gid) => OPTION_GROUPS[gid]?.title ?? gid).join(", ")}
              </div>
            )}


            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div className="text-white font-semibold">Stock</div>
                {stockLoading ? (
                  <div className="text-white/50 text-sm">...</div>
                ) : soldOut ? (
                  <div className="text-red-200 font-semibold">Rupture</div>
                ) : (
                  <div className="text-white/70 text-sm">{stockQty} dispo</div>
                )}
              </div>

              {soldOut && (
                <div className="mt-2 text-sm text-white/60">
                  Ce produit est temporairement indisponible.
                </div>
              )}

              {!soldOut && stockKnown && linesTotalQty + qty > (stockQty as number) && (
                <div className="mt-2 text-sm text-red-200">
                  Cette quantité dépasse le stock disponible.
                </div>
              )}
            </div>

            <button
              disabled={!canAddLineWithStock}
              onClick={addLine}
              className={[
                "mt-4 w-full rounded-2xl py-4 font-semibold transition active:scale-[0.99]",
                canAddLineWithStock
                  ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25 hover:bg-violet-400"
                  : "bg-white/10 text-white/40 cursor-not-allowed",
              ].join(" ")}
            >
              Ajouter au panier • {formatEUR(unitPriceCents * qty)}
            </button>
          </div>
        </div>

        {/* Lignes */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div className="text-white font-semibold">Ta commande</div>
            <div className="text-xs text-white/50">
              {lines.length} ligne{lines.length > 1 ? "s" : ""}
            </div>
          </div>

          {lines.length === 0 ? (
            <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-white/60">
              Aucun article dans le panier
            </div>
          ) : (
            <div className="mt-3 grid gap-3">
              {lines.map((l, idx) => (
                <div key={`${l.productId}-${idx}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-white font-semibold">
                        {l.name} <span className="text-white/50 font-normal">× {l.quantity}</span>
                      </div>
                      <div className="mt-1 text-sm text-white/60">
                        {formatEUR(l.basePriceCents + l.optionPriceCents)} / unité
                      </div>
                    </div>

                    <button
                      className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200 hover:bg-red-500/15"
                      onClick={() => removeLine(idx)}
                    >
                      Supprimer
                    </button>
                  </div>

                  <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white/70">
                    {Object.keys(l.selectedOptions).map((gid) => (
                      <div key={gid} className="flex items-center justify-between gap-3">
                        <span className="truncate">{OPTION_GROUPS[gid]?.title ?? gid}</span>
                        <span className="text-white text-right">{optionLabel(gid, l.selectedOptions[gid])}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => updateLineQty(idx, l.quantity - 1)}
                      className="h-9 w-9 rounded-xl border border-white/10 bg-black/40 text-white hover:bg-black/55 active:scale-95"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-white font-semibold">{l.quantity}</span>
                    <button
                      onClick={() => updateLineQty(idx, l.quantity + 1)}
                      className="h-9 w-9 rounded-xl border border-white/10 bg-black/40 text-white hover:bg-black/55 active:scale-95"
                    >
                      +
                    </button>

                    <div className="ml-auto text-white font-semibold">
                      {formatEUR((l.basePriceCents + l.optionPriceCents) * l.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between text-white">
              <span>Total</span>
              <span className="font-semibold text-yellow-300">{formatEUR(linesTotalCents)}</span>
            </div>

            <button
              disabled={lines.length === 0 || soldOut || (stockKnown && linesTotalQty > (stockQty as number))}
              onClick={addAllToCartAndGo}
              className={[
                "mt-4 w-full rounded-2xl py-4 font-semibold transition active:scale-[0.99]",
                lines.length > 0 && !soldOut && (!stockKnown || linesTotalQty <= (stockQty as number))
                  ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25 hover:bg-violet-400"
                  : "bg-white/10 text-white/40 cursor-not-allowed",
              ].join(" ")}
            >
              Ajouter tout au panier & Aller au panier
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-white/40">
          KR’EPS • Dark kitchen • Commande via réseaux sociaux
        </div>
      </div>
    </main>
  );
}