import type { Metadata } from "next";
import { FechamentoGenerator } from "@/components/lotofacil/FechamentoGenerator";
import { Grid3x3 } from "lucide-react";
import { maybeRefresh } from "@/lib/lotofacil-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fechamentos da Lotofácil",
  description:
    "Crie fechamentos inteligentes da Lotofácil: escolha de 16 a 20 dezenas e garanta prêmios de 13, 14 ou 15 acertos com poucos jogos.",
};

export default async function FechamentosPage() {
  await maybeRefresh();
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
          <Grid3x3 className="size-6 text-[#930089]" />
          Gerador de Fechamentos
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Um fechamento é uma técnica matemática para cobrir muitas combinações com poucos jogos.
          Escolha de 16 a 20 dezenas (o fechamento garante que o jogo sorteado esteja totalmente
          contido), selecione a garantia desejada e nós montamos o conjunto de apostas.
        </p>
      </div>

      <FechamentoGenerator />

      <section className="mt-10 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Como funciona?
        </h2>
        <div className="grid gap-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:grid-cols-3">
          <div>
            <p className="mb-1 font-bold text-[#930089]">1. Escolha as dezenas</p>
            <p>
              Selecione entre 16 e 20 números. As 15 dezenas sorteadas estarão todas dentro do seu
              conjunto (se você não errar nenhuma das escolhas).
            </p>
          </div>
          <div>
            <p className="mb-1 font-bold text-[#930089]">2. Defina a garantia</p>
            <p>
              Garantia 13/14 significa que, se as 15 sorteadas estiverem no seu grupo, pelo menos um
              jogo fará 13 ou 14 pontos. Garantia 15 usa todas as combinações possíveis.
            </p>
          </div>
          <div>
            <p className="mb-1 font-bold text-[#930089]">3. Salve e confira</p>
            <p>
              Guarde os jogos em &quot;Meus jogos&quot; e confira no último concurso quando quiser.
              Você também pode compartilhar e imprimir cada volante.
            </p>
          </div>
        </div>
        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          Atenção: este simulador não realiza apostas. Nenhuma garantia de prêmio existe na loteria
          real; o fechamento apenas otimiza a cobertura das combinações dentro das suas escolhas.
        </p>
      </section>
    </main>
  );
}
