"use client";

import { useState } from "react";

type Props = { initial?: number; onChange?: (n: number) => void };

export default function Quantity({ initial = 1, onChange }: Props) {
  const [value, setValue] = useState(initial);
  function inc() {
    setValue((v) => {
      const n = v + 1;
      onChange?.(n);
      return n;
    });
  }
  function dec() {
    setValue((v) => {
      const n = Math.max(1, v - 1);
      onChange?.(n);
      return n;
    });
  }
  return (
    <div>
      <button onClick={dec}>-</button>
      <span>{value}</span>
      <button onClick={inc}>+</button>
    </div>
  );
}
