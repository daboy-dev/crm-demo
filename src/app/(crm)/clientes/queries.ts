import { asc, count, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { clients, invoices, quotes, type ClientType } from "@/db/schema";

export type ClientSort = "nombre" | "recientes";

export async function listClients(type?: ClientType, orden?: string) {
  const query = getDb().select().from(clients);
  const filtered = type ? query.where(eq(clients.type, type)) : query;
  if (orden === "recientes") {
    return filtered.orderBy(desc(clients.createdAt), desc(clients.id));
  }
  return filtered.orderBy(asc(sql`lower(${clients.name})`), asc(clients.id));
}

/** Clients for a <select>: id and display name only. */
export async function listClientOptions() {
  return getDb()
    .select({ id: clients.id, name: clients.name, company: clients.company })
    .from(clients)
    .orderBy(asc(clients.name));
}

export async function getClient(id: number) {
  const [client] = await getDb()
    .select()
    .from(clients)
    .where(eq(clients.id, id));
  return client ?? null;
}

/** Number of quotes a client has. */
export async function countClientQuotes(id: number) {
  const [row] = await getDb()
    .select({ value: count() })
    .from(quotes)
    .where(eq(quotes.clientId, id));
  return row?.value ?? 0;
}

/** A client with its quotes and invoices, newest first. */
export async function getClientWithDocuments(id: number) {
  const client = await getDb().query.clients.findFirst({
    where: eq(clients.id, id),
    with: {
      quotes: { orderBy: [desc(quotes.issuedAt), desc(quotes.id)] },
      invoices: { orderBy: [desc(invoices.issuedAt), desc(invoices.id)] },
    },
  });
  return client ?? null;
}
