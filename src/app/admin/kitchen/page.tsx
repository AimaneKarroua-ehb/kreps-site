"use client";

import { useOrders, type Order } from "@/store/orders";
import { formatEUR } from "@/lib/money";
import { OPTION_GROUPS } from "@/data/options";

export default function KitchenPage() {
  const { orders, updateStatus } = useOrders();

  // On ne montre que les commandes actives
  const activeOrders = orders; // ✅ pour debug

  function printOrder(order: Order) {
  const escapeHtml = (s: string) =>
    s
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  // Convertit les options (ids) -> labels via OPTION_GROUPS
  const optionLinesForItem = (item: any) => {
    try {
      // On importe OPTION_GROUPS en haut du fichier (voir étape juste après)
      const selected = item.selectedOptions || {};
      const lines: string[] = [];

      for (const [groupId, value] of Object.entries(selected)) {
        const group = (OPTION_GROUPS as any)[groupId];
        if (!group) continue;

        const ids = Array.isArray(value) ? value : [value];
        const labels = ids
          .map((id) => group.options.find((o: any) => o.id === id)?.label)
          .filter(Boolean);

        if (labels.length > 0) {
          lines.push(`${group.title}: ${labels.join(", ")}`);
        }
      }

      return lines;
    } catch {
      return [];
    }
  };

  const orderNumber = `#${order.id.slice(-6).toUpperCase()}`;
  const date = new Date(order.createdAt).toLocaleString();

  const customerBlock = `
    <div><strong>${escapeHtml(order.draft.fullName || "")}</strong></div>
    <div class="small">${escapeHtml(order.draft.phone || "")}</div>
    <div class="small">${order.draft.mode === "delivery" ? "LIVRAISON" : "A EMPORTER"}</div>
  `;

  const addressBlock =
    order.draft.mode === "delivery" && order.draft.address
      ? `
        <div class="sep"></div>
        <div class="small"><strong>Adresse</strong></div>
        <div class="small">${escapeHtml(order.draft.address.street)}</div>
        <div class="small">${escapeHtml(order.draft.address.postalCode)} ${escapeHtml(
          order.draft.address.city
        )}</div>
      `
      : "";

  const itemsHtml = order.items
    .map((it) => {
      const lines = optionLinesForItem(it);
      return `
        <div class="item">
          <div><strong>${escapeHtml(it.name)}</strong> x${it.quantity}</div>
          ${
            lines.length
              ? `<div class="opt">${lines.map((l) => `• ${escapeHtml(l)}`).join("<br/>")}</div>`
              : ""
          }
        </div>
      `;
    })
    .join("");

  const noteBlock = order.draft.note
    ? `
      <div class="sep"></div>
      <div class="small"><strong>Note</strong></div>
      <div class="small">${escapeHtml(order.draft.note)}</div>
    `
    : "";

  const paymentBlock = `
    <div class="sep"></div>
    <div class="small"><strong>Paiement</strong></div>
    <div class="small">Méthode: ${escapeHtml(order.paymentMethod)}</div>
    <div class="small">Statut: ${order.paymentPaid ? "PAYÉ" : "NON PAYÉ"}</div>
  `;

  const totalsBlock = `
    <div class="sep"></div>
    <div class="small">Sous-total: ${formatEUR(order.subtotalCents)}</div>
    <div class="small">Livraison: ${formatEUR(order.deliveryFeeCents)}</div>
    <div class="total">TOTAL: ${formatEUR(order.totalCents)}</div>
  `;

  const w = window.open("", "_blank", "width=380,height=650");
  if (!w) return;

  w.document.write(`
    <html>
      <head>
        <title>${orderNumber}</title>
        <style>
          /* Ticket thermique style */
          body { font-family: monospace; padding: 10px; }
          .brand { font-size: 18px; font-weight: 700; }
          .small { font-size: 12px; }
          .sep { border-top: 1px dashed #000; margin: 8px 0; }
          .item { margin: 8px 0; }
          .opt { margin-top: 4px; font-size: 12px; opacity: 0.9; }
          .right { text-align: right; }
          .total { margin-top: 8px; font-size: 16px; font-weight: 700; }
          @media print {
            body { width: 80mm; }
          }
        </style>
      </head>
      <body>
        <div class="brand">KR’EPS</div>
        <div class="small">${escapeHtml(orderNumber)} • ${escapeHtml(date)}</div>

        <div class="sep"></div>

        ${customerBlock}
        ${addressBlock}

        <div class="sep"></div>
        <div class="small"><strong>Commande</strong></div>

        ${itemsHtml}

        ${noteBlock}
        ${paymentBlock}
        ${totalsBlock}

        <div class="sep"></div>
        <div class="small">Merci ❤️</div>

        <script>
          window.print();
          window.onafterprint = () => window.close();
        </script>
      </body>
    </html>
  `);

  w.document.close();
}

  return (
    <main className="min-h-screen bg-black px-4 py-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold text-white">
          Écran cuisine
        </h1>

        {activeOrders.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
            Aucune commande en cours.
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {activeOrders.map((o) => (
              <div
                key={o.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-white font-semibold text-lg">
                      #{o.id.slice(-6).toUpperCase()} • {o.draft.fullName}
                    </div>
                    <div className="mt-1 text-white/60 text-sm">
                      {o.draft.mode === "delivery" ? "Livraison" : "À emporter"} •{" "}
                      {formatEUR(o.totalCents)}
                    </div>
                  </div>

                  <button
                    onClick={() => printOrder(o)}
                    className="rounded-xl bg-violet-500 px-4 py-2 text-white font-semibold"
                  >
                    Imprimer
                  </button>
                </div>

                <ul className="mt-3 text-white/80 text-sm space-y-1">
                  {o.items.map((it) => (
                    <li key={it.id}>
                      • {it.name} x{it.quantity}
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex gap-2">
                  {o.status === "new" && (
                    <button
                      onClick={() => updateStatus(o.id, "preparing")}
                      className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white/80"
                    >
                      En préparation
                    </button>
                  )}
                  {o.status === "preparing" && (
                    <button
                      onClick={() => updateStatus(o.id, "ready")}
                      className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white/80"
                    >
                      Marquer prête
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}