import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            Simulador da Lotofácil
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400">
            <Link href="/fechamentos" className="transition hover:text-[#930089]">
              Fechamentos
            </Link>
            <Link href="/resultados" className="transition hover:text-[#930089]">
              Resultados
            </Link>
            <Link href="/frequentes" className="transition hover:text-[#930089]">
              Números mais sorteados
            </Link>
            <Link href="/repetidas" className="transition hover:text-[#930089]">
              Dezenas repetidas
            </Link>
            <Link href="/pares-impares" className="transition hover:text-[#930089]">
              Pares e ímpares
            </Link>
          </div>
          <p className="max-w-2xl text-xs leading-relaxed text-zinc-400 dark:text-zinc-500">
            Este site é apenas um simulador e não possui vínculo com a Caixa Econômica Federal. As
            probabilidades aqui apresentadas seguem as regras oficiais da Lotofácil e não garantem
            resultados. Jogue com responsabilidade.
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            © {new Date().getFullYear()} Simulador da Lotofácil. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
