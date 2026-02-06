import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ALLOWED = new Set(["pending", "preparing", "ready", "done", "canceled"]);

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const status = body?.status;

  if (typeof status !== "string" || !ALLOWED.has(status)) {
    return NextResponse.json(
      { error: `status invalide. Valeurs: ${Array.from(ALLOWED).join(", ")}` },
      { status: 400 },
    );
  }

  const { error } = await supabaseAdmin.from("orders").update({ status }).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { data: order, error: oErr } = await supabaseAdmin
    .from("orders")
    .select("id, code, status, total_cents, created_at, customer_name, customer_phone, note")
    .eq("id", params.id)
    .single();

  if (oErr) return NextResponse.json({ error: oErr.message }, { status: 500 });

  const { data: items, error: iErr } = await supabaseAdmin
    .from("order_items")
    .select("id, name_snapshot, unit_price_cents, quantity, selected_options")
    .eq("order_id", params.id);

  if (iErr) return NextResponse.json({ error: iErr.message }, { status: 500 });

  return NextResponse.json({ order, items: items ?? [] });
}
