import { z } from "zod";
import { quoteStatus } from "@/db/schema";
import { parseEurToCents } from "@/lib/money";

/** IVA rates offered in the form, in whole %. */
export const TAX_RATES = [21, 10, 4, 0] as const;

export const quoteFields = ["clientId", "issuedAt", "notes"] as const;

const itemSchema = z.object({
  description: z.string().trim().min(1, "Describe la línea."),
  quantity: z.coerce
    .number<string>("Cantidad no válida.")
    .int("La cantidad debe ser un número entero.")
    .min(1, "La cantidad mínima es 1."),
  unitPrice: z.string().transform((value, ctx) => {
    const cents = parseEurToCents(value);
    if (cents === null) {
      ctx.addIssue({ code: "custom", message: "Precio no válido." });
      return z.NEVER;
    }
    return cents;
  }),
  taxRate: z.coerce
    .number<string>()
    .refine((rate) => (TAX_RATES as readonly number[]).includes(rate), {
      message: "IVA no válido.",
    }),
});

export const quoteSchema = z.object({
  clientId: z.coerce
    .number<string>("Elige un cliente.")
    .int()
    .positive("Elige un cliente."),
  issuedAt: z.iso.date("Fecha no válida."),
  notes: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value)),
  items: z.array(itemSchema).min(1, "Añade al menos una línea."),
});

export type QuoteInput = z.infer<typeof quoteSchema>;

/** Reads the repeated line inputs (same name per row) from the form. */
export function readItems(formData: FormData) {
  const get = (name: string) => formData.getAll(name).map(String);
  const descriptions = get("description");
  const quantities = get("quantity");
  const unitPrices = get("unitPrice");
  const taxRates = get("taxRate");
  return descriptions.map((description, i) => ({
    description,
    quantity: quantities[i] ?? "",
    unitPrice: unitPrices[i] ?? "",
    taxRate: taxRates[i] ?? "",
  }));
}

export const statusSchema = z.enum(quoteStatus.enumValues);
