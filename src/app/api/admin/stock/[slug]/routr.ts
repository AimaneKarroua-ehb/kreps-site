import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  // 1) trouver le produit via slug
  const { data: product, error: pErr } = await supabaseAdmin
    .from("products")
    .select("id")
    .eq("slug", params.slug)
    .single();

  if (pErr || !product) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  }

  // 2) lire stock
  const { data: s, error: sErr } = await supabaseAdmin
    .from("stock")
    .select("quantity")
    .eq("product_id", product.id)
    .single();

  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });

  return NextResponse.json({ quantity: s?.quantity ?? 0 });
}
