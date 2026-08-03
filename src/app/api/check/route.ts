import { NextResponse } from "next/server";
import { checkTicket, maybeRefresh } from "@/lib/lotofacil-data";
import { MIN_TICKET, MAX_TICKET, TOTAL_NUMBERS } from "@/lib/lotofacil";

export async function POST(req: Request) {
  maybeRefresh();
  const body = await req.json().catch(() => null);
  const numbers: unknown = body?.numbers;

  const ticket: number[] = Array.isArray(numbers)
    ? numbers
        .filter((n): n is number => typeof n === "number" && Number.isInteger(n))
        .filter((n) => n >= 1 && n <= TOTAL_NUMBERS)
    : [];

  const unique = [...new Set(ticket)];
  if (unique.length !== ticket.length || ticket.length < MIN_TICKET) {
    return NextResponse.json(
      { error: `Escolha entre ${MIN_TICKET} e ${MAX_TICKET} dezenas distintas.` },
      { status: 400 }
    );
  }
  if (ticket.length > MAX_TICKET) {
    return NextResponse.json(
      { error: `Máximo de ${MAX_TICKET} dezenas.` },
      { status: 400 }
    );
  }

  const { total, byHits } = checkTicket(ticket);
  return NextResponse.json({ total, byHits });
}
