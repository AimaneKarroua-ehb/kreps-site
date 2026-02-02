// src/lib/order.ts
export type SelectedOptions = Record<string, string | string[]>;

export type OrderLine = {
  productId: string;
  name: string;
  basePriceCents: number;
  optionPriceCents: number;
  quantity: number;
  selectedOptions: SelectedOptions;
};

export type Order = {
  id: string; // ex: KR-8F3A1C
  createdAt: string;
  lines: OrderLine[];
  totalCents: number;
};

const LAST_ORDER_KEY = "kreps_last_order_v1";

function makeId() {
  const part = Math.random().toString(16).slice(2, 8).toUpperCase();
  return `KR-${part}`;
}

export function buildOrder(lines: OrderLine[], totalCents: number): Order {
  return {
    id: makeId(),
    createdAt: new Date().toISOString(),
    lines,
    totalCents,
  };
}

export function saveLastOrder(order: Order) {
  try {
    localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
  } catch {}
}

export function readLastOrder(): Order | null {
  try {
    const raw = localStorage.getItem(LAST_ORDER_KEY);
    return raw ? (JSON.parse(raw) as Order) : null;
  } catch {
    return null;
  }
}