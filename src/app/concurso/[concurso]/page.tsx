import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Calendar, Trophy, Users } from "lucide-react";
import { getContest, getFirstContest, getLastContest, maybeRefresh } from "@/lib/lotofacil-data";
import { pad2, formatCurrency } from "@/lib/lotofacil";
import { SaveGameBtn, ShareTicketBtn, PrintTicketBtn } from "@/components/lotofacil/TicketActions";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ concurso: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { concurso } = await params;
  const c = Number(concurso);
  const contest = Number.isFinite(c) ? getContest(c) : undefined;
  return {
    title: contest ? `Concurso ${contest.c} da Lotofácil` : "Concurso não encontrado",
  };
}

const PRIZE_LABELS: Record<number, string> = {
  1: "15 acertos",
  2: "14 acertos",
  3: "13 acertos",
  4: "12 acertos",
  5: "11 acertos",
};

export default async function ConcursoPage({ params }: Props) {
  await maybeRefresh();
  const { concurso } = await params;
  const c = Number(concurso);
  const contest = Number.isFinite(c) ? getContest(c) : undefined;
  if (!contest) notFound();

  const first = getFirstContest().c;
  const last = getLastContest().c;
  const totalContests = last - first + 1;
  const position = contest.c - first + 1;
  const progress = (position / totalContests) * 100;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/resultados"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-zinc-500 transition hover:text-[#930089] dark:text-zinc-400"
      >
        <ArrowLeft className="size-4" />
        Voltar aos resultados
      </Link>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
              Concurso {contest.c}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
              <Calendar className="size-4" />
              Sorteado em {contest.d}
            </p>
          </div>
          <div className="flex gap-2">
            {contest.c > first && (
              <Link
                href={`/concurso/${contest.c - 1}`}
                className="inline-flex items-center gap-1 rounded-full border border-zinc-300 px-4 py-2 text-sm font-bold text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <ArrowLeft className="size-4" />
                Anterior
              </Link>
            )}
            {contest.c < last && (
              <Link
                href={`/concurso/${contest.c + 1}`}
                className="inline-flex items-center gap-1 rounded-full border border-zinc-300 px-4 py-2 text-sm font-bold text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Próximo
                <ArrowRight className="size-4" />
              </Link>
            )}
          </div>
        </div>

        <div className="mb-6 flex flex-wrap justify-center gap-2.5">
          {contest.z.map((n) => (
            <span
              key={n}
              className="inline-flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-[#a0008f] to-[#6d0070] text-lg font-extrabold text-white shadow-md shadow-fuchsia-950/30"
            >
              {pad2(n)}
            </span>
          ))}
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
          <SaveGameBtn numbers={contest.z} source={`Sorteio do concurso ${contest.c}`} />
          <ShareTicketBtn numbers={contest.z} />
          <PrintTicketBtn numbers={contest.z} />
        </div>

        <div className="mb-4">
          <div className="mb-1 flex justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <span>
              Concurso #{position} de {totalContests}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#a0008f] to-[#6d0070]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {contest.pr && contest.pr.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-fuchsia-50 text-zinc-700 dark:bg-fuchsia-950/40 dark:text-zinc-300">
                <tr>
                  <th className="px-4 py-2.5 font-bold">Faixa</th>
                  <th className="px-4 py-2.5 text-center font-bold">
                    <Users className="mr-1 inline size-3.5" />
                    Ganhadores
                  </th>
                  <th className="px-4 py-2.5 text-right font-bold">
                    <Trophy className="mr-1 inline size-3.5" />
                    Prêmio por ganhador
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {contest.pr.map(([winners, value], idx) => {
                  const label = PRIZE_LABELS[idx + 1] || `Faixa ${idx + 1}`;
                  return (
                    <tr key={idx} className="bg-white dark:bg-zinc-900">
                      <td className="px-4 py-2.5 font-bold text-zinc-800 dark:text-zinc-200">
                        {label}
                      </td>
                      <td className="px-4 py-2.5 text-center font-semibold text-zinc-600 dark:text-zinc-300">
                        {winners === 0 ? "—" : winners.toLocaleString("pt-BR")}
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {value > 0 ? formatCurrency(value) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-xl bg-zinc-50 p-4 text-center text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            Prêmios não informados para este concurso.
          </p>
        )}
      </div>
    </main>
  );
}
