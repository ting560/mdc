"use client";

import { useState } from "react";
import { getOdds, PRICE_PER_MARK } from "@/lib/lotofacil";
import { cn } from "@/lib/utils";

const MARKS = [15, 16, 17, 18, 19, 20];

function formatOneIn(n: number): string {
  if (n >= 1000) return n.toLocaleString("pt-BR");
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}

export function OddsTabs() {
  const [marked, setMarked] = useState(15);
  const odds = getOdds(marked);
  const price = PRICE_PER_MARK[marked];

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">Suas chances de ganhar jogando:</p>
      <div className="mb-5 flex flex-wrap gap-2">
        {MARKS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMarked(m)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition",
              m === marked
                ? "bg-[#930089] text-white shadow"
                : "border border-zinc-300 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            )}
          >
            {m} números
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <th className="pb-2 font-semibold">Acertos</th>
              <th className="pb-2 font-semibold">Chance (1 em)</th>
            </tr>
          </thead>
          <tbody>
            {odds.map((row) => (
              <tr
                key={row.hits}
                className="border-b border-zinc-100 dark:border-zinc-800"
              >
                <td className="py-2.5 font-semibold text-zinc-800 dark:text-zinc-200">
                  {row.label}
                </td>
                <td className="py-2.5 text-zinc-700 dark:text-zinc-300">
                  {formatOneIn(row.oneIn)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm font-semibold text-[#930089]">
        Preço do jogo com {marked} números: R${" "}
        {price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
}
