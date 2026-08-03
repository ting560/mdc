// Fetches all Lotofácil historical results and writes a compact dataset
// to data/lotofacil-results.json used by the simulator.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "data");
const OUT_FILE = join(OUT_DIR, "lotofacil-results.json");

const BASE = "https://api-loterias.moleniuk.com/api/lotofacil";
const CAIXA_LATEST =
  "https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function parsePrize(premiacoes, faixa) {
  const p = (premiacoes || []).find((x) => Number(x.faixa) === faixa);
  if (!p) return null;
  return [Number(p.numeroDeGanhadores) || 0, Number(p.valor) || 0];
}

async function main() {
  const res = await fetch(BASE, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Falha ao buscar dados: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const text = buf.toString("latin1");
  const raw = JSON.parse(text);

  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error("Dados inválidos recebidos da API.");
  }

  const results = raw
    .filter((r) => Array.isArray(r.dezenas) && r.dezenas.length === 15)
    .map((r) => {
      const contest = {
        c: Number(r.concurso),
        d: String(r.data || ""),
        z: r.dezenas.map((n) => Number(n)),
      };
      const prizes = [];
      for (let faixa = 1; faixa <= 5; faixa++) {
        const p = parsePrize(r.premiacoes, faixa);
        if (p) prizes.push(p);
      }
      if (prizes.length) contest.pr = prizes;
      return contest;
    })
    .sort((a, b) => a.c - b.c);

  const last = results[results.length - 1];

  let meta = {
    dataProximoConcurso: "",
    valorEstimadoProximoConcurso: 0,
    proximoConcurso: (last?.c || 0) + 1,
    updatedAt: new Date().toISOString(),
  };

  try {
    const caixa = await fetch(CAIXA_LATEST, {
      headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
    });
    if (caixa.ok) {
      const c = await caixa.json();
      meta = {
        dataProximoConcurso: c.dataProximoConcurso || "",
        valorEstimadoProximoConcurso: c.valorEstimadoProximoConcurso || 0,
        proximoConcurso: Number(c.numeroConcursoProximo) || (last?.c || 0) + 1,
        updatedAt: new Date().toISOString(),
      };
    }
  } catch {
    // metadata opcional, mantém os valores padrão
  }

  const dataset = {
    meta,
    results,
  };

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(dataset), "utf8");

  console.log(
    `OK: ${results.length} concursos salvos (1 a ${last.c}).\n` +
      `Último concurso: ${last.c} (${last.d})\n` +
      `Próximo concurso: ${meta.proximoConcurso} (${meta.dataProximoConcurso})\n` +
      `Prêmio estimado: R$ ${Number(meta.valorEstimadoProximoConcurso).toLocaleString("pt-BR")}\n` +
      `Concurso ${last.c}: prêmio 15 acertos = R$ ${((last.pr?.[0]?.[1]) || 0).toLocaleString("pt-BR")}\n` +
      `Arquivo: ${OUT_FILE}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
