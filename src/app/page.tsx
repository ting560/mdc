import Link from "next/link";
import {
  Clover,
  CalendarDays,
  Trophy,
  Banknote,
  TrendingUp,
  Clock4,
  ArrowRight,
  Repeat,
  Equal,
} from "lucide-react";
import { Volante } from "@/components/lotofacil/Volante";
import { GameGenerator } from "@/components/lotofacil/GameGenerator";
import { OddsTabs } from "@/components/lotofacil/OddsTabs";
import { FrequencyChart } from "@/components/lotofacil/FrequencyChart";
import { MeusJogos } from "@/components/lotofacil/MeusJogos";
import {
  getLastResults,
  getMostFrequent,
  getMostDelayed,
  getRepeatedStats,
  getParesImparesStats,
  getGeneratorContext,
  getFirstContest,
  getLastContest,
  getMeta,
  maybeRefresh,
} from "@/lib/lotofacil-data";
import { formatCurrency, pad2 } from "@/lib/lotofacil";

export const metadata = {
  title: "Simulador da Lotofácil",
  description:
    "Teste seus números nos concursos anteriores, use o gerador de jogos aleatório ou inteligente e confira estatísticas completas da Lotofácil.",
};

export const dynamic = "force-dynamic";

maybeRefresh();

const FIRST = getFirstContest();
const LAST = getLastContest();
const META = getMeta();

function ResultBall({ n }: { n: number }) {
  return (
    <span className="flex size-8 items-center justify-center rounded-full border border-fuchsia-200 bg-fuchsia-50 text-xs font-bold text-[#930089] dark:border-fuchsia-900 dark:bg-fuchsia-950/50 dark:text-fuchsia-300 sm:size-9 sm:text-sm">
      {pad2(n)}
    </span>
  );
}

export default function Home() {
  const last3 = getLastResults(3);
  const frequent = getMostFrequent(6);
  const delayed = getMostDelayed(6);
  const repeatedStats = getRepeatedStats(10);
  const paresImparesStats = getParesImparesStats(10);
  const generatorContext = getGeneratorContext(30);
  const maxFrequent = frequent[0]?.count ?? 1;
  const maxDelay = delayed[0]?.delay ?? 1;

  return (
    <main>
      {/* HERO */}
      <section className="bg-gradient-to-br from-[#7a0078] via-[#930089] to-[#5c0060] text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
            <Clover className="size-3.5" /> Lotofácil
          </p>
          <h1 className="mb-3 text-3xl font-extrabold leading-tight sm:text-4xl">
            Simulador da Lotofácil
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-white/85 sm:text-base">
            A Lotofácil é uma loteria realizada pela Caixa Econômica Federal, que pode pagar milhões
            para o acertador dos 15 números sorteados. Você marca entre 15 e 20 números, dentre os 25
            disponíveis no volante, e fatura algum prêmio se acertar 11, 12, 13, 14 ou 15 números.
            Normalmente são 6 sorteios semanais, de segunda-feira a sábado.
          </p>
          <p className="mt-4 text-xs text-white/70">
            Teste seus números para ver se teria ganho algum prêmio nos concursos anteriores, use um
            gerador inteligente para obter uma sugestão de jogo e confira estatísticas úteis desta
            loteria.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-white/70">
                <Trophy className="size-4" /> Último concurso
              </div>
              <p className="text-lg font-extrabold">Concurso {LAST.c}</p>
              <p className="text-sm text-white/80">{LAST.d}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-white/70">
                <CalendarDays className="size-4" /> Próximo concurso
              </div>
              <p className="text-lg font-extrabold">Concurso {META.proximoConcurso}</p>
              <p className="text-sm text-white/80">{META.dataProximoConcurso}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-white/70">
                <Banknote className="size-4" /> Prêmio estimado
              </div>
              <p className="text-lg font-extrabold">
                {formatCurrency(META.valorEstimadoProximoConcurso)}
              </p>
              <p className="text-sm text-white/80">para quem acertar 15 números</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-10 sm:py-12">
        {/* CHECKER */}
        <section className="scroll-mt-20">
            <div className="mb-4">
              <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                Eu já teria ganho algum prêmio?
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Escolha de 15 a 20 números para verificarmos se você ganharia algo nos concursos
                anteriores.
              </p>
            </div>
            <Volante />
          </section>

          {/* MY GAMES */}
          <section className="scroll-mt-20">
            <MeusJogos />
          </section>

        {/* GENERATOR */}
        <section className="scroll-mt-20">
          <div className="mb-4">
            <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
              Gerador de jogos
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Criamos este gerador de jogos para a Lotofácil. Caso você queira alguma sugestão de
              jogo, clique no botão abaixo para gerar uma combinação e boa sorte!
            </p>
          </div>
          <GameGenerator context={generatorContext} />
        </section>

        {/* FECHAMENTOS */}
        <section className="scroll-mt-20">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                Fechamentos
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Cubra de 16 a 20 dezenas com poucos jogos e garanta 13, 14 ou 15 acertos quando as
                sorteadas estiverem entre as suas escolhas.
              </p>
            </div>
            <Link
              href="/fechamentos"
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-[#930089] hover:text-[#930089] dark:border-zinc-700 dark:text-zinc-300"
            >
              Abrir gerador <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>

        {/* LAST RESULTS */}
        <section className="scroll-mt-20">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                Últimos resultados
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Atualizamos periodicamente o nosso banco de dados com os números sorteados na
                Lotofácil. Abaixo listamos os resultados dos três últimos concursos.
              </p>
            </div>
            <Link
              href="/resultados"
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-[#930089] hover:text-[#930089] dark:border-zinc-700 dark:text-zinc-300"
            >
              Ver mais resultados <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {last3.map((r) => (
              <div
                key={r.c}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <p className="mb-3 text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  Concurso {r.c} <span className="font-medium text-zinc-400">(de {r.d})</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {r.z.map((n) => (
                    <ResultBall key={n} n={n} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MOST FREQUENT + DELAYED */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="size-5 text-[#930089]" />
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Números mais sorteados
              </h3>
            </div>
            <ul className="space-y-3">
              {frequent.map((f) => (
                <li key={f.number} className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#930089] text-xs font-bold text-white">
                    {pad2(f.number)}
                  </span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#a0008f] to-[#d84acb]"
                      style={{ width: `${(f.count / maxFrequent) * 100}%` }}
                    />
                  </div>
                  <span className="w-24 shrink-0 text-right text-sm text-zinc-600 dark:text-zinc-400">
                    Saiu <strong className="text-zinc-900 dark:text-zinc-100">{f.count}</strong>{" "}
                    vezes
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/frequentes"
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#930089] hover:underline"
            >
              Ver lista completa <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center gap-2">
              <Clock4 className="size-5 text-[#930089]" />
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Números mais atrasados
              </h3>
            </div>
            <ul className="space-y-3">
              {delayed.map((f) => (
                <li key={f.number} className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-white">
                    {pad2(f.number)}
                  </span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-zinc-500 to-zinc-700"
                      style={{ width: `${(f.delay / maxDelay) * 100}%` }}
                    />
                  </div>
                  <span className="w-32 shrink-0 text-right text-sm text-zinc-600 dark:text-zinc-400">
                    Não sai há <strong className="text-zinc-900 dark:text-zinc-100">{f.delay}</strong>{" "}
                    concurso{f.delay === 1 ? "" : "s"}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
              Comparando com o concurso {LAST.c} (de {LAST.d}).
            </p>
          </div>
        </section>

        {/* LAST 10 STATS */}
        <section className="scroll-mt-20">
          <h2 className="mb-4 text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            Nos últimos 10 concursos...
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex items-center gap-2">
                <Repeat className="size-5 text-[#930089]" />
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Dezenas repetidas
                </h3>
              </div>
              <ul className="space-y-2.5">
                {repeatedStats.map((s) => (
                  <li key={s.repeated} className="flex items-center gap-3">
                    <span className="w-8 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {s.repeated}
                    </span>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#a0008f] to-[#d84acb]"
                        style={{ width: `${s.percent}%` }}
                      />
                    </div>
                    <span className="w-40 shrink-0 text-right text-sm text-zinc-600 dark:text-zinc-400">
                      <strong className="text-zinc-900 dark:text-zinc-100">
                        {Math.round(s.percent)}%
                      </strong>{" "}
                      dos concursos repetiram <strong>{s.repeated}</strong> números
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/repetidas"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#930089] hover:underline"
              >
                Ver repetidas por concurso <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex items-center gap-2">
                <Equal className="size-5 text-[#930089]" />
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Pares e ímpares
                </h3>
              </div>
              <ul className="space-y-2.5">
                {paresImparesStats.map((s) => (
                  <li key={`${s.pares}-${s.impares}`} className="flex items-center gap-3">
                    <span className="w-12 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {s.pares}p / {s.impares}i
                    </span>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#a0008f] to-[#d84acb]"
                        style={{ width: `${s.percent}%` }}
                      />
                    </div>
                    <span className="w-40 shrink-0 text-right text-sm text-zinc-600 dark:text-zinc-400">
                      <strong className="text-zinc-900 dark:text-zinc-100">
                        {Math.round(s.percent)}%
                      </strong>{" "}
                      tiveram <strong>{s.pares}</strong> pares e <strong>{s.impares}</strong> ímpares
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/pares-impares"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#930089] hover:underline"
              >
                Ver para todos os concursos <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* FREQUENCY CHART */}
        <section className="scroll-mt-20">
          <FrequencyChart />
        </section>

        {/* ODDS */}
        <section className="scroll-mt-20">
          <h2 className="mb-4 text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            Probabilidades
          </h2>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            Nosso banco de dados abrange do concurso 1 (de {FIRST.d}) até o concurso {LAST.c} (de{" "}
            {LAST.d}).
          </p>
          <OddsTabs />
        </section>
      </div>
    </main>
  );
}

