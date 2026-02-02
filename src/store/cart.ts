"use client";

import { useMemo, useState } from "react";

export type SelectedOptions = Record<string, string | string[]>;

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  basePriceCents: number;
  quantity: number;
  selectedOptions: SelectedOptions;
  optionPriceCents: number;
};

const KEY = "kreps_cart_v1";

function uid(): string {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function safeRead(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function safeWrite(items: CartItem[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {}
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => safeRead());

  const totalCents = useMemo(() => {
    return items.reduce((sum, it) => sum + (it.basePriceCents + it.optionPriceCents) * it.quantity, 0);
  }, [items]);

  function setAndPersist(next: CartItem[]) {
    setItems(next);
    safeWrite(next);
  }

  // ✅ merge si même produit + mêmes options
  function addItem(item: Omit<CartItem, "id">) {
    const key = (x: { productId: string; selectedOptions: any }) =>
      `${x.productId}__${JSON.stringify(x.selectedOptions)}`;

    const incomingKey = key(item);
    const idx = items.findIndex((it) => key(it) === incomingKey);

    if (idx >= 0) {
      const next = items.map((it, i) =>
        i === idx ? { ...it, quantity: it.quantity + item.quantity } : it
      );
      setAndPersist(next);
      return;
    }

    setAndPersist([...items, { ...item, id: uid() }]);
  }

  function removeItem(id: string) {
    setAndPersist(items.filter((x) => x.id !== id));
  }

  function clear() {
    setAndPersist([]);
  }

  function setQuantity(id: string, quantity: number) {
    const q = Math.max(1, quantity);
    setAndPersist(items.map((x) => (x.id === id ? { ...x, quantity: q } : x)));
  }

  return { items, totalCents, addItem, removeItem, clear, setQuantity };
}