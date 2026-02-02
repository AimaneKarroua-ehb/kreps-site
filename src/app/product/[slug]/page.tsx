"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PRODUCTS } from "@/data/products";
import { OPTION_GROUPS } from "@/data/options";
import OptionGroup from "@/components/OptionGroup";
import { formatEUR } from "@/lib/money";
import { useCart } from "@/store/cart";

type Line = {
  productId: string;
  name: string;
  basePriceCents: number;
  selectedOptions: Record<string, string | string[]>;
  optionPriceCents: number;
  quantity: number;
};

const LINES_KEY = "kreps_builder_lines_v1";
const PRODUCT_KEY = "kreps_builder_product_v1";

function calcOptionPrice(
  optionGroupIds: string[],
  selected: Record<string, string | string[]>,
) {
  let sum = 0;

  for (const gid of optionGroupIds) {
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
}

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export default function ProductBuilderPage() {
  const router = useRouter();
  const cart = useCart();

  // ✅ Produits disponibles dans le builder
  // (assure-toi que ces slugs existent dans PRODUCTS)
  const croustyProducts = PRODUCTS.filter((p) =>
    ["crousty-poulet", "crousty-crevettes"].includes(p.slug),
  );

  // 🔥 sélection produit persistée
  const [selectedProductId, setSelectedProductId] = useState(() => {
    const saved = safeRead<string>(PRODUCT_KEY, "");
    return saved || croustyProducts[0]?.id || "";
  });

  // 🔥 lignes persistées
  const [lines, setLines] = useState<Line[]>(() =>
    safeRead<Line[]>(LINES_KEY, []),
  );

  // Persist lines + product choice
  useEffect(() => {
    safeWrite(PRODUCT_KEY, selectedProductId);
  }, [selectedProductId]);

  useEffect(() => {
    safeWrite(LINES_KEY, lines);
  }, [lines]);

  const product = croustyProducts.find((p) => p.id === selectedProductId);

  if (!product) {
    return (
      <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2a0a5e] via-black to-black px-4 py-6">
        <div className="mx-auto max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              <span className="text-lg">←</span> Retour
            </button>

            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
              KR’EPS • Composer
            </div>
          </div>

          <h1 className="mt-5 text-3xl font-extrabold text-white tracking-tight">
            Compose ta commande
          </h1>
          <p className="mt-1 text-white/60 text-sm leading-relaxed">
            Choisis ton crousty, sélectionne les étapes obligatoires, ajoute une
            ligne, puis envoie tout au panier.
          </p>

          {/* Produit */}
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-white font-semibold">Produit</div>
                <div className="text-white/50 text-xs mt-0.5">
                  Crousty Poulet / Crevettes
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-white/50">Prix unité</div>
                <div className="text-yellow-300 font-semibold">
                  {formatEUR(unitPriceCents)}
                </div>
              </div>
            </div>

            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                resetConfig();
              }}
              className="mt-3 w-full appearance-none rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-white outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/30"
            >
              {croustyProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatEUR(p.basePriceCents)}
                </option>
              ))}
            </select>

            <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3 py-3">
              <div className="text-white/70 text-sm">
                Total pour cette ligne
              </div>
              <div className="text-white font-semibold">
                {formatEUR(unitPriceCents * qty)}
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="mt-4 grid gap-3">
            {REQUIRED_GROUPS.map((gid) => (
              <OptionGroup
                key={gid}
                group={{ ...OPTION_GROUPS[gid], required: true }}
                value={selected[gid]}
                onChange={(v) => setSelected((s) => ({ ...s, [gid]: v }))}
              />
            ))}

            {/* Quantité ligne */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">Quantité</div>
                  <div className="text-xs text-white/50">Pour cette ligne</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="h-10 w-10 rounded-xl border border-white/10 bg-black/40 text-white hover:bg-black/55 active:scale-95"
                  >
                    −
                  </button>
                  <div className="min-w-10 text-center text-white font-semibold">
                    {qty}
                  </div>
                  <button
                    type="button"
                    onClick={() => setQty((q) => q + 1)}
                    className="h-10 w-10 rounded-xl border border-white/10 bg-black/40 text-white hover:bg-black/55 active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>

              {!canAddLine && (
                <div className="mt-3 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-200">
                  <span className="font-semibold">Étape manquante :</span>{" "}
                  {missingRequired
                    .map((gid) => OPTION_GROUPS[gid]?.title ?? gid)
                    .join(", ")}
                </div>
              )}

              <button
                disabled={!canAddLine}
                onClick={addLine}
                className={[
                  "mt-4 w-full rounded-2xl py-4 font-semibold transition active:scale-[0.99]",
                  canAddLine
                    ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25 hover:bg-violet-400"
                    : "bg-white/10 text-white/40 cursor-not-allowed",
                ].join(" ")}
              >
                Ajouter cette ligne • {formatEUR(unitPriceCents * qty)}
              </button>
            </div>
          </div>

          {/* Lignes ajoutées */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div className="text-white font-semibold">Ta commande</div>
              <div className="text-xs text-white/50">
                {lines.length} ligne{lines.length > 1 ? "s" : ""}
              </div>
            </div>

            {lines.length === 0 ? (
              <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-white/60">
                Aucune ligne ajoutée pour l’instant.
              </div>
            ) : (
              <div className="mt-3 grid gap-3">
                {lines.map((l, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-white font-semibold">
                          {l.name}{" "}
                          <span className="text-white/50 font-normal">
                            × {l.quantity}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-white/60">
                          {formatEUR(l.basePriceCents + l.optionPriceCents)} /
                          unité
                        </div>
                      </div>

                      <button
                        className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200 hover:bg-red-500/15"
                        onClick={() => removeLine(idx)}
                      >
                        Supprimer
                      </button>
                    </div>

                    {/* Affichage options */}
                    <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white/70">
                      <div className="flex items-center justify-between">
                        <span>{OPTION_GROUPS.size.title}</span>
                        <span className="text-white">
                          {
                            OPTION_GROUPS.size.options.find(
                              (o) =>
                                o.id === (l.selectedOptions.size as string),
                            )?.label
                          }
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <span>{OPTION_GROUPS.sauce.title}</span>
                        <span className="text-white">
                          {
                            OPTION_GROUPS.sauce.options.find(
                              (o) =>
                                o.id === (l.selectedOptions.sauce as string),
                            )?.label
                          }
                        </span>
                      </div>
                    </div>

                    {/* Qty +/- sur ligne */}
                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={() => updateLineQty(idx, l.quantity - 1)}
                        className="h-9 w-9 rounded-xl border border-white/10 bg-black/40 text-white hover:bg-black/55 active:scale-95"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-white font-semibold">
                        {l.quantity}
                      </span>
                      <button
                        onClick={() => updateLineQty(idx, l.quantity + 1)}
                        className="h-9 w-9 rounded-xl border border-white/10 bg-black/40 text-white hover:bg-black/55 active:scale-95"
                      >
                        +
                      </button>

                      <div className="ml-auto text-white font-semibold">
                        {formatEUR(
                          (l.basePriceCents + l.optionPriceCents) * l.quantity,
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total + CTA */}
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="flex items-center justify-between text-white">
                <span>Total</span>
                <span className="font-semibold text-yellow-300">
                  {formatEUR(linesTotalCents)}
                </span>
              </div>

              <button
                disabled={lines.length === 0}
                onClick={addAllToCartAndGo}
                className={[
                  "mt-4 w-full rounded-2xl py-4 font-semibold transition active:scale-[0.99]",
                  lines.length > 0
                    ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25 hover:bg-violet-400"
                    : "bg-white/10 text-white/40 cursor-not-allowed",
                ].join(" ")}
              >
                Ajouter tout au panier & Aller au panier
              </button>
            </div>
          </div>

          {/* Footer small */}
          <div className="mt-8 text-center text-xs text-white/40">
            KR’EPS • Dark kitchen • Commande via réseaux sociaux
          </div>
        </div>
      </main>
    );
  }

  // ✅ On enlève extras/suppléments : on ne garde que les groupes obligatoires
  // Ici j’assume que tes groupes s’appellent "size" et "sauce".
  // Si tes ids sont différents, dis-moi et je te l’adapte.
  const REQUIRED_GROUPS = ["size", "sauce"] as const;

  const [qty, setQty] = useState(1);
  const [selected, setSelected] = useState<Record<string, string | string[]>>({
    size: "m", // valeur par défaut
    sauce: "", // vide => oblige à choisir
  });

  const optionPriceCents = useMemo(() => {
    return calcOptionPrice(product.optionGroupIds, selected);
  }, [product.optionGroupIds, selected]);

  const unitPriceCents = product.basePriceCents + optionPriceCents;

  // ✅ Validation : toutes les étapes obligatoires doivent être choisies
  const missingRequired = REQUIRED_GROUPS.filter((gid) => {
    const v = selected[gid];
    return typeof v !== "string" || v.trim().length === 0;
  });

  const canAddLine = missingRequired.length === 0 && qty >= 1;

  function resetConfig() {
    setQty(1);
    setSelected({ size: "m", sauce: "" });
  }

  function addLine() {
    if (!canAddLine) return;

    // ✅ On supprime clairement "extras" si jamais il traîne
    const sanitized: Record<string, string | string[]> = {
      size: selected.size,
      sauce: selected.sauce,
    };

    const line: Line = {
      productId: product.id,
      name: product.name,
      basePriceCents: product.basePriceCents,
      selectedOptions: sanitized,
      optionPriceCents: calcOptionPrice(product.optionGroupIds, sanitized),
      quantity: qty,
    };

    setLines((prev) => [...prev, line]);
    resetConfig();
  }

  function removeLine(idx: number) {
    setLines((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateLineQty(idx: number, nextQty: number) {
    const q = Math.max(1, nextQty);
    setLines((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, quantity: q } : l)),
    );
  }

  const linesTotalCents = useMemo(() => {
    return lines.reduce(
      (sum, l) => sum + (l.basePriceCents + l.optionPriceCents) * l.quantity,
      0,
    );
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

  // reset builder
  setLines([]);
  safeWrite(LINES_KEY, []);

  // ✅ on va au panier, pas au ticket
  router.push("/cart");
}

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#130726] to-black px-4 py-6">
      <div className="mx-auto max-w-md">
        <button
          onClick={() => router.push("/")}
          className="text-white/70 text-sm"
        >
          ← Retour au menu
        </button>

        <h1 className="mt-3 text-3xl font-extrabold text-white">Composer</h1>

        {/* Produit */}
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/35 p-4">
          <div className="text-white font-semibold">Choisis ton crousty</div>

          <select
            value={selectedProductId}
            onChange={(e) => {
              setSelectedProductId(e.target.value);
              resetConfig();
            }}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-3 text-white outline-none"
          >
            {croustyProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {formatEUR(p.basePriceCents)}
              </option>
            ))}
          </select>

          <div className="mt-2 text-white/70 text-sm">
            Prix unité (avec options) :{" "}
            <span className="text-yellow-300 font-semibold">
              {formatEUR(unitPriceCents)}
            </span>
          </div>
        </div>

        {/* Options obligatoires uniquement */}
        <div className="mt-3 grid gap-3">
          {REQUIRED_GROUPS.map((gid) => (
            <OptionGroup
              key={gid}
              group={{
                ...OPTION_GROUPS[gid],
                required: true, // ✅ force le label "Obligatoire"
              }}
              value={selected[gid]}
              onChange={(v) => setSelected((s) => ({ ...s, [gid]: v }))}
            />
          ))}

          {/* Quantité pour cette ligne */}
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/35 p-4">
            <div className="text-white font-semibold">Quantité (ligne)</div>
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

          {/* Message si il manque une étape */}
          {!canAddLine && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
              Il manque :{" "}
              <span className="font-semibold">
                {missingRequired
                  .map((gid) => OPTION_GROUPS[gid]?.title ?? gid)
                  .join(", ")}
              </span>
            </div>
          )}

          {/* Ajouter ligne */}
          <button
            disabled={!canAddLine}
            className={[
              "w-full rounded-2xl py-4 font-semibold shadow-lg",
              canAddLine
                ? "bg-violet-500 text-white shadow-violet-500/20"
                : "bg-white/10 text-white/40 cursor-not-allowed",
            ].join(" ")}
            onClick={addLine}
          >
            Ajouter cette ligne • {formatEUR(unitPriceCents * qty)}
          </button>
        </div>

        {/* Lignes */}
        <div className="mt-6">
          <div className="text-white font-semibold">Ta commande</div>

          {lines.length === 0 ? (
            <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-white/60">
              Aucune ligne ajoutée.
            </div>
          ) : (
            <div className="mt-2 grid gap-3">
              {lines.map((l, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-white font-semibold">{l.name}</div>
                      <div className="mt-1 text-sm text-white/60">
                        {formatEUR(l.basePriceCents + l.optionPriceCents)} /
                        unité
                      </div>

                      <div className="mt-2 text-sm text-white/70">
                        • {OPTION_GROUPS.size.title}:{" "}
                        {
                          OPTION_GROUPS.size.options.find(
                            (o) => o.id === (l.selectedOptions.size as string),
                          )?.label
                        }
                        <br />• {OPTION_GROUPS.sauce.title}:{" "}
                        {
                          OPTION_GROUPS.sauce.options.find(
                            (o) => o.id === (l.selectedOptions.sauce as string),
                          )?.label
                        }
                      </div>
                    </div>

                    <button
                      className="text-sm text-red-300"
                      onClick={() => removeLine(idx)}
                    >
                      Supprimer
                    </button>
                  </div>

                  {/* Qty de la ligne (modifiable) */}
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={() => updateLineQty(idx, l.quantity - 1)}
                      className="h-9 w-9 rounded-xl border border-white/10 text-white"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-white">
                      {l.quantity}
                    </span>
                    <button
                      onClick={() => updateLineQty(idx, l.quantity + 1)}
                      className="h-9 w-9 rounded-xl border border-white/10 text-white"
                    >
                      +
                    </button>

                    <div className="ml-auto text-white font-semibold text-sm">
                      {formatEUR(
                        (l.basePriceCents + l.optionPriceCents) * l.quantity,
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Total + CTA */}
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between text-white">
              <span>Total</span>
              <span className="font-semibold text-yellow-300">
                {formatEUR(linesTotalCents)}
              </span>
            </div>

            <button
              disabled={lines.length === 0}
              onClick={addAllToCartAndGo}
              className={[
                "mt-4 w-full rounded-2xl py-4 font-semibold",
                lines.length > 0
                  ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20"
                  : "bg-white/10 text-white/40 cursor-not-allowed",
              ].join(" ")}
            >
              Ajouter tout au panier & Aller au panier
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
