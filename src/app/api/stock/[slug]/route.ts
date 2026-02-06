import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const { data: product, error: pErr } = await supabaseAdmin
    .from("products")
    .select("id")
    .eq("slug", params.slug)
    .single();

  if (pErr || !product) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  }

  const { data: s, error: sErr } = await supabaseAdmin
    .from("stock")
    .select("quantity")
    .eq("product_id", product.id)
    .single();

  if (sErr) {
    return NextResponse.json(
      { quantity: 0 },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    { quantity: s?.quantity ?? 0 },
    { headers: { "Cache-Control": "no-store" } },
  );
}
