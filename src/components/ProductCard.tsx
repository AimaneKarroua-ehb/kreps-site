import Link from "next/link";
import { formatEUR } from "@/lib/money";
import type { Product } from "@/data/products";

export default function ProductCard({ p }: { p: Product }) {
  return (
    <Link
      href={`/product/${p.slug}`}
      className="block rounded-2xl border border-white/10 bg-black/40 p-4 hover:bg-black/55 transition"
    >
      <div className="text-xs text-yellow-300/90">{p.tags?.[0] ?? ""}</div>
      <div className="mt-1 text-lg font-semibold text-white">{p.name}</div>
      <div className="mt-1 text-white/70">{formatEUR(p.basePriceCents)}</div>
      <div className="mt-3 text-sm text-white/60">Configurer →</div>
    </Link>
  );
}