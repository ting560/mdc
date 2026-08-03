import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getFrequencies, getMostDelayed, getLastContest, maybeRefresh } from "@/lib/lotofacil-data";
import { pad2 } from "@/lib/lotofacil";

export const metadata = {
  title: "Números mais sorteados da Lotofácil",
  description: "Frequência completa dos 25 números da Lotofácil em todos os concursos.",
};

export const dynamic = "force-dynamic";

maybeRefresh();

const LAST = getLastContest();

export default function FrequentesPage() {
  const frequencies = getFrequencies().sort((a, b) => b.count - a.count || a.number - b.number);
  const max = frequencies[0].count;
  const delayed = getMostDelayed(5);

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            Números mais sorteados
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Quantidade de vezes que cada dezena saiu em todos os {LAST.c} concursos do nosso banco de
            dados (do concurso 1 até o {LAST.c}, de {LAST.d}).
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-[#930089] hover:text-[#930089] dark:border-zinc-700 dark:text-zinc-300"
        >
          <ArrowLeft className="size-4" /> Voltar ao simulador
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {frequencies.map((f, i) => (
          <div
            key={f.number}
            className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="mb-3 flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-[#930089] text-sm font-bold text-white">
                {pad2(f.number)}
              </span>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {i === 0
                    ? "Mais sorteado"
                    : i === frequencies.length - 1
                      ? "Menos sorteado"
                      : `${i + 1}º mais sorteado`}
                </p>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{f.count} vezes</p>
              </div>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#a0008f] to-[#d84acb]"
                style={{ width: `${(f.count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Números mais atrasados
        </h2>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          Dezenas que estão há mais tempo sem serem sorteadas, comparando com o concurso {LAST.c}.
        </p>
        <div className="flex flex-wrap gap-2">
          {delayed.map((d) => (
            <span
              key={d.number}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <strong className="text-[#930089]">{pad2(d.number)}</strong>
              há {d.delay} concurso{d.delay === 1 ? "" : "s"}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
