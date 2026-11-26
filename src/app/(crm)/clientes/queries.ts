import { asc, count, desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { clients, invoices, quotes, type ClientType } from "@/db/schema";

export async function listClients(type?: ClientType) {
  const query = getDb().select().from(clients);
  return (type ? query.where(eq(clients.type, type)) : query).orderBy(
    asc(clients.name),
  );
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
