import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));

  const patch: any = {};
  if (typeof body.name === "string") patch.name = body.name;
  if (typeof body.base_price_cents === "number") patch.base_price_cents = body.base_price_cents;
  if (typeof body.image === "string") patch.image = body.image;
  if (typeof body.is_active === "boolean") patch.is_active = body.is_active;

  const { error } = await supabaseAdmin.from("products").update(patch).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}