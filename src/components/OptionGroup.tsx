"use client";

import type { OptionGroup as OG } from "@/data/options";

export default function OptionGroup({
  group,
  value,
  onChange,
}: {
  group: OG;
  value: string | string[] | undefined;
  onChange: (v: string | string[]) => void;
}) {
  const isMulti = group.type === "multiple";
  const current = value ?? (isMulti ? [] : "");

  return (
    <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
      <div className="flex items-center justify-between">
        <div className="text-white font-semibold">{group.title}</div>
        <div className="text-xs text-white/60">
          {group.required ? "Obligatoire" : "Optionnel"}
          {isMulti && group.maxSelect ? ` • max ${group.maxSelect}` : ""}
        </div>
      </div>

      <div className="mt-3 grid gap-2">
        {group.options.map((opt) => {
          const checked = isMulti
            ? (current as string[]).includes(opt.id)
            : current === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                if (!isMulti) return onChange(opt.id);
                const arr = current as string[];
                const next = checked ? arr.filter((x) => x !== opt.id) : [...arr, opt.id];
                if (group.maxSelect && next.length > group.maxSelect) return;
                onChange(next);
              }}
              className={[
                "flex items-center justify-between rounded-xl border px-3 py-3 text-left",
                checked
                  ? "border-violet-400 bg-violet-500/15 text-white"
                  : "border-white/10 bg-black/30 text-white/85 hover:bg-black/40",
              ].join(" ")}
            >
              <span>{opt.label}</span>
              {typeof opt.priceDeltaCents === "number" && opt.priceDeltaCents !== 0 ? (
                <span className="text-xs text-yellow-300">
                  +{(opt.priceDeltaCents / 100).toFixed(2).replace(".", ",")} €
                </span>
              ) : (
                <span className="text-xs text-white/50">{checked ? "✓" : ""}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}