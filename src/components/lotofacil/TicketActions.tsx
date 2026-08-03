"use client";

import { useEffect, useState } from "react";
import { BookmarkCheck, Printer, Share2, Check, X, Copy } from "lucide-react";
import { addSavedGame } from "@/lib/jogos-store";
import { formatTicket, formatTicketText, pad2 } from "@/lib/lotofacil";

export function SaveGameBtn({ numbers, source }: { numbers: number[]; source?: string }) {
  const [saved, setSaved] = useState(false);

  const save = () => {
    addSavedGame(numbers, source);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={save}
      title="Salvar em Meus jogos"
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition ${
        saved
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
          : "border border-zinc-300 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      }`}
    >
      {saved ? <Check className="size-3.5" /> : <BookmarkCheck className="size-3.5" />}
      {saved ? "Salvo!" : "Salvar"}
    </button>
  );
}

export function ShareTicketBtn({ numbers }: { numbers: number[] }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const text = `Meu jogo da Lotofácil: ${formatTicketText(numbers)}. Confira no Simulador Lotofácil!`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(text)}`;
  const twitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(formatTicketText(numbers));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard indisponível
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Compartilhar jogo"
        className="inline-flex items-center gap-1 rounded-full border border-zinc-300 px-2.5 py-1 text-xs font-bold text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <Share2 className="size-3.5" />
        Compartilhar
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Compartilhar jogo</h4>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="size-5" />
              </button>
            </div>
            <p className="mb-4 rounded-xl bg-zinc-100 p-3 text-sm font-bold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
              {formatTicket(numbers)}
            </p>
            <div className="flex flex-col gap-2">
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 font-bold text-white transition hover:bg-emerald-700"
              >
                <Share2 className="size-4" />
                WhatsApp
              </a>
              <a
                href={twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 font-bold text-white transition hover:bg-zinc-700"
              >
                <Share2 className="size-4" />
                X / Twitter
              </a>
              <button
                type="button"
                onClick={copy}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 px-4 py-2.5 font-bold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? "Copiado!" : "Copiar números"}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-3 w-full rounded-xl px-4 py-2 text-sm font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function PrintTicketBtn({ numbers }: { numbers: number[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const doPrint = () => {
    document.body.classList.add("printing-volante");
    window.setTimeout(() => {
      window.print();
      document.body.classList.remove("printing-volante");
    }, 100);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Imprimir volante A4"
        className="inline-flex items-center gap-1 rounded-full border border-zinc-300 px-2.5 py-1 text-xs font-bold text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <Printer className="size-3.5" />
        Imprimir
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Volante para impressão</h4>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="size-5" />
              </button>
            </div>

            <div id="print-volante-area" className="print-volante">
              <div className="rounded-xl border-2 border-zinc-300 p-4 dark:border-zinc-700">
                <div className="mb-3 flex items-center justify-between border-b-2 border-dashed pb-2">
                  <div>
                    <p className="text-sm font-extrabold uppercase tracking-wide text-[#930089]">
                      Lotofácil
                    </p>
                    <p className="text-[11px] text-zinc-500">Volante de aposta</p>
                  </div>
                  <p className="text-[11px] font-semibold text-zinc-500">
                    {new Date().toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                    <div
                      key={n}
                      className={`flex aspect-square items-center justify-center rounded-md border text-xs font-bold ${
                        numbers.includes(n)
                          ? "border-[#930089] bg-gradient-to-br from-[#a0008f] to-[#6d0070] text-white"
                          : "border-zinc-200 text-zinc-400 dark:border-zinc-700"
                      }`}
                    >
                      {pad2(n)}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
                  <span>
                    {numbers.length} dezenas · Jogo único · valor{" "}
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(3.5)}
                  </span>
                  <span className="font-bold text-zinc-700 dark:text-zinc-300">
                    {formatTicket(numbers)}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={doPrint}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#a0008f] to-[#6d0070] px-4 py-3 font-bold text-white transition hover:brightness-110"
            >
              <Printer className="size-4" />
              Imprimir volante
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function TicketNumbers({ numbers }: { numbers: number[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {numbers.map((n) => (
        <span
          key={n}
          className="inline-flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-[#a0008f] to-[#6d0070] text-[11px] font-bold text-white"
        >
          {pad2(n)}
        </span>
      ))}
    </div>
  );
}
