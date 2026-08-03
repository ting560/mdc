"use client";

import { useState } from "react";
import { Ball } from "./Ball";
import { SaveGameBtn, ShareTicketBtn, PrintTicketBtn } from "./TicketActions";
import { MIN_TICKET, MAX_TICKET, TOTAL_NUMBERS, pad2 } from "@/lib/lotofacil";
import { Loader2, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type CheckedContest = { c: number; d: string; z: number[] };
type CheckResponse = {
  total: number;
  byHits: Record<string, CheckedContest[]>;
};

export function Volante() {
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResponse | null>(null);
  const [error, setError] = useState("");

  const toggle = (n: number) => {
    if (loading) return;
    setResult(null);
    setError("");
    setSelected((prev) => {
      if (prev.includes(n)) return prev.filter((x) => x !== n);
      if (prev.length >= MAX_TICKET) return prev;
      return [...prev, n];
    });
  };

  const clear = () => {
    if (loading) return;
    setSelected([]);
    setResult(null);
    setError("");
  };

  const verify = async () => {
    if (selected.length < MIN_TICKET) {
      setError(`Escolha pelo menos ${MIN_TICKET} dezenas para verificar.`);
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numbers: selected }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Erro ao verificar.");
      }
      const data = (await res.json()) as CheckResponse;
      setResult(data);
    } catch (e) {
      const msg =
        e instanceof TypeError
          ? "Não foi possível conectar ao servidor. Verifique se ele está em execução e tente novamente."
          : e instanceof Error
            ? e.message
            : "Não foi possível verificar. Tente novamente.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const hitsLevels = [15, 14, 13, 12, 11];
  const incomplete = selected.length > 0 && selected.length < MIN_TICKET;
  const ready = selected.length >= MIN_TICKET;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-5">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Escolha de <span className="font-bold text-[#930089]">{MIN_TICKET}</span> a{" "}
              <span className="font-bold text-[#930089]">{MAX_TICKET}</span> números no volante:
            </p>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-bold",
                  ready
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                    : incomplete
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                )}
              >
                Dezenas selecionadas: {selected.length}
              </span>
              <button
                type="button"
                onClick={clear}
                className="inline-flex items-center gap-1 rounded-full border border-zinc-300 px-3 py-1 text-sm text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Trash2 className="size-4" />
                Limpar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 sm:gap-3 sm:grid-cols-5">
            {Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1).map((n) => (
              <div key={n} className="flex justify-center">
                <Ball number={n} selected={selected.includes(n)} onClick={() => toggle(n)} />
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={verify}
              disabled={loading || !ready}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#a0008f] to-[#6d0070] px-8 py-3 text-base font-bold text-white shadow-lg shadow-fuchsia-900/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <Loader2 className="size-5 animate-spin" /> : <CheckCircle2 className="size-5" />}
              {loading ? "Verificando..." : "Verificar se eu teria ganhado"}
            </button>
            {error && (
              <p className="flex items-center gap-1.5 text-sm font-medium text-red-600">
                <XCircle className="size-4" />
                {error}
              </p>
            )}
          </div>

          {ready && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <SaveGameBtn numbers={selected} source="Volante manual" />
              <ShareTicketBtn numbers={selected} />
              <PrintTicketBtn numbers={selected} />
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:min-h-[320px]">
        <h3 className="mb-3 text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Resultado da verificação
        </h3>
        {!result && !loading && (
          <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            Marque seus números e clique em <strong>Verificar</strong>. Verificaremos em todos os{" "}
            <strong>{3700}+</strong> concursos do nosso banco de dados se o seu jogo teria ganho algum
            prêmio (11 a 15 acertos).
          </p>
        )}
        {loading && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Verificando em todos os concursos...
          </p>
        )}
        {result && (
          <div className="space-y-3">
            <div
              className={cn(
                "rounded-xl p-3 text-center text-sm font-bold",
                result.total > 0
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                  : "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
              )}
            >
              {result.total > 0
                ? `Você teria ganho prêmio em ${result.total} concurso${result.total === 1 ? "" : "s"}!`
                : "Seu jogo não teria ganho prêmio em nenhum concurso."}
            </div>
            {hitsLevels.map((hits) => {
              const list = result.byHits[hits];
              if (!list || list.length === 0) return null;
              return (
                <div
                  key={hits}
                  className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
                >
                  <p className="mb-2 text-sm font-bold text-[#930089]">
                    {hits} acertos: {list.length} concurso{list.length === 1 ? "" : "s"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {list.slice(0, 12).map((c) => (
                      <span
                        key={c.c}
                        title={`Concurso ${c.c} de ${c.d}`}
                        className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        {pad2(c.c)}
                      </span>
                    ))}
                    {list.length > 12 && (
                      <span className="px-1 text-xs font-semibold text-zinc-400">
                        +{list.length - 12} outros
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
