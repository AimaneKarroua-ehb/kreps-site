"use client";

import { useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/store/cart";

export type OrderStatus = "new" | "preparing" | "ready" | "done" | "canceled";
export type PaymentMethod = "terminal" | "cash" | "payconiq";

export type OrderDraft = {
  fullName: string;
  phone: string;
  mode: "pickup" | "delivery";
  address?: { street: string; postalCode: string; city: string };
  note?: string;
  deliveryFeeCents?: number;
  totalCents?: number;
};

export type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentPaid: boolean;
  draft: OrderDraft;
  items: CartItem[];
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
};

const KEY = "kreps_orders_v1";

function uid(): string {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function readOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

function writeOrders(orders: Order[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(orders));
  } catch {}
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const refresh = () => setOrders(readOrders());
    refresh();
    const id = setInterval(refresh, 1000);
    return () => clearInterval(id);
  }, []);

  const sorted = useMemo(() => {
    return [...orders].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [orders]);

  function setAndPersist(next: Order[]) {
    setOrders(next);
    writeOrders(next);
  }

  /**
   * ✅ Si tu passes { id, createdAt } depuis Payment,
   * l'admin/cuisine aura EXACTEMENT le même code commande que le ticket client.
   */
  function addOrder(input: {
    id?: string;
    createdAt?: string;
    draft: OrderDraft;
    items: CartItem[];
    paymentMethod: PaymentMethod;
    status?: OrderStatus;
    paymentPaid?: boolean;
  }): string {
    const subtotalCents = input.items.reduce(
      (sum, it) => sum + (it.basePriceCents + it.optionPriceCents) * it.quantity,
      0
    );

    const deliveryFeeCents =
      input.draft.mode === "delivery" ? input.draft.deliveryFeeCents ?? 250 : 0;

    const totalCents = subtotalCents + deliveryFeeCents;

    const order: Order = {
      id: input.id ?? uid(),
      createdAt: input.createdAt ?? new Date().toISOString(),
      status: input.status ?? "new",
      paymentMethod: input.paymentMethod,
      paymentPaid: input.paymentPaid ?? false,
      draft: input.draft,
      items: input.items,
      subtotalCents,
      deliveryFeeCents,
      totalCents,
    };

    const next = [order, ...readOrders()];
    setAndPersist(next);
    return order.id;
  }

  function updateStatus(id: string, status: OrderStatus) {
    setAndPersist(readOrders().map((o) => (o.id === id ? { ...o, status } : o)));
  }

  function togglePaid(id: string) {
    setAndPersist(
      readOrders().map((o) =>
        o.id === id ? { ...o, paymentPaid: !o.paymentPaid } : o
      )
    );
  }

  function removeOrder(id: string) {
    setAndPersist(readOrders().filter((o) => o.id !== id));
  }

  return { orders: sorted, addOrder, updateStatus, togglePaid, removeOrder };
}