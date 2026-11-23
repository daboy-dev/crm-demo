/**
 * Demo data (D14). Idempotent: run it as often as you like, it only inserts
 * what is missing (clients by email, quotes and invoices by number).
 * Run once against production; Neon preview branches inherit it.
 *
 *   pnpm db:seed
 */
import { config } from "dotenv";
import { eq, inArray } from "drizzle-orm";
import { getDb } from "./client";
import {
  clients,
  invoiceItems,
  invoices,
  quoteItems,
  quotes,
  type InvoiceStatus,
  type QuoteStatus,
} from "./schema";

config({ path: [".env.local", ".env"], quiet: true });

type SeedLine = [
  description: string,
  quantity: number,
  unitPriceCents: number,
  taxRate: number,
];

const CLIENTS = [
  {
    name: "Lucía Fernández Ruiz",
    email: "lucia.fernandez@example.com",
    phone: "+34 611 204 318",
    company: "Estudio Alba Arquitectura",
  },
  {
    name: "Javier Moreno Castillo",
    email: "javier.moreno@example.com",
    phone: "+34 622 731 095",
    company: "Talleres Moreno",
  },
  {
    name: "Carmen Navarro Gil",
    email: "carmen.navarro@example.com",
    phone: "+34 633 418 772",
    company: "Navarro Abogados",
  },
  {
    name: "Pablo Jiménez Ortega",
    email: "pablo.jimenez@example.com",
    phone: "+34 644 905 136",
    company: null,
  },
  {
    name: "Marta Romero Delgado",
    email: "marta.romero@example.com",
    phone: "+34 655 120 487",
    company: "Panadería La Espiga",
  },
  {
    name: "Sergio Torres Vidal",
    email: "sergio.torres@example.com",
    phone: null,
    company: "Torres Logística",
  },
  {
    name: "Elena Ramírez Soto",
    email: "elena.ramirez@example.com",
    phone: "+34 677 349 210",
    company: "Clínica Dental Sonríe",
  },
  {
    name: "Daniel Herrera Molina",
    email: "daniel.herrera@example.com",
    phone: "+34 688 562 903",
    company: "Herrera Reformas",
  },
  {
    name: "Laura Muñoz Prieto",
    email: "laura.munoz@example.com",
    phone: "+34 699 083 641",
    company: "Librería El Faro",
  },
  {
    name: "Alberto Díaz Santos",
    email: "alberto.diaz@example.com",
    phone: "+34 610 774 529",
    company: null,
  },
  {
    name: "Nuria Castro Peña",
    email: "nuria.castro@example.com",
    phone: "+34 621 436 870",
    company: "Castro & Peña Consultores",
  },
  {
    name: "Raúl Ortiz Marín",
    email: "raul.ortiz@example.com",
    phone: "+34 632 918 054",
    company: "Bodegas Ortiz",
  },
  {
    name: "Isabel Rubio Campos",
    email: "isabel.rubio@example.com",
    phone: "+34 643 207 615",
    company: "Escuela de Idiomas Babel",
  },
  {
    name: "Andrés Molina Vega",
    email: "andres.molina@example.com",
    phone: null,
    company: "Gimnasio Atlas",
  },
  {
    name: "Sofía Gallego León",
    email: "sofia.gallego@example.com",
    phone: "+34 665 851 392",
    company: "Floristería Jazmín",
  },
];

type SeedQuote = {
  number: string;
  clientEmail: string;
  status: QuoteStatus;
  issuedAt: string;
  notes: string | null;
  items: SeedLine[];
  invoice?: {
    number: string;
    status: InvoiceStatus;
    issuedAt: string;
    dueAt: string;
  };
};

// Today in the demo is late November 2026: invoices due before then and
// still pending are overdue on purpose (not flagged; see D14).
const QUOTES: SeedQuote[] = [
  {
    number: "P-2026-001",
    clientEmail: "lucia.fernandez@example.com",
    status: "accepted",
    issuedAt: "2026-07-02",
    notes: "Rediseño de la web del estudio.",
    items: [
      ["Diseño de la web", 1, 180000, 21],
      ["Desarrollo y maquetación", 1, 240000, 21],
      ["Hosting anual", 1, 12000, 21],
    ],
    invoice: {
      number: "F-2026-001",
      status: "paid",
      issuedAt: "2026-07-20",
      dueAt: "2026-08-19",
    },
  },
  {
    number: "P-2026-002",
    clientEmail: "javier.moreno@example.com",
    status: "accepted",
    issuedAt: "2026-08-05",
    notes: null,
    items: [
      ["Mantenimiento de equipos informáticos", 6, 4500, 21],
      ["Licencias de antivirus", 6, 3500, 21],
    ],
    invoice: {
      number: "F-2026-002",
      status: "pending",
      issuedAt: "2026-08-20",
      dueAt: "2026-09-19",
    },
  },
  {
    number: "P-2026-003",
    clientEmail: "carmen.navarro@example.com",
    status: "rejected",
    issuedAt: "2026-08-18",
    notes: "El cliente ha elegido otro proveedor.",
    items: [["Auditoría de protección de datos", 1, 150000, 21]],
  },
  {
    number: "P-2026-004",
    clientEmail: "marta.romero@example.com",
    status: "accepted",
    issuedAt: "2026-09-01",
    notes: "Campaña de otoño.",
    items: [
      ["Diseño de cartelería", 4, 9000, 21],
      ["Impresión de folletos (500 uds.)", 2, 8500, 21],
    ],
    invoice: {
      number: "F-2026-003",
      status: "paid",
      issuedAt: "2026-09-10",
      dueAt: "2026-10-10",
    },
  },
  {
    number: "P-2026-005",
    clientEmail: "sergio.torres@example.com",
    status: "accepted",
    issuedAt: "2026-09-22",
    notes: null,
    items: [
      ["Consultoría de rutas de reparto", 12, 7500, 21],
      ["Formación al equipo", 1, 60000, 21],
    ],
    invoice: {
      number: "F-2026-004",
      status: "pending",
      issuedAt: "2026-10-01",
      dueAt: "2026-10-31",
    },
  },
  {
    number: "P-2026-006",
    clientEmail: "elena.ramirez@example.com",
    status: "sent",
    issuedAt: "2026-10-08",
    notes: "Pendiente de respuesta de la clínica.",
    items: [
      ["Sistema de citas online", 1, 95000, 21],
      ["Soporte mensual", 12, 4000, 21],
    ],
  },
  {
    number: "P-2026-007",
    clientEmail: "laura.munoz@example.com",
    status: "accepted",
    issuedAt: "2026-10-15",
    notes: null,
    items: [
      ["Libros de texto para el catálogo", 40, 1850, 4],
      ["Estanterías", 3, 21000, 21],
    ],
    invoice: {
      number: "F-2026-005",
      status: "pending",
      issuedAt: "2026-11-10",
      dueAt: "2026-12-10",
    },
  },
  {
    number: "P-2026-008",
    clientEmail: "daniel.herrera@example.com",
    status: "draft",
    issuedAt: "2026-10-27",
    notes: "Falta confirmar medidas de la cocina.",
    items: [
      ["Reforma de cocina", 1, 620000, 10],
      ["Retirada de escombros", 1, 35000, 21],
    ],
  },
  {
    number: "P-2026-009",
    clientEmail: "raul.ortiz@example.com",
    status: "sent",
    issuedAt: "2026-11-03",
    notes: null,
    items: [
      ["Etiquetas de vino", 2000, 35, 21],
      ["Diseño de etiqueta", 1, 45000, 21],
    ],
  },
  {
    number: "P-2026-010",
    clientEmail: "nuria.castro@example.com",
    status: "accepted",
    issuedAt: "2026-11-12",
    notes: "Aceptado por email; falta facturar.",
    items: [
      ["Taller de liderazgo", 2, 120000, 21],
      ["Material del taller", 25, 1500, 21],
    ],
  },
  {
    number: "P-2026-011",
    clientEmail: "isabel.rubio@example.com",
    status: "rejected",
    issuedAt: "2026-11-14",
    notes: null,
    items: [["Traducción de contenidos web", 8000, 6, 21]],
  },
  {
    number: "P-2026-012",
    clientEmail: "andres.molina@example.com",
    status: "draft",
    issuedAt: "2026-11-18",
    notes: null,
    items: [
      ["Máquinas de cardio", 3, 185000, 21],
      ["Instalación", 1, 25000, 21],
    ],
  },
  {
    number: "P-2026-013",
    clientEmail: "sofia.gallego@example.com",
    status: "sent",
    issuedAt: "2026-11-20",
    notes: "Decoración floral para evento de empresa.",
    items: [
      ["Centros de mesa", 20, 3500, 10],
      ["Montaje y transporte", 1, 15000, 21],
    ],
  },
  {
    number: "P-2026-014",
    clientEmail: "pablo.jimenez@example.com",
    status: "draft",
    issuedAt: "2026-11-23",
    notes: null,
    items: [["Clases particulares de guitarra", 10, 2500, 0]],
  },
];

const toItems = (lines: SeedLine[]) =>
  lines.map(([description, quantity, unitPrice, taxRate]) => ({
    description,
    quantity,
    unitPrice,
    taxRate,
  }));

async function main() {
  const db = getDb();

  const newClients = await db
    .insert(clients)
    .values(CLIENTS)
    .onConflictDoNothing({ target: clients.email })
    .returning({ id: clients.id });

  const clientRows = await db
    .select({ id: clients.id, email: clients.email })
    .from(clients)
    .where(
      inArray(
        clients.email,
        CLIENTS.map((c) => c.email),
      ),
    );
  const clientId = new Map(clientRows.map((c) => [c.email, c.id]));

  let newQuotes = 0;
  let newInvoices = 0;
  for (const seed of QUOTES) {
    const id = clientId.get(seed.clientEmail);
    if (!id) throw new Error(`Missing client ${seed.clientEmail}`);

    // Insert-or-skip by number, then add lines only if the document has
    // none: re-running never duplicates, and a half-finished run is completed.
    const inserted = await db
      .insert(quotes)
      .values({
        number: seed.number,
        clientId: id,
        status: seed.status,
        issuedAt: seed.issuedAt,
        notes: seed.notes,
      })
      .onConflictDoNothing({ target: quotes.number })
      .returning({ id: quotes.id });
    newQuotes += inserted.length;
    const [quote] = await db
      .select({ id: quotes.id })
      .from(quotes)
      .where(eq(quotes.number, seed.number));
    if (!quote) throw new Error(`Missing quote ${seed.number}`);
    const hasQuoteItems = await db
      .select({ id: quoteItems.id })
      .from(quoteItems)
      .where(eq(quoteItems.quoteId, quote.id))
      .limit(1);
    if (hasQuoteItems.length === 0) {
      await db
        .insert(quoteItems)
        .values(
          toItems(seed.items).map((item) => ({ ...item, quoteId: quote.id })),
        );
    }

    if (!seed.invoice) continue;
    const insertedInvoice = await db
      .insert(invoices)
      .values({ ...seed.invoice, quoteId: quote.id, clientId: id })
      .onConflictDoNothing()
      .returning({ id: invoices.id });
    newInvoices += insertedInvoice.length;
    const [invoice] = await db
      .select({ id: invoices.id })
      .from(invoices)
      .where(eq(invoices.quoteId, quote.id));
    if (!invoice) throw new Error(`Missing invoice ${seed.invoice.number}`);
    const hasInvoiceItems = await db
      .select({ id: invoiceItems.id })
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, invoice.id))
      .limit(1);
    if (hasInvoiceItems.length === 0) {
      await db.insert(invoiceItems).values(
        toItems(seed.items).map((item) => ({
          ...item,
          invoiceId: invoice.id,
        })),
      );
    }
  }

  console.log(
    `Seed done: ${newClients.length} clients, ${newQuotes} quotes, ${newInvoices} invoices inserted.`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
