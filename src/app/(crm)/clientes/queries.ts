import { asc, desc, eq, ilike, or } from "drizzle-orm";
import { getDb } from "@/db/client";
import { clients, invoices, quotes } from "@/db/schema";

export async function listClients(search?: string) {
  const query = getDb().select().from(clients);
  
  if (search && search.trim() !== "") {
    const pattern = `%${search.trim()}%`;
    return query
      .where(or(ilike(clients.name, pattern), ilike(clients.email, pattern)))
      .orderBy(asc(clients.name));
  }

  return query.orderBy(asc(clients.name));
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

export const simulatedTypeError: number = "pr-check debe devolver este error";
