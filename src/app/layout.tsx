import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/lotofacil/SiteHeader";
import { SiteFooter } from "@/components/lotofacil/SiteFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Simulador da Lotofácil",
  description:
    "Teste seus números nos concursos anteriores, use o gerador de jogos aleatório ou inteligente e confira estatísticas completas da Lotofácil.",
  keywords: [
    "Lotofácil",
    "simulador",
    "loterias",
    "resultados",
    "gerador de jogos",
    "probabilidades",
  ],
  openGraph: {
    title: "Simulador da Lotofácil",
    description:
      "Teste seus números, gere jogos aleatórios ou inteligentes e confira estatísticas da Lotofácil.",
    type: "website",
  },
};

const themeScript = `
(function () {
  try {
    var t = localStorage.getItem("lotofacil:theme");
    if (t !== "dark" && t !== "light") {
      t = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    if (t === "dark") document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100`}
      >
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
