import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PATCH(
  req: Request,
  { params }: { params: { productId: string } }
) {
  const body = await req.json().catch(() => ({}));
  const qty = body?.quantity;

  if (typeof qty !== "number") {
    return NextResponse.json({ error: "quantity(number) requis" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("stock")
    .upsert({ product_id: params.productId, quantity: qty });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
