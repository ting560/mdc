"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clover, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/", label: "Simulador" },
  { href: "/fechamentos", label: "Fechamentos" },
  { href: "/resultados", label: "Resultados" },
  { href: "/frequentes", label: "Números mais sorteados" },
  { href: "/repetidas", label: "Dezenas repetidas" },
  { href: "/pares-impares", label: "Pares e ímpares" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-fuchsia-900/20 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-[#a0008f] to-[#6d0070] text-white shadow">
            <Clover className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-extrabold text-zinc-900 dark:text-zinc-100">
              Simulador Lotofácil
            </span>
            <span className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              Todos os concursos desde 2003
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm font-semibold transition",
                pathname === item.href
                  ? "bg-[#930089] text-white"
                  : "text-zinc-600 hover:bg-fuchsia-50 hover:text-[#930089] dark:text-zinc-300 dark:hover:bg-zinc-800"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-md border border-zinc-300 p-2 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300 md:hidden"
            aria-label="Menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-semibold transition",
                  pathname === item.href
                    ? "bg-[#930089] text-white"
                    : "text-zinc-700 hover:bg-fuchsia-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
