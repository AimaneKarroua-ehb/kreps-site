import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("id, slug, name, base_price_cents, image, is_active, stock(quantity)");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows =
    (data ?? []).map((p: any) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      base_price_cents: p.base_price_cents,
      image: p.image,
      is_active: p.is_active,
      stock_qty: Array.isArray(p.stock)
        ? (p.stock[0]?.quantity ?? 0)
        : (p.stock?.quantity ?? 0),
    })) ?? [];

  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  if (typeof body?.name !== "string" || typeof body?.slug !== "string") {
    return NextResponse.json({ error: "name + slug requis" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("products")
    .insert({
      name: body.name,
      slug: body.slug,
      base_price_cents: body.base_price_cents ?? 0,
      image: body.image ?? null,
      is_active: true,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabaseAdmin.from("stock").upsert({ product_id: data.id, quantity: 0 });

  return NextResponse.json({ ok: true });
}
