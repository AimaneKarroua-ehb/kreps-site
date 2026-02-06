import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function makeCode() {
  const rnd = crypto.randomUUID().slice(0, 8).toUpperCase();
  return `KREPS-${rnd}`;
}

type IncomingItem = {
  productId: string;
  name: string;
  basePriceCents?: number;
  optionPriceCents?: number;
  unitPriceCents?: number;
  quantity: number;
  selectedOptions?: any;
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const totalCents = body?.totalCents;
    const items = body?.items as IncomingItem[] | undefined;

    if (typeof totalCents !== "number" || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Bad body: totalCents(number) + items(array) requis" },
        { status: 400 },
      );
    }

    // ✅ 1) regrouper quantités par productId
    const reqQtyByProduct = new Map<string, number>();
    for (const it of items) {
      if (!it || typeof it.productId !== "string" || it.productId.trim().length === 0) {
        return NextResponse.json({ error: "items[].productId requis" }, { status: 400 });
      }
      const q = Number(it.quantity ?? 1);
      if (!Number.isFinite(q) || q < 1) {
        return NextResponse.json({ error: "items[].quantity doit être >= 1" }, { status: 400 });
      }
      reqQtyByProduct.set(it.productId, (reqQtyByProduct.get(it.productId) ?? 0) + q);
    }

    // ✅ 2) vérifier stock AVANT création commande
    const stockNowByProduct = new Map<string, number>();
    for (const [productId, need] of reqQtyByProduct.entries()) {
      const { data, error } = await supabaseAdmin
        .from("stock")
        .select("quantity")
        .eq("product_id", productId)
        .single();

      // si pas de ligne stock => 0
      const qty = error ? 0 : (data?.quantity ?? 0);
      stockNowByProduct.set(productId, qty);

      if (qty < need) {
        return NextResponse.json(
          {
            error: "Rupture de stock",
            productId,
            available: qty,
            requested: need,
          },
          { status: 409 },
        );
      }
    }

    // ✅ 3) créer commande
    const code = makeCode();

    const { data: order, error: oErr } = await supabaseAdmin
      .from("orders")
      .insert({
        code,
        status: "pending",
        total_cents: totalCents,
        customer_name: body?.customerName ?? null,
        customer_phone: body?.customerPhone ?? null,
        note: body?.note ?? null,
      })
      .select("id, code")
      .single();

    if (oErr) return NextResponse.json({ error: oErr.message }, { status: 500 });

    // ✅ 4) créer items (snapshots)
    const rows = items.map((it: any) => ({
      order_id: order.id,
      name_snapshot: String(it.name ?? ""),
      unit_price_cents: Number(
        (it.unitPriceCents ?? 0) ||
          ((it.basePriceCents ?? 0) + (it.optionPriceCents ?? 0)),
      ),
      quantity: Number(it.quantity ?? 1),
      selected_options: it.selectedOptions ?? {},
    }));

    const { error: iErr } = await supabaseAdmin.from("order_items").insert(rows);
    if (iErr) {
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      return NextResponse.json({ error: iErr.message }, { status: 500 });
    }

    // ✅ 5) décrémenter stock (table séparée)
    for (const [productId, need] of reqQtyByProduct.entries()) {
      const now = stockNowByProduct.get(productId) ?? 0;
      const next = Math.max(0, now - need);

      const { error: sErr } = await supabaseAdmin
        .from("stock")
        .update({ quantity: next })
        .eq("product_id", productId);

      if (sErr) {
        // cleanup best effort
        await supabaseAdmin.from("order_items").delete().eq("order_id", order.id);
        await supabaseAdmin.from("orders").delete().eq("id", order.id);
        return NextResponse.json({ error: sErr.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true, orderId: order.id, code: order.code });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
