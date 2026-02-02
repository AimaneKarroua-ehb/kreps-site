"use client";

import { useEffect, useMemo, useState } from "react";

export type SelectedOptions = Record<string, string | string[]>;
// ex: { size: "l", sauce: "mix", extras: ["cheese"] }

export type CartItem = {
  id: string; // unique item id
  productId: string;
  name: string;
  basePriceCents: number;
  quantity: number;
  selectedOptions: SelectedOptions;
  optionPriceCents: number;
};

const KEY = "kreps_cart_v1";

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) setItems(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const totalCents = useMemo(
    () =>
      items.reduce(
        (sum, it) => sum + (it.basePriceCents + it.optionPriceCents) * it.quantity,
        0
      ),
    [items]
  );

  return {
    items,
    totalCents,
    addItem: (item: Omit<CartItem, "id">) =>
      setItems((prev) => [...prev, { ...item, id: uid() }]),
    removeItem: (id: string) =>
      setItems((prev) => prev.filter((x) => x.id !== id)),
    clear: () => setItems([]),
    setQuantity: (id: string, quantity: number) =>
      setItems((prev) =>
        prev.map((x) => (x.id === id ? { ...x, quantity: Math.max(1, quantity) } : x))
      ),
  };
}