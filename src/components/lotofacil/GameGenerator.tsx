"use client";

import { useState } from "react";
import { Ball } from "./Ball";
import { generateRandomTicket, generateIntelligentTicket } from "@/lib/lotofacil";
import { SaveGameBtn, ShareTicketBtn, PrintTicketBtn } from "./TicketActions";
import { Dices, BrainCircuit, Info, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type GeneratorContext = { c: number; d: string; z: number[] };

export function GameGenerator({ context }: { context: GeneratorContext[] }) {
  const [mode, setMode] = useState<"aleatorio" | "inteligente">("aleatorio");
  const [ticket, setTicket] = useState<number[]>([]);
  const [showInfo, setShowInfo] = useState(false);

  const generate = () => {
    if (mode === "aleatorio") {
      setTicket(generateRandomTicket());
    } else {
      setTicket(generateIntelligentTicket(context));
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Gerador de jogos</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("aleatorio")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition",
              mode === "aleatorio"
                ? "bg-[#930089] text-white shadow"
                : "border border-zinc-300 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            )}
          >
            <Dices className="size-4" />
            Aleatório
          </button>
          <button
            type="button"
            onClick={() => setMode("inteligente")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition",
              mode === "inteligente"
                ? "bg-[#930089] text-white shadow"
                : "border border-zinc-300 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            )}
          >
            <BrainCircuit className="size-4" />
            Inteligente
          </button>
          <button
            type="button"
            onClick={() => setShowInfo((v) => !v)}
            className="inline-flex items-center gap-1 rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-500 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <Info className="size-3.5" />
            Qual a diferença?
          </button>
        </div>
      </div>

      {showInfo && (
        <div className="mb-4 rounded-xl border border-fuchsia-200 bg-fuchsia-50 p-4 text-sm leading-relaxed text-zinc-700 dark:border-fuchsia-900 dark:bg-fuchsia-950/40 dark:text-zinc-300">
          <p>
            O gerador <strong>aleatório</strong> sorteia 15 números quaisquer. Já o gerador{" "}
            <strong>inteligente</strong> verifica, nos últimos concursos, a quantidade de números pares
            e ímpares, assim como o número de dezenas repetidas de um concurso para o outro, procurando
            manter o mesmo padrão. Assim, elimina alguns resultados que aparecem com menor frequência,
            segundo as estatísticas. <em>Obs.: isso não representa aumento de probabilidade, pois todas
            as combinações da Lotofácil têm a mesma probabilidade de sair.</em>
          </p>
        </div>
      )}

      <div className="flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={generate}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#a0008f] to-[#6d0070] px-8 py-3 text-base font-bold text-white shadow-lg shadow-fuchsia-900/30 transition hover:brightness-110"
        >
          <RefreshCw className="size-5" />
          Gerar combinação
        </button>

        <div className={cn("grid w-full grid-cols-5 gap-2 sm:grid-cols-5", ticket.length ? "" : "py-2")}>
          {ticket.length > 0
            ? ticket.map((n) => (
                <div key={n} className="flex justify-center">
                  <Ball number={n} selected />
                </div>
              ))
            : Array.from({ length: 15 }, (_, i) => (
                <div key={i} className="flex justify-center">
                  <div className="flex size-11 items-center justify-center rounded-full border-2 border-dashed border-zinc-200 text-lg font-bold text-zinc-200 dark:border-zinc-700 dark:text-zinc-700 sm:size-12">
                    ?
                  </div>
                </div>
              ))}
        </div>

        {ticket.length > 0 && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Sua sugestão de jogo{" "}
              <span className="font-bold text-zinc-700 dark:text-zinc-300">
                ({mode === "aleatorio" ? "aleatório" : "inteligente"})
              </span>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <SaveGameBtn
                numbers={ticket}
                source={`Gerador ${mode === "aleatorio" ? "aleatório" : "inteligente"}`}
              />
              <ShareTicketBtn numbers={ticket} />
              <PrintTicketBtn numbers={ticket} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
