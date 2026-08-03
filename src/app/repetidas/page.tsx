import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getRepeatedPerContest,
  getRepeatedStats,
  maybeRefresh,
} from "@/lib/lotofacil-data";

export const metadata = {
  title: "Dezenas repetidas da Lotofácil",
  description: "Quantidade de dezenas repetidas entre concursos consecutivos da Lotofácil.",
};

export const dynamic = "force-dynamic";

maybeRefresh();

const PAGE_SIZE = 25;

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function RepetidasPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const raw = Number(Array.isArray(params.page) ? params.page[0] : params.page || "1");
  const page = Number.isFinite(raw) && raw >= 1 ? Math.floor(raw) : 1;

  const all = getRepeatedPerContest().reverse();
  const totalPages = Math.ceil(all.length / PAGE_SIZE);
  const current = Math.min(page, totalPages);
  const rows = all.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const stats = getRepeatedStats(10);

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            Dezenas repetidas por concurso
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Quantidade de dezenas do concurso anterior que se repetiram em cada sorteio.
          </p>
        </div>
        <Link
          href="/"
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-[#930089] hover:text-[#930089] dark:border-zinc-700 dark:text-zinc-300"
        >
          Voltar ao simulador
        </Link>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 text-sm font-bold text-zinc-800 dark:text-zinc-200">
          Nos últimos 10 concursos
        </h2>
        <div className="flex flex-wrap gap-2">
          {stats.map((s) => (
            <span
              key={s.repeated}
              className="inline-flex items-center gap-1.5 rounded-full border border-fuchsia-200 bg-fuchsia-50 px-3 py-1.5 text-sm text-zinc-700 dark:border-fuchsia-900 dark:bg-fuchsia-950/40 dark:text-zinc-300"
            >
              <strong className="text-[#930089]">{Math.round(s.percent)}%</strong> repetiram{" "}
              <strong>{s.repeated}</strong>
            </span>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
              <th className="px-4 py-3 font-semibold">Concurso</th>
              <th className="px-4 py-3 font-semibold">Data</th>
              <th className="px-4 py-3 font-semibold">Dezenas repetidas do concurso anterior</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.c} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                <td className="px-4 py-2.5 font-bold text-zinc-900 dark:text-zinc-100">{r.c}</td>
                <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{r.d}</td>
                <td className="px-4 py-2.5">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="flex size-7 items-center justify-center rounded-full bg-[#930089] text-xs font-bold text-white">
                      {r.repeated}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      dezena{r.repeated === 1 ? "" : "s"}
                    </span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Link
          href={current > 1 ? `/repetidas?page=${current - 1}` : "#"}
          className={
            current > 1
              ? "inline-flex items-center gap-1 rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-[#930089] hover:text-[#930089] dark:border-zinc-700 dark:text-zinc-300"
              : "pointer-events-none inline-flex items-center gap-1 rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-300 dark:border-zinc-800 dark:text-zinc-600"
          }
        >
          <ChevronLeft className="size-4" /> Anteriores
        </Link>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Página <strong>{current}</strong> de <strong>{totalPages}</strong>
        </p>
        <Link
          href={current < totalPages ? `/repetidas?page=${current + 1}` : "#"}
          className={
            current < totalPages
              ? "inline-flex items-center gap-1 rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-[#930089] hover:text-[#930089] dark:border-zinc-700 dark:text-zinc-300"
              : "pointer-events-none inline-flex items-center gap-1 rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-300 dark:border-zinc-800 dark:text-zinc-600"
          }
        >
          Próximos <ChevronRight className="size-4" />
        </Link>
      </div>
    </main>
  );
}
