"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TrendingUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type FreqNumber = { number: number; count: number };
type FreqResponse = { period: number; totalContests: number; numbers: FreqNumber[] };

const PERIODS = [
  { value: 10, label: "10" },
  { value: 50, label: "50" },
  { value: 100, label: "100" },
  { value: 0, label: "Todos" },
];

export function FrequencyChart() {
  const [period, setPeriod] = useState(50);
  const [data, setData] = useState<FreqResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const fetched = useRef<Record<number, FreqResponse>>({});

  const load = useCallback(async (p: number) => {
    if (fetched.current[p]) {
      setData(fetched.current[p]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/frequencias?period=${p}`, { cache: "no-store" });
      if (!res.ok) throw new Error("bad status");
      const json = (await res.json()) as FreqResponse;
      fetched.current[p] = json;
      setData(json);
    } catch {
      // mantém estado atual
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(period);
  }, [period, load]);

  const counts = data?.numbers ?? [];
  const max = counts.length ? Math.max(...counts.map((c) => c.count)) : 1;
  const W = 860;
  const H = 240;
  const PAD = 30;
  const slot = (W - PAD * 2) / 25;
  const barW = slot * 0.6;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
          <TrendingUp className="size-5 text-[#930089]" />
          Frequência dos números
        </h3>
        <div className="flex items-center gap-1 rounded-full bg-zinc-100 p-1 dark:bg-zinc-800">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPeriod(p.value)}
              className={cn(
                "rounded-full px-3 py-1 text-sm font-bold transition",
                period === p.value
                  ? "bg-[#930089] text-white"
                  : "text-zinc-600 hover:text-[#930089] dark:text-zinc-300"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
        Número de vezes que cada dezena foi sorteada
        {period > 0 ? ` nos últimos ${period} concursos` : " em todos os concursos"}.
      </p>

      {loading && !data ? (
        <div className="flex h-64 items-center justify-center text-zinc-400">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label="Gráfico de frequência dos números da Lotofácil"
            className="w-full min-w-[640px]"
          >
            {counts.map((c, i) => {
              const x = PAD + i * slot + (slot - barW) / 2;
              const h = (c.count / max) * (H - PAD * 2);
              const y = H - PAD - h;
              return (
                <g key={c.number}>
                  <rect
                    x={x}
                    y={y}
                    width={barW}
                    height={h}
                    rx={3}
                    className="fill-[#a0008f] transition-all"
                  >
                    <title>{`${c.number}: ${c.count} vezes`}</title>
                  </rect>
                  <text
                    x={PAD + i * slot + slot / 2}
                    y={H - 8}
                    textAnchor="middle"
                    fontSize="11"
                    className="fill-zinc-500 dark:fill-zinc-400"
                  >
                    {c.number}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
        {data && (
          <span>
            Base: {period > 0 ? `últimos ${period} concursos` : `${data.totalContests} concursos`}
          </span>
        )}
        {counts.length > 0 && (
          <span>
            Média: {(counts.reduce((a, c) => a + c.count, 0) / 25).toFixed(1)} sorteios por dezena
          </span>
        )}
      </div>
    </div>
  );
}
