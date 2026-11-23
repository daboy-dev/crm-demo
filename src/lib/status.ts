import type { InvoiceStatus, QuoteStatus } from "@/db/schema";

export const quoteStatusLabels: Record<QuoteStatus, string> = {
  draft: "Borrador",
  sent: "Enviado",
  accepted: "Aceptado",
  rejected: "Rechazado",
};

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  pending: "Pendiente",
  paid: "Pagada",
};
