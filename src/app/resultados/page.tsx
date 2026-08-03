import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getDataset, getFirstContest, maybeRefresh } from "@/lib/lotofacil-data";
import { pad2 } from "@/lib/lotofacil";

export const metadata = {
  title: "Resultados da Lotofácil",
  description: "Todos os resultados da Lotofácil desde o concurso 1, em 2003.",
};

export const dynamic = "force-dynamic";

maybeRefresh();

const PAGE_SIZE = 20;

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function ResultadosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const raw = Number(Array.isArray(params.page) ? params.page[0] : params.page || "1");
  const page = Number.isFinite(raw) && raw >= 1 ? Math.floor(raw) : 1;

  const results = getDataset().results;
  const first = getFirstContest();
  const totalPages = Math.ceil(results.length / PAGE_SIZE);
  const current = Math.min(page, totalPages);
  const start = results.length - (current - 1) * PAGE_SIZE - 1;
  const end = Math.max(0, start - PAGE_SIZE + 1);
  const rows = results.slice(end, start + 1).reverse();

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            Resultados da Lotofácil
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Todos os concursos do {first.d} até hoje.
          </p>
        </div>
        <Link
          href="/"
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-[#930089] hover:text-[#930089] dark:border-zinc-700 dark:text-zinc-300"
        >
          Voltar ao simulador
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
              <th className="px-4 py-3 font-semibold">Concurso</th>
              <th className="px-4 py-3 font-semibold">Data</th>
              <th className="px-4 py-3 font-semibold">Dezenas sorteadas</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.c}
                className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/concurso/${r.c}`}
                    className="font-bold text-[#930089] hover:underline"
                  >
                    {r.c}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{r.d}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {r.z.map((n) => (
                      <span
                        key={n}
                        className="flex size-7 items-center justify-center rounded-full border border-fuchsia-200 bg-fuchsia-50 text-[11px] font-bold text-[#930089] dark:border-fuchsia-900 dark:bg-fuchsia-950/50 dark:text-fuchsia-300"
                      >
                        {pad2(n)}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Link
          href={current > 1 ? `/resultados?page=${current - 1}` : "#"}
          aria-disabled={current <= 1}
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
          href={current < totalPages ? `/resultados?page=${current + 1}` : "#"}
          aria-disabled={current >= totalPages}
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
