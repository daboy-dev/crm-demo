import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { clients, invoices, quotes } from "@/db/schema";

export async function listClients() {
  return getDb().select().from(clients).orderBy(asc(clients.name));
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
