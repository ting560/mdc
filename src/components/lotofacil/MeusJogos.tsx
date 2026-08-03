"use client";

import { useState, useSyncExternalStore } from "react";
import { Trash2, CheckCircle2, XCircle, Bookmark, RefreshCw } from "lucide-react";
import {
  removeSavedGame,
  clearSavedGames,
  subscribeGamesChanged,
  getGamesSnapshot,
  getServerGamesSnapshot,
} from "@/lib/jogos-store";
import { formatTicket, pad2 } from "@/lib/lotofacil";
import { ShareTicketBtn, PrintTicketBtn } from "./TicketActions";

type Checked = { contest: number; hits: number } | null;

export function MeusJogos() {
  const games = useSyncExternalStore(
    subscribeGamesChanged,
    getGamesSnapshot,
    getServerGamesSnapshot
  );
  const [lastResult, setLastResult] = useState<{ c: number; d: string; z: number[] } | null>(null);
  const [checked, setChecked] = useState<Record<string, Checked>>({});
  const [checking, setChecking] = useState(false);

  const checkAll = async () => {
    if (games.length === 0) return;
    setChecking(true);
    setChecked({});
    try {
      const lr = await fetch("/api/ultimo", { cache: "no-store" });
      if (!lr.ok) throw new Error("bad status");
      const data = await lr.json();
      setLastResult(data);
      const drawn = data.z as number[];
      const byId: Record<string, Checked> = {};
      for (const g of games) {
        const hits = g.numbers.filter((n) => drawn.includes(n)).length;
        byId[g.id] = hits >= 11 ? { contest: data.c, hits } : null;
      }
      setChecked(byId);
    } catch {
      alert("Não foi possível conferir os jogos. Verifique se o servidor está ativo.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
          <Bookmark className="size-5 text-[#930089]" />
          Meus jogos
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-sm font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {games.length}
          </span>
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={checkAll}
            disabled={checking || games.length === 0}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {checking ? <RefreshCw className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
            {checking ? "Conferindo..." : "Conferir no último concurso"}
          </button>
          {games.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Remover todos os jogos salvos?")) clearSavedGames();
              }}
              className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
            >
              <Trash2 className="size-4" />
              Limpar tudo
            </button>
          )}
        </div>
      </div>

      {lastResult && (
        <div className="mb-4 rounded-xl bg-fuchsia-50 p-3 text-sm font-semibold text-zinc-700 dark:bg-fuchsia-950/40 dark:text-zinc-300">
          Último sorteio: concurso <span className="font-extrabold text-[#930089]">{lastResult.c}</span>{" "}
          ({lastResult.d}): <span className="font-bold">{formatTicket(lastResult.z)}</span>
        </div>
      )}

      {games.length === 0 ? (
        <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          Você ainda não salvou nenhum jogo. Use o botão <strong>Salvar</strong> no volante, no
          gerador ou no fechamento para guardar seus jogos aqui (armazenados no seu navegador).
        </p>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((g) => {
            const res = checked[g.id];
            return (
              <div key={g.id} className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-bold text-zinc-400">
                    {g.source || "Jogo manual"}
                    {" · "}
                    {new Date(g.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSavedGame(g.id)}
                    title="Remover jogo"
                    className="rounded-full p-1 text-zinc-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {g.numbers.map((n) => (
                    <span
                      key={n}
                      className="inline-flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-[#a0008f] to-[#6d0070] text-[11px] font-bold text-white"
                    >
                      {pad2(n)}
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <ShareTicketBtn numbers={g.numbers} />
                  <PrintTicketBtn numbers={g.numbers} />
                </div>
                {res && (
                  <p className="mt-2 flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    <CheckCircle2 className="size-3.5" />
                    Concurso {res.contest}: {res.hits} acertos
                  </p>
                )}
                {checked[g.id] === null && (
                  <p className="mt-2 flex items-center gap-1 rounded-lg bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    <XCircle className="size-3.5" />
                    Sem prêmio no último concurso
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
