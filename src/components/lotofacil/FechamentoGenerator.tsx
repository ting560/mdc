"use client";

import { useMemo, useState } from "react";
import { Ball } from "./Ball";
import { SaveGameBtn, PrintTicketBtn } from "./TicketActions";
import { addSavedGame } from "@/lib/jogos-store";
import { TOTAL_NUMBERS, pad2, formatCurrency } from "@/lib/lotofacil";
import { availableGuarantees, generateWheel, TICKET_PRICE } from "@/lib/fechamentos";
import { Dices, Loader2, Sparkles, Trash2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FechamentoResult } from "@/lib/fechamentos";

export function FechamentoGenerator() {
  const [selected, setSelected] = useState<number[]>([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
  ]);
  const [guarantee, setGuarantee] = useState(13);
  const [generated, setGenerated] = useState<FechamentoResult | null>(null);
  const [running, setRunning] = useState(false);

  const guarantees = useMemo(
    () => availableGuarantees(selected.length),
    [selected.length]
  );

  const activeGuarantee: 13 | 14 | 15 = (
    guarantee >= 13 && guarantees[guarantee]
      ? guarantee
      : Math.max(13, ...Object.keys(guarantees).map(Number))
  ) as 13 | 14 | 15;

  const toggle = (n: number) => {
    setGenerated(null);
    setSelected((prev) => {
      if (prev.includes(n)) return prev.filter((x) => x !== n);
      if (prev.length >= 20) return prev;
      return [...prev, n].sort((a, b) => a - b);
    });
  };

  const randomPick = () => {
    setGenerated(null);
    const pool = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    setSelected(pool.slice(0, 17).sort((a, b) => a - b));
  };

  const clear = () => {
    setSelected([]);
    setGenerated(null);
  };

  const generate = async () => {
    const m = selected.length;
    if (m < 16) {
      alert("Escolha entre 16 e 20 dezenas para o fechamento.");
      return;
    }
    const g = activeGuarantee;
    setRunning(true);
    // deixar a UI responder antes do cálculo
    await new Promise((r) => setTimeout(r, 30));
    try {
      const wheel = generateWheel(selected, g);
      setGenerated(wheel);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Não foi possível gerar o fechamento.");
    } finally {
      setRunning(false);
    }
  };

  const totalCost = generated ? generated.tickets.length * TICKET_PRICE : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Escolha de <span className="font-bold text-[#930089]">16</span> a{" "}
            <span className="font-bold text-[#930089]">20</span> dezenas. Com poucas apostas, você
            garante um prêmio se as sorteadas estiverem entre as escolhidas.
          </p>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-full px-3 py-1 text-sm font-bold",
                selected.length >= 16
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
              )}
            >
              {selected.length} dezenas
            </span>
            <button
              type="button"
              onClick={randomPick}
              className="inline-flex items-center gap-1 rounded-full border border-zinc-300 px-3 py-1 text-sm text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <Dices className="size-4" />
              Sortear
            </button>
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

        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1).map((n) => (
            <div key={n} className="flex justify-center">
              <Ball number={n} selected={selected.includes(n)} onClick={() => toggle(n)} />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-3 text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Garantia de premiação
        </h3>
        <p className="mb-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Escolha quantos acertos quer garantir. Quanto maior a garantia, mais jogos o fechamento
          terá (e mais caro fica). Sempre que as <strong>15 dezenas sorteadas</strong> estiverem
          entre as suas escolhidas, ao menos um jogo acertará a garantia escolhida.
        </p>
        <div className="flex flex-wrap gap-3">
          {[13, 14, 15].map((g) => {
            const info = guarantees[g];
            const disabled = !info;
            return (
              <button
                key={g}
                type="button"
                disabled={disabled}
                onClick={() => setGuarantee(g)}
                className={cn(
                  "flex flex-col items-center rounded-xl border-2 px-5 py-3 text-left transition",
                  activeGuarantee === g
                    ? "border-[#a0008f] bg-fuchsia-50 dark:bg-fuchsia-950/40"
                    : "border-zinc-200 hover:border-fuchsia-300 dark:border-zinc-700",
                  disabled && "cursor-not-allowed opacity-40"
                )}
              >
                <span className="text-lg font-extrabold text-[#930089]">Garantir {g}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {info
                    ? `≈ ${info.estimate} jogos · ${formatCurrency(info.estimate * TICKET_PRICE)}`
                    : "indisponível"}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={generate}
            disabled={running || selected.length < 16}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#a0008f] to-[#6d0070] px-8 py-3 text-base font-bold text-white shadow-lg shadow-fuchsia-900/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {running ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Sparkles className="size-5" />
            )}
            {running ? "Gerando..." : "Gerar fechamento"}
          </button>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            <span className="font-bold text-zinc-700 dark:text-zinc-300">{selected.length}</span>{" "}
            dezenas escolhidas
            {selected.length >= 16 && (
              <>
                {" · "}
                {guarantees[activeGuarantee]
                  ? `~${guarantees[activeGuarantee].estimate} jogos`
                  : ""}
              </>
            )}
          </p>
        </div>
      </div>

      {generated && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Seu fechamento
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-[#930089] px-3 py-1 font-bold text-white">
                {generated.tickets.length} jogo{generated.tickets.length === 1 ? "" : "s"}
              </span>
              <span className="rounded-full bg-zinc-100 px-3 py-1 font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                Custo: {formatCurrency(totalCost)}
              </span>
              <button
                type="button"
                onClick={() => {
                  generated.tickets.forEach((g) =>
                    addSavedGame(g, `Fechamento (garantia ${activeGuarantee})`)
                  );
                  alert(`${generated.tickets.length} jogos salvos em "Meus jogos".`);
                }}
                className="rounded-full bg-emerald-600 px-3 py-1 font-bold text-white transition hover:bg-emerald-700"
              >
                Salvar todos
              </button>
            </div>
          </div>

          {generated.note && (
            <p
              className={`mb-4 flex items-start gap-2 rounded-xl p-3 text-xs leading-relaxed ${
                generated.complete
                  ? "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                  : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
              }`}
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              {generated.note}
            </p>
          )}

          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {generated.tickets.map((ticket, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400">Jogo {i + 1}</span>
                  <div className="flex items-center gap-1">
                    <SaveGameBtn numbers={ticket} source={`Fechamento (garantia ${activeGuarantee})`} />
                    <PrintTicketBtn numbers={ticket} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {ticket.map((n) => (
                    <span
                      key={n}
                      className="inline-flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-[#a0008f] to-[#6d0070] text-[11px] font-bold text-white"
                    >
                      {pad2(n)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
